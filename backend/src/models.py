"""
Core data models for the game-theoretic platform.
"""
from typing import List, Dict, Optional, Any, Literal
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field


class PlayerType(str, Enum):
    """Type of player."""
    HUMAN = "human"
    AI = "ai"


class MoveType(str, Enum):
    """Types of moves in game theory."""
    COOPERATE = "cooperate"
    DEFECT = "defect"
    # For more complex games
    SUBSIDIZE = "subsidize"
    REGULATE = "regulate"
    INVEST = "invest"
    DELAY = "delay"
    SUPPORT = "support"
    RESIST = "resist"
    IGNORE = "ignore"


class AIRole(str, Enum):
    """Roles AI can play."""
    PLAYER = "player"
    ANALYST = "analyst"
    REFEREE = "referee"
    ETHICAL_REVIEWER = "ethical-reviewer"
    FAST_SIMULATION = "fast-simulation"


class AIModel(str, Enum):
    """Supported AI models."""
    OPENAI_GPT4 = "openai:gpt-4"
    OPENAI_GPT35 = "openai:gpt-3.5-turbo"
    ANTHROPIC_CLAUDE = "anthropic:claude"
    LOCAL_LLAMA = "local:llama"


class Player(BaseModel):
    """Represents a player in the game."""
    id: str
    name: str
    type: PlayerType
    role: Optional[str] = None  # e.g., "government", "industry", "public"
    objectives: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    resources: Dict[str, float] = Field(default_factory=dict)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "player_1",
                "name": "Government",
                "type": "human",
                "role": "government",
                "objectives": ["Maximize welfare", "Maintain stability"],
                "constraints": ["Budget limits", "Political pressure"],
                "resources": {"budget": 1000000, "influence": 0.8}
            }
        }


class Strategy(BaseModel):
    """Represents a strategy choice."""
    player_id: str
    move_type: MoveType
    round: int
    timestamp: datetime = Field(default_factory=datetime.now)
    ai_generated: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PayoffMatrix(BaseModel):
    """Payoff matrix for the game."""
    players: List[str]
    strategies: Dict[str, List[MoveType]]  # player_id -> available strategies
    payoffs: Dict[str, Dict[str, float]]  # strategy_combination -> player_id -> payoff
    # Example: {"(cooperate,cooperate)": {"player_1": 3, "player_2": 3}}


class GameState(BaseModel):
    """Current state of the game."""
    game_id: str
    round: int
    players: Dict[str, Player]
    strategies: List[Strategy] = Field(default_factory=list)
    payoff_matrix: Optional[PayoffMatrix] = None
    current_strategies: Dict[str, Strategy] = Field(default_factory=dict)  # player_id -> strategy
    history: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class AIPrompt(BaseModel):
    """AI prompt request."""
    game_id: str
    player_id: Optional[str] = None
    role: AIRole
    model: AIModel
    prompt_text: Optional[str] = None
    context: Dict[str, Any] = Field(default_factory=dict)
    triggered_by: str  # session_id who triggered this
    general_analysis: bool = Field(default=False, description="If True, analyze as general game theory question, not tied to current game")
    thread_id: Optional[str] = None  # For conversation threading
    parent_prompt_id: Optional[str] = None  # For reply chains


class AIResponse(BaseModel):
    """AI response."""
    prompt_id: str
    model: AIModel
    role: AIRole
    response_text: str
    analysis: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    triggered_by: str  # session_id who triggered this
    thread_id: Optional[str] = None
    parent_prompt_id: Optional[str] = None


class EquilibriumResult(BaseModel):
    """Nash equilibrium analysis result."""
    game_id: str
    round: int
    equilibria: List[Dict[str, Any]]  # List of equilibrium strategy combinations
    dominant_strategies: Dict[str, MoveType] = Field(default_factory=dict)
    pareto_efficient: List[Dict[str, Any]] = Field(default_factory=list)
    stability_analysis: Dict[str, Any] = Field(default_factory=dict)
    computed_at: datetime = Field(default_factory=datetime.now)


class Game(BaseModel):
    """Complete game definition."""
    id: str
    title: str
    description: str
    game_type: str  # e.g., "prisoner_dilemma", "public_policy"
    players: List[Player]
    payoff_matrix: PayoffMatrix
    state: GameState
    created_at: datetime = Field(default_factory=datetime.now)


class UserSession(BaseModel):
    """User session for multi-participant support."""
    session_id: str
    user_name: str
    game_id: str
    joined_at: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EventType(str, Enum):
    """Types of game events."""
    MOVE = "MOVE"
    PROMPT = "PROMPT"
    RESPONSE = "RESPONSE"
    ROUND_RESOLVED = "ROUND_RESOLVED"
    PLAYER_JOINED = "PLAYER_JOINED"
    PLAYER_LEFT = "PLAYER_LEFT"


class GameEvent(BaseModel):
    """Game event for tracking all actions."""
    event_id: str
    game_id: str
    event_type: EventType
    actor_session_id: str  # session_id who performed the action
    actor_name: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)
    parent_event_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

