"""
FastAPI application - API Gateway and main entry point.
"""
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from .models import (
    Player, Strategy, AIPrompt, GameState, PayoffMatrix,
    MoveType, PlayerType, AIRole, AIModel, EquilibriumResult,
    UserSession, GameEvent, EventType
)
from .game_engine import GameEngine, create_prisoner_dilemma_game
from .ai_orchestrator import AIOrchestrator
from .analytics_engine import AnalyticsEngine
from .storage import GameStorage
from .event_storage import EventStorage

app = FastAPI(title="Game-Theoretic Platform API", version="1.0.0")

# CORS middleware
# For production, allow all origins (you can restrict this later for security)
import os
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []

# Default origins for development and common hosting platforms
default_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Combine default and environment-specified origins
cors_origins = default_origins + [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

# If no specific origins set, allow all (for easier deployment - restrict in production)
if not ALLOWED_ORIGINS:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True if cors_origins != ["*"] else False,  # credentials not allowed with wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security (simplified - in production use proper JWT)
security = HTTPBearer()

# Global instances
ai_orchestrator = AIOrchestrator()
analytics_engine = AnalyticsEngine()
game_storage = GameStorage()  # JSON file-based storage
event_storage = EventStorage()  # Event and session storage

# In-memory storage (loaded from files on startup)
games: Dict[str, GameEngine] = {}

# Session management (in-memory, can be persisted)
sessions: Dict[str, UserSession] = {}  # session_id -> UserSession


def save_game(game_id: str):
    """Helper to save a game after operations."""
    if game_id in games:
        game_storage.save_game(games[game_id])


@app.on_event("startup")
async def load_games():
    """Load all saved games on server startup."""
    game_ids = game_storage.list_games()
    loaded_count = 0
    for game_id in game_ids:
        engine = game_storage.load_game(game_id)
        if engine:
            games[game_id] = engine
            loaded_count += 1
    print(f"Loaded {loaded_count} games from storage")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user (simplified - in production validate JWT)."""
    # Simplified authentication - returns session_id
    return credentials.credentials if credentials else "anonymous"

def get_or_create_session(session_id: str, user_name: Optional[str] = None, game_id: Optional[str] = None) -> UserSession:
    """Get existing session or create a new one."""
    # First check in-memory cache
    if session_id in sessions:
        session = sessions[session_id]
        # Update user_name if provided and different
        if user_name and user_name != session.user_name and game_id:
            session.user_name = user_name
            event_storage.create_session(session_id, user_name, game_id)  # Update in storage
        if game_id:
            event_storage.update_session_activity(session_id, game_id)
        return session
    
    # If not in memory, check storage for existing session
    if game_id:
        stored_sessions = event_storage.get_sessions(game_id)
        for stored_session in stored_sessions:
            if stored_session.session_id == session_id:
                # Found existing session in storage
                # Update user_name if provided and different
                if user_name and user_name != stored_session.user_name:
                    # Update the session in storage with new user_name
                    updated_session = event_storage.create_session(session_id, user_name, game_id)
                    sessions[session_id] = updated_session
                    if game_id:
                        event_storage.update_session_activity(session_id, game_id)
                    return updated_session
                sessions[session_id] = stored_session
                if game_id:
                    event_storage.update_session_activity(session_id, game_id)
                return stored_session
    
    # Create new session
    if not user_name:
        # Use last 8 characters of session_id to avoid "User_session_" issue
        # If session_id starts with "session_", use characters after the prefix
        if session_id.startswith("session_"):
            # Extract meaningful part: session_TIMESTAMP_RANDOM -> use last 8 chars
            user_name = f"User_{session_id[-8:]}"
        else:
            user_name = f"User_{session_id[:8]}"
    if not game_id:
        game_id = "general"
    
    session = event_storage.create_session(session_id, user_name, game_id)
    sessions[session_id] = session
    return session


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Game-Theoretic Platform API",
        "version": "1.0.0",
        "endpoints": {
            "games": "/game",
            "ai": "/game/ask-ai",
            "equilibria": "/game/equilibria"
        }
    }


@app.post("/game/create")
async def create_game(
    game_type: str = "prisoner_dilemma",
    user_id: str = Depends(get_current_user)
):
    """
    Create a new game.
    
    Args:
        game_type: Type of game to create
        user_id: Current session ID
    """
    if game_type == "prisoner_dilemma":
        engine, payoff_matrix = create_prisoner_dilemma_game()
        games[engine.game_id] = engine
        save_game(engine.game_id)  # Persist to disk
        
        # Create join event
        session = get_or_create_session(user_id, game_id=engine.game_id)
        event_storage.create_event(
            game_id=engine.game_id,
            event_type=EventType.PLAYER_JOINED,
            actor_session_id=user_id,
            actor_name=session.user_name,
            data={"message": "Game created"}
        )
        
        return {
            "game_id": engine.game_id,
            "game_type": game_type,
            "payoff_matrix": payoff_matrix.model_dump(),
            "message": "Game created successfully"
        }
    else:
        raise HTTPException(status_code=400, detail=f"Unknown game type: {game_type}")


@app.post("/game/{game_id}/add-player")
async def add_player(
    game_id: str,
    player: Player,
    user_id: str = Depends(get_current_user)
):
    """Add a player to the game."""
    # Try loading from storage if not in memory
    if game_id not in games:
        engine = game_storage.load_game(game_id)
        if engine:
            games[game_id] = engine
        else:
            # Check if events/sessions exist (game file might be lost on ephemeral filesystem)
            existing_events = event_storage.get_events(game_id, since=None, limit=1)
            existing_sessions = event_storage.get_sessions(game_id)
            
            if existing_events or existing_sessions:
                # Recreate game engine if events exist but game file is missing
                engine, payoff_matrix = create_prisoner_dilemma_game()
                engine.game_id = game_id
                games[game_id] = engine
                save_game(game_id)
            else:
                # Game doesn't exist - create a new one with the requested game_id
                # This handles cases where the game was lost due to ephemeral storage
                # but someone is trying to use it (e.g., from a shared game_id)
                engine, payoff_matrix = create_prisoner_dilemma_game()
                engine.game_id = game_id
                games[game_id] = engine
                save_game(game_id)
                # Create a join event for the user attempting to add a player
                session = get_or_create_session(user_id, game_id=game_id)
                event_storage.create_event(
                    game_id=game_id,
                    event_type=EventType.PLAYER_JOINED,
                    actor_session_id=user_id,
                    actor_name=session.user_name,
                    data={"message": "Game recreated and player being added"}
                )
    
    engine = games[game_id]
    engine.add_player(player)
    save_game(game_id)  # Persist to disk
    
    return {
        "message": f"Player {player.id} added to game {game_id}",
        "player": player.model_dump()
    }


@app.post("/game/{game_id}/submit-move")
async def submit_move(
    game_id: str,
    player_id: str,
    move_type: MoveType,
    user_id: str = Depends(get_current_user)
):
    """
    Submit a move for a player.
    
    Args:
        game_id: Game ID
        player_id: Player ID
        move_type: The move/strategy chosen
    """
    # Try loading from storage if not in memory
    if game_id not in games:
        engine = game_storage.load_game(game_id)
        if engine:
            games[game_id] = engine
        else:
            # Check if events/sessions exist (game file might be lost on ephemeral filesystem)
            existing_events = event_storage.get_events(game_id, since=None, limit=1)
            existing_sessions = event_storage.get_sessions(game_id)
            
            if existing_events or existing_sessions:
                # Recreate game engine if events exist but game file is missing
                engine, payoff_matrix = create_prisoner_dilemma_game()
                engine.game_id = game_id
                games[game_id] = engine
                save_game(game_id)
            else:
                raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success = engine.submit_move(player_id, move_type)
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to submit move. Check player ID and move type."
        )
    
    save_game(game_id)  # Persist to disk
    
    # Create move event
    session = get_or_create_session(user_id, game_id=game_id)
    event_storage.create_event(
        game_id=game_id,
        event_type=EventType.MOVE,
        actor_session_id=user_id,
        actor_name=session.user_name,
        data={
            "player_id": player_id,
            "move_type": move_type.value,
            "round": engine.game_state.round
        }
    )
    
    return {
        "message": "Move submitted successfully",
        "player_id": player_id,
        "move_type": move_type.value,
        "round": engine.game_state.round
    }


@app.post("/game/{game_id}/resolve-round")
async def resolve_round(
    game_id: str,
    user_id: str = Depends(get_current_user)
):
    """Resolve the current round and compute payoffs."""
    # Try loading from storage if not in memory
    if game_id not in games:
        engine = game_storage.load_game(game_id)
        if engine:
            games[game_id] = engine
        else:
            # Check if events/sessions exist (game file might be lost on ephemeral filesystem)
            existing_events = event_storage.get_events(game_id, since=None, limit=1)
            existing_sessions = event_storage.get_sessions(game_id)
            
            if existing_events or existing_sessions:
                # Recreate game engine if events exist but game file is missing
                engine, payoff_matrix = create_prisoner_dilemma_game()
                engine.game_id = game_id
                games[game_id] = engine
                save_game(game_id)
            else:
                raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    result = engine.resolve_round()
    
    if not result["resolved"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    save_game(game_id)  # Persist to disk
    
    # Create round resolved event
    session = get_or_create_session(user_id, game_id=game_id)
    event_storage.create_event(
        game_id=game_id,
        event_type=EventType.ROUND_RESOLVED,
        actor_session_id=user_id,
        actor_name=session.user_name,
        data={
            "round": result["round_result"]["round"],
            "payoffs": result["round_result"]["payoffs"]
        }
    )
    
    return result


@app.post("/game/ask-ai")
async def ask_ai(
    prompt: AIPrompt,
    user_id: str = Depends(get_current_user)
):
    """
    Ask AI for analysis or strategy recommendation.
    
    For general questions (not about the current game), set general_analysis=True
    or include it in the context. The AI will analyze ANY topic through game theory.
    
    Supports thread-based conversations via thread_id and parent_prompt_id.
    Multiple participants can add prompts - tracked by session_id.
    
    Args:
        prompt: AI prompt request (with optional thread_id and parent_prompt_id)
    """
    import uuid
    
    # For general analysis, game_id is optional
    if not prompt.general_analysis:
        # Try to load game if not in memory
        if prompt.game_id not in games:
            engine = game_storage.load_game(prompt.game_id)
            if engine:
                games[prompt.game_id] = engine
            else:
                # Check if events/sessions exist (game file might be lost on ephemeral filesystem)
                existing_events = event_storage.get_events(prompt.game_id, since=None, limit=1)
                existing_sessions = event_storage.get_sessions(prompt.game_id)
                
                if existing_events or existing_sessions:
                    # Recreate game engine if events exist but game file is missing
                    engine, payoff_matrix = create_prisoner_dilemma_game()
                    engine.game_id = prompt.game_id
                    games[prompt.game_id] = engine
                    save_game(prompt.game_id)
                else:
                    raise HTTPException(status_code=404, detail="Game not found")
    
    # Get game state (create minimal state for general questions if needed)
    # IMPORTANT: Always use the actual game_id for events, even for general_analysis
    # This ensures all participants see all prompts/responses for their game
    if prompt.general_analysis:
        # Create a minimal game state for general questions
        dummy_matrix = PayoffMatrix(players=[], strategies={}, payoffs={})
        dummy_engine = GameEngine("general_analysis", dummy_matrix)
        game_state = dummy_engine.get_current_state()
        analytics_engine = None  # No equilibria for general questions
        # Use the actual game_id so events are visible to all participants
        game_id_for_event = prompt.game_id
    else:
        engine = games[prompt.game_id]
        game_state = engine.get_current_state()
        analytics_engine = analytics_engine  # Use global instance
        game_id_for_event = prompt.game_id
    
    # Update triggered_by and ensure thread_id
    prompt.triggered_by = user_id
    if not prompt.thread_id:
        prompt.thread_id = f"thread_{uuid.uuid4().hex[:8]}"
    
    # Create prompt event
    session = get_or_create_session(user_id, game_id=game_id_for_event)
    prompt_event = event_storage.create_event(
        game_id=game_id_for_event,
        event_type=EventType.PROMPT,
        actor_session_id=user_id,
        actor_name=session.user_name,
        data={
            "prompt_id": f"prompt_{uuid.uuid4().hex[:8]}",
            "prompt_text": prompt.prompt_text,
            "role": prompt.role.value,
            "model": prompt.model.value,
            "thread_id": prompt.thread_id,
            "parent_prompt_id": prompt.parent_prompt_id
        }
    )
    
    # Process prompt WITH analytics engine
    response = ai_orchestrator.process_prompt(prompt, game_state, analytics_engine)
    
    # Create response event with full response text
    response_event = event_storage.create_event(
        game_id=game_id_for_event,
        event_type=EventType.RESPONSE,
        actor_session_id=user_id,
        actor_name=session.user_name,
        data={
            "prompt_id": response.prompt_id,
            "response_text": response.response_text,  # Store full response text
            "role": response.role.value,
            "model": response.model.value,
            "thread_id": prompt.thread_id,
            "parent_prompt_id": prompt.parent_prompt_id
        },
        parent_event_id=prompt_event.event_id
    )
    
    return {
        "response": response.model_dump(),
        "prompt_id": prompt_event.data.get("prompt_id"),
        "thread_id": prompt.thread_id,
        "message": "AI analysis completed"
    }


@app.post("/game/{game_id}/ai-player-move")
async def ai_player_move(
    game_id: str,
    player_id: str,
    model: AIModel = AIModel.OPENAI_GPT4,
    user_id: str = Depends(get_current_user)
):
    """
    Generate and submit a move for an AI player.
    
    Args:
        game_id: Game ID
        player_id: AI player ID
        model: AI model to use
    """
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    game_state = engine.get_current_state()
    
    if player_id not in game_state.players:
        raise HTTPException(status_code=404, detail="Player not found")
    
    player = game_state.players[player_id]
    
    if player.type != PlayerType.AI:
        raise HTTPException(status_code=400, detail="Player is not an AI player")
    
    # Generate strategy
    strategy = ai_orchestrator.generate_strategy_for_player(
        player, game_state, model
    )
    
    # Submit move
    success = engine.submit_move(player_id, strategy.move_type)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to submit AI move")
    
    save_game(game_id)  # Persist to disk
    
    return {
        "message": "AI move generated and submitted",
        "player_id": player_id,
        "move_type": strategy.move_type.value,
        "ai_analysis": strategy.metadata.get("ai_response", "")
    }


@app.get("/game/{game_id}/state")
async def get_game_state(
    game_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get current game state."""
    # Try loading from storage if not in memory
    if game_id not in games:
        engine = game_storage.load_game(game_id)
        if engine:
            games[game_id] = engine
        else:
            # Check if events/sessions exist (game file might be lost on ephemeral filesystem)
            existing_events = event_storage.get_events(game_id, since=None, limit=1)
            existing_sessions = event_storage.get_sessions(game_id)
            
            if existing_events or existing_sessions:
                # Recreate game engine if events exist but game file is missing
                engine, payoff_matrix = create_prisoner_dilemma_game()
                engine.game_id = game_id
                games[game_id] = engine
                save_game(game_id)
            else:
                raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    state = engine.get_current_state()
    
    return {
        "game_state": state.model_dump(),
        "current_strategies": {
            pid: strat.move_type.value
            for pid, strat in state.current_strategies.items()
        }
    }


@app.get("/game/{game_id}/equilibria")
async def get_equilibria(
    game_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Compute and return Nash equilibria for the game.
    
    Args:
        game_id: Game ID
    """
    # Try loading from storage if not in memory
    if game_id not in games:
        engine = game_storage.load_game(game_id)
        if engine:
            games[game_id] = engine
        else:
            # Check if events/sessions exist (game file might be lost on ephemeral filesystem)
            existing_events = event_storage.get_events(game_id, since=None, limit=1)
            existing_sessions = event_storage.get_sessions(game_id)
            
            if existing_events or existing_sessions:
                # Recreate game engine if events exist but game file is missing
                engine, payoff_matrix = create_prisoner_dilemma_game()
                engine.game_id = game_id
                games[game_id] = engine
                save_game(game_id)
            else:
                raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    game_state = engine.get_current_state()
    
    # Compute equilibria
    equilibrium_result = analytics_engine.compute_nash_equilibrium(game_state)
    
    return {
        "equilibria": equilibrium_result.model_dump(),
        "message": "Equilibrium analysis completed"
    }


@app.get("/game/{game_id}/history")
async def get_move_history(
    game_id: str,
    player_id: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    """Get move history, optionally filtered by player."""
    # Try loading from storage if not in memory
    if game_id not in games:
        engine = game_storage.load_game(game_id)
        if engine:
            games[game_id] = engine
        else:
            # Check if events/sessions exist (game file might be lost on ephemeral filesystem)
            existing_events = event_storage.get_events(game_id, since=None, limit=1)
            existing_sessions = event_storage.get_sessions(game_id)
            
            if existing_events or existing_sessions:
                # Recreate game engine if events exist but game file is missing
                engine, payoff_matrix = create_prisoner_dilemma_game()
                engine.game_id = game_id
                games[game_id] = engine
                save_game(game_id)
            else:
                raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    game_state = engine.get_current_state()
    
    history = game_state.strategies
    if player_id:
        history = [s for s in history if s.player_id == player_id]
    
    return {
        "history": [s.model_dump() for s in history],
        "total_moves": len(history)
    }


@app.get("/games")
async def list_games(user_id: str = Depends(get_current_user)):
    """List all saved games."""
    saved_games = game_storage.list_games()
    return {
        "games": saved_games,
        "count": len(saved_games),
        "in_memory": list(games.keys())
    }


@app.post("/game/{game_id}/join")
async def join_game(
    game_id: str,
    request_body: Dict[str, Any] = Body(...),
    user_id: str = Depends(get_current_user)
):
    """
    Join a game as a participant.
    
    Args:
        game_id: Game ID to join
        request_body: Request body containing optional user_name
    """
    # Extract user_name from request body
    user_name = request_body.get("user_name")
    
    # Check if game exists in memory
    if game_id not in games:
        # Try loading from storage
        engine = game_storage.load_game(game_id)
        if engine:
            games[game_id] = engine
        else:
            # Game file doesn't exist - check if events or sessions exist
            # This handles cases where game files were lost (e.g., on Render's ephemeral filesystem)
            # but events/sessions still exist
            existing_events = event_storage.get_events(game_id, since=None, limit=1)
            existing_sessions = event_storage.get_sessions(game_id)
            
            if existing_events or existing_sessions:
                # Game has history, create a new game engine to allow continuation
                # This is a fallback for when game files are lost but events exist
                engine, payoff_matrix = create_prisoner_dilemma_game()
                # Override the game_id to match the existing game
                engine.game_id = game_id
                games[game_id] = engine
                # Save the recreated game
                save_game(game_id)
            else:
                # No game file, no events, no sessions - game truly doesn't exist
                raise HTTPException(status_code=404, detail="Game not found")
    
    # Create or update session with proper user_name
    if not user_name:
        # Use last 8 characters of user_id to avoid "User_session_" issue
        if user_id.startswith("session_"):
            user_name = f"User_{user_id[-8:]}"
        else:
            user_name = f"User_{user_id[:8]}"
    
    # Check if a session with the same user_name already exists for this game
    existing_sessions = event_storage.get_sessions(game_id)
    existing_session_with_same_name = None
    session_already_exists = False
    is_device_transfer = False
    
    for existing_session in existing_sessions:
        if existing_session.user_name.lower() == user_name.lower():
            if existing_session.session_id == user_id:
                # Same session_id - just update activity (same device rejoining)
                session = existing_session
                event_storage.update_session_activity(user_id, game_id)
                sessions[user_id] = session
                session_already_exists = True
                break
            else:
                # Different session_id but same name - this is the same person on a different device
                existing_session_with_same_name = existing_session
                break
    
    # Handle session creation/transfer
    if not session_already_exists:
        if existing_session_with_same_name:
            # Transfer the session to the new device's session_id
            is_device_transfer = True
            session = event_storage.transfer_session_by_name(user_id, user_name, game_id)
            if session:
                sessions[user_id] = session
            else:
                # Fallback: create new session if transfer failed
                session = event_storage.create_session(user_id, user_name, game_id)
                sessions[user_id] = session
        else:
            # No existing session found - create a new one
            session = event_storage.create_session(user_id, user_name, game_id)
            sessions[user_id] = session
    
    # Create join event (skip if same session_id is rejoining to avoid duplicate events)
    if not session_already_exists:
        event_storage.create_event(
            game_id=game_id,
            event_type=EventType.PLAYER_JOINED,
            actor_session_id=user_id,
            actor_name=user_name,
            data={"user_name": user_name, "device_transfer": is_device_transfer}
        )
    
    return {
        "message": f"Joined game as {user_name}",
        "session_id": user_id,
        "user_name": user_name,
        "game_id": game_id
    }


@app.get("/game/{game_id}/sessions")
async def get_sessions(
    game_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get all active user sessions for a game.
    
    Args:
        game_id: Game ID
    """
    sessions_list = event_storage.get_sessions(game_id)
    return {
        "sessions": [s.model_dump(mode='json') for s in sessions_list],
        "count": len(sessions_list)
    }


@app.get("/game/{game_id}/updates")
async def get_updates(
    game_id: str,
    since: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    """
    Get game updates (events) since a timestamp.
    
    Args:
        game_id: Game ID
        since: ISO timestamp string - only return events after this time
    """
    from datetime import datetime
    
    # Parse since timestamp if provided
    since_dt = None
    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid timestamp format")
    
    # Get events
    # If since is None (initial fetch), get all events (no limit)
    # If since is provided (incremental update), limit to recent events
    if since_dt is None:
        events = event_storage.get_events(game_id, since=None, limit=None)
    else:
        events = event_storage.get_events(game_id, since=since_dt, limit=100)
    
    # Get AI responses for prompts
    responses = []
    prompt_ids = set()
    for event in events:
        if event.event_type == EventType.PROMPT:
            prompt_id = event.data.get("prompt_id")
            if prompt_id:
                prompt_ids.add(prompt_id)
    
    # Note: In a full implementation, you'd load AI responses from storage
    # For now, we'll return events with response data if available
    
    return {
        "events": [e.model_dump(mode='json') for e in events],
        "count": len(events),
        "latest_timestamp": events[-1].timestamp.isoformat() if events else None
    }


@app.get("/game/{game_id}/creator")
async def get_game_creator(
    game_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Check if the current user is the game creator.
    
    Args:
        game_id: Game ID
        user_id: Current session ID
        
    Returns:
        Object with is_creator boolean and creator_session_id
    """
    creator_session_id = event_storage.get_game_creator(game_id)
    
    return {
        "is_creator": creator_session_id == user_id,
        "creator_session_id": creator_session_id,
        "current_user_id": user_id
    }


@app.delete("/game/{game_id}/wipe")
async def wipe_game(
    game_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Permanently delete all traces of a game from the system.
    
    Only the game creator can wipe a game. This will:
    - Delete the game state file
    - Delete all events
    - Delete all sessions
    - Remove from in-memory cache
    
    After wiping, the game cannot be reopened by any participant.
    
    Args:
        game_id: Game ID to wipe
        user_id: Current session ID (must be the creator)
    """
    # Check if user is the creator
    creator_session_id = event_storage.get_game_creator(game_id)
    
    if creator_session_id is None:
        # Game might not exist or have no events
        # Check if game exists at all
        game_exists = (
            game_id in games or
            game_storage.load_game(game_id) is not None or
            event_storage.get_events(game_id, since=None, limit=1) or
            event_storage.get_sessions(game_id)
        )
        
        if not game_exists:
            raise HTTPException(status_code=404, detail="Game not found")
        else:
            raise HTTPException(
                status_code=403, 
                detail="Cannot determine game creator. Only the creator can wipe a game."
            )
    
    if creator_session_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the game creator can wipe a game"
        )
    
    # Delete all game files
    deleted_files = []
    
    # Delete game state file
    if game_storage.delete_game(game_id):
        deleted_files.append("game state")
    
    # Delete events file
    if event_storage.delete_events(game_id):
        deleted_files.append("events")
    
    # Delete sessions file
    if event_storage.delete_sessions(game_id):
        deleted_files.append("sessions")
    
    # Remove from in-memory cache
    if game_id in games:
        del games[game_id]
    
    if not deleted_files:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete game files. Game may already be deleted."
        )
    
    return {
        "message": "Game wiped successfully",
        "game_id": game_id,
        "deleted_files": deleted_files,
        "warning": "This game can no longer be accessed by any participant"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

