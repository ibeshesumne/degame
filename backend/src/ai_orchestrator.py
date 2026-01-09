"""
AI Orchestrator for managing AI interactions.
Handles prompt building, model routing, and response normalization.
"""
import os
from typing import Dict, List, Optional, Any, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .analytics_engine import AnalyticsEngine
    from .models import PayoffMatrix, EquilibriumResult

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from .models import (
    GameState, Player, Strategy, AIPrompt, AIResponse,
    AIRole, AIModel, MoveType, PayoffMatrix, EquilibriumResult
)


def _load_api_key_from_file():
    """Try to load API key from chatapi.zshrc file."""
    api_key_file = os.path.join(os.path.dirname(__file__), "chatapi.zshrc")
    if os.path.exists(api_key_file) and not os.getenv("OPENAI_API_KEY"):
        try:
            with open(api_key_file, 'r') as f:
                api_key = f.read().strip()
                if api_key:
                    os.environ['OPENAI_API_KEY'] = api_key
                    return True
        except Exception:
            pass
    return False

_load_api_key_from_file()


class AIOrchestrator:
    """Orchestrates AI interactions across multiple models."""
    
    def __init__(self):
        """Initialize AI clients with timeout configuration."""
        self.openai_client = None
        self.anthropic_client = None
        self.ai_timeout = 60.0  # 60 second timeout for AI requests
        
        if OPENAI_AVAILABLE:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                # Initialize OpenAI client with timeout
                self.openai_client = OpenAI(
                    api_key=api_key,
                    timeout=self.ai_timeout
                )
        
        if ANTHROPIC_AVAILABLE:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if api_key:
                # Initialize Anthropic client with timeout
                self.anthropic_client = Anthropic(
                    api_key=api_key,
                    timeout=self.ai_timeout
                )
    
    def process_prompt(
        self,
        prompt: AIPrompt,
        game_state: GameState,
        analytics_engine: Optional['AnalyticsEngine'] = None
    ) -> AIResponse:
        """
        Process an AI prompt and return response.
        
        Args:
            prompt: The prompt request
            game_state: Current game state
            analytics_engine: Optional analytics engine for Nash equilibrium computation
            
        Returns:
            AI response
        """
        # Build the prompt text (now includes equilibria if available)
        prompt_text = self._build_prompt(prompt, game_state, analytics_engine)
        
        # Route to appropriate model
        response_text = self._route_to_model(prompt.model, prompt_text, prompt.role)
        
        # Parse and normalize response
        analysis = self._parse_response(response_text, prompt.role)
        
        return AIResponse(
            prompt_id=f"prompt_{datetime.now().timestamp()}",
            model=prompt.model,
            role=prompt.role,
            response_text=response_text,
            analysis=analysis,
            triggered_by=prompt.triggered_by
        )
    
    def _build_prompt(
        self,
        prompt: AIPrompt,
        game_state: GameState,
        analytics_engine: Optional['AnalyticsEngine'] = None
    ) -> str:
        """Build the full prompt text."""
        base_prompt = prompt.prompt_text or ""
        
        # Add role-specific instructions
        role_instructions = self._get_role_instructions(prompt.role)
        
        # Check if this is a general question (not about the current game)
        # User can explicitly set general_analysis flag, or we auto-detect
        is_general_question = prompt.general_analysis or prompt.context.get("general_analysis", False) or self._is_general_question(base_prompt, game_state)
        
        if is_general_question and prompt.role == AIRole.ANALYST:
            # For general questions, provide game theory framework without forcing current game context
            return f"""{role_instructions}

USER QUESTION:
{base_prompt}

ANALYSIS FRAMEWORK:
Analyze this question using game theory. Consider:
- Who are the strategic players/stakeholders?
- What are their possible strategies and payoffs?
- What Nash equilibria exist?
- Are there better outcomes that are unstable?
- What would rational players do?

Provide a game-theoretic analysis of the question, regardless of whether it relates to the current game session."""
        else:
            # For game-specific questions, include current game context WITH equilibria
            context = self._build_game_context(game_state, analytics_engine)
            return f"""{role_instructions}

CURRENT GAME CONTEXT:
{context}

USER QUESTION:
{base_prompt}
"""
    
    def _is_general_question(self, prompt_text: str, game_state: GameState) -> bool:
        """Determine if the question is about a general topic vs. the current game."""
        prompt_lower = prompt_text.lower()
        
        # Check if question mentions current game players or specific game elements
        game_players = [p.name.lower() for p in game_state.players.values()]
        mentions_game_players = any(player in prompt_lower for player in game_players)
        
        # Check if question is about general topics (politics, economics, etc.)
        general_topics = [
            'venezuela', 'maduro', 'oil', 'market', 'political', 'international',
            'country', 'government', 'policy', 'economic', 'business', 'trade',
            'war', 'conflict', 'diplomacy', 'sanctions'
        ]
        mentions_general_topic = any(topic in prompt_lower for topic in general_topics)
        
        # If it mentions general topics but not current game players, it's a general question
        return mentions_general_topic and not mentions_game_players
    
    def _build_game_context(
        self, 
        game_state: GameState,
        analytics_engine: Optional['AnalyticsEngine'] = None
    ) -> str:
        """Build game context string with Nash equilibrium data."""
        players_info = []
        for player_id, player in game_state.players.items():
            players_info.append(
                f"- {player.name} (ID: {player_id}, Type: {player.type.value}, "
                f"Role: {player.role or 'N/A'})"
            )
        
        recent_strategies = game_state.strategies[-5:] if game_state.strategies else []
        strategies_info = "\n".join([
            f"- Round {s.round}: {s.player_id} chose {s.move_type.value}"
            for s in recent_strategies
        ]) if recent_strategies else "None"
        
        # Build payoff matrix section
        payoff_matrix_section = ""
        if game_state.payoff_matrix:
            payoff_matrix_section = self._format_payoff_matrix(game_state.payoff_matrix)
        
        # Build Nash equilibrium section
        equilibria_section = ""
        if analytics_engine and game_state.payoff_matrix:
            try:
                equilibrium_result = analytics_engine.compute_nash_equilibrium(game_state)
                equilibria_section = self._format_equilibrium_data(equilibrium_result)
            except Exception as e:
                equilibria_section = f"\n[Note: Could not compute equilibria: {str(e)}]"
        
        return f"""GAME CONTEXT:
- Game ID: {game_state.game_id}
- Current Round: {game_state.round}
- Players:
{chr(10).join(players_info)}

RECENT STRATEGIES:
{strategies_info}

{payoff_matrix_section}

{equilibria_section}
"""
    
    def _get_role_instructions(self, role: AIRole) -> str:
        """Get role-specific instructions."""
        instructions = {
            AIRole.PLAYER: "You are a strategic player in a game-theoretic scenario. Analyze the situation and recommend the best strategic move.",
            AIRole.ANALYST: """You are a game theory analyst. Your task is to analyze ANY question or scenario through the lens of game theory and Nash equilibrium.

IMPORTANT: The user may ask about ANY topic (politics, economics, international relations, business, etc.). Your job is to:
1. Identify the strategic players/stakeholders in the scenario
2. Identify their possible strategies/actions
3. Analyze the payoffs and incentives for each player
4. Determine Nash equilibria (stable strategy combinations where no player can improve by unilaterally changing)
5. Explain what rational players would do and why
6. Discuss whether the Nash equilibrium leads to optimal outcomes (or if there's a better outcome that's unstable)

Frame your analysis using game theory concepts: dominant strategies, best responses, Nash equilibrium, Pareto efficiency, prisoner's dilemma patterns, etc.

Even if the question seems unrelated to the current game, analyze it through game theory principles.""",
            AIRole.REFEREE: "You are a neutral referee. Evaluate moves objectively and identify any rule violations or strategic insights.",
            AIRole.ETHICAL_REVIEWER: "You are an ethical reviewer. Evaluate moves from an ethical and social welfare perspective, considering game-theoretic implications.",
            AIRole.FAST_SIMULATION: "You are a fast simulation engine. Quickly predict likely outcomes of strategies using game theory principles."
        }
        return instructions.get(role, "You are an AI assistant helping with game-theoretic analysis.")
    
    def _route_to_model(
        self,
        model: AIModel,
        prompt_text: str,
        role: AIRole
    ) -> str:
        """Route prompt to appropriate model."""
        if model.value.startswith("openai:"):
            return self._call_openai(model, prompt_text, role)
        elif model.value.startswith("anthropic:"):
            return self._call_anthropic(model, prompt_text, role)
        elif model.value.startswith("local:"):
            return self._call_local(model, prompt_text, role)
        else:
            raise ValueError(f"Unknown model: {model}")
    
    def _call_openai(
        self,
        model: AIModel,
        prompt_text: str,
        role: AIRole
    ) -> str:
        """Call OpenAI API with timeout handling."""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized. Set OPENAI_API_KEY.")
        
        model_name = model.value.replace("openai:", "")
        
        try:
            # Timeout is set on client initialization, but can also be passed here
            response = self.openai_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": self._get_role_instructions(role)},
                    {"role": "user", "content": prompt_text}
                ],
                temperature=0.7,
                max_tokens=2000,
                timeout=self.ai_timeout
            )
            
            return response.choices[0].message.content
        except Exception as e:
            error_msg = str(e)
            if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
                raise ValueError("AI request timed out. The AI service is taking too long to respond. Please try again.")
            elif "rate limit" in error_msg.lower():
                raise ValueError("AI service rate limit exceeded. Please wait a moment and try again.")
            elif "authentication" in error_msg.lower() or "api key" in error_msg.lower():
                raise ValueError("AI service authentication failed. Please check your API key configuration.")
            else:
                raise ValueError(f"AI service error: {error_msg}")
    
    def _call_anthropic(
        self,
        model: AIModel,
        prompt_text: str,
        role: AIRole
    ) -> str:
        """Call Anthropic API with timeout handling."""
        if not self.anthropic_client:
            raise ValueError("Anthropic client not initialized. Set ANTHROPIC_API_KEY.")
        
        model_name = model.value.replace("anthropic:", "")
        
        try:
            # Timeout is set on client initialization
            response = self.anthropic_client.messages.create(
                model=model_name,
                max_tokens=2000,
                temperature=0.7,
                timeout=self.ai_timeout,
                messages=[
                    {"role": "user", "content": f"{self._get_role_instructions(role)}\n\n{prompt_text}"}
                ]
            )
            
            return response.content[0].text
        except Exception as e:
            error_msg = str(e)
            if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
                raise ValueError("AI request timed out. The AI service is taking too long to respond. Please try again.")
            elif "rate limit" in error_msg.lower():
                raise ValueError("AI service rate limit exceeded. Please wait a moment and try again.")
            elif "authentication" in error_msg.lower() or "api key" in error_msg.lower():
                raise ValueError("AI service authentication failed. Please check your API key configuration.")
            else:
                raise ValueError(f"AI service error: {error_msg}")
    
    def _call_local(
        self,
        model: AIModel,
        prompt_text: str,
        role: AIRole
    ) -> str:
        """Call local model (placeholder for Ollama or similar)."""
        # This would integrate with Ollama or similar local model
        return f"[Local model {model.value} response - not implemented]"
    
    def _parse_response(
        self,
        response_text: str,
        role: AIRole
    ) -> Dict[str, Any]:
        """Parse and normalize AI response."""
        # Basic parsing - can be enhanced
        analysis = {
            "raw_response": response_text,
            "role": role.value,
            "parsed": False
        }
        
        # Try to extract structured information based on role
        if role == AIRole.ANALYST:
            # Try to extract best response recommendation
            if "best response" in response_text.lower():
                analysis["has_best_response"] = True
        
        return analysis
    
    def generate_strategy_for_player(
        self,
        player: Player,
        game_state: GameState,
        model: AIModel = AIModel.OPENAI_GPT4
    ) -> Strategy:
        """
        Generate a strategy for an AI player.
        
        Args:
            player: The AI player
            game_state: Current game state
            model: AI model to use
            
        Returns:
            Generated strategy
        """
        prompt = AIPrompt(
            game_id=game_state.game_id,
            player_id=player.id,
            role=AIRole.PLAYER,
            model=model,
            prompt_text=f"Generate the best strategic move for {player.name} given their objectives: {', '.join(player.objectives)}",
            triggered_by="system"
        )
        
        response = self.process_prompt(prompt, game_state)
        
        # Parse strategy from response (simplified)
        # In production, this would be more sophisticated
        move_type = self._extract_move_type_from_response(response.response_text)
        
        return Strategy(
            player_id=player.id,
            move_type=move_type,
            round=game_state.round,
            ai_generated=True,
            metadata={"ai_response": response.response_text}
        )
    
    def _format_payoff_matrix(self, payoff_matrix: 'PayoffMatrix') -> str:
        """Format payoff matrix for inclusion in prompt."""
        lines = ["PAYOFF MATRIX:", ""]
        
        # Show strategies for each player
        for player_id in payoff_matrix.players:
            strategies = payoff_matrix.strategies.get(player_id, [])
            strategy_str = ", ".join([s.value for s in strategies])
            lines.append(f"{player_id} strategies: {strategy_str}")
        
        lines.append("")
        lines.append("Payoffs for each strategy combination:")
        
        # Show all payoff combinations
        for combo_key, payoffs in payoff_matrix.payoffs.items():
            payoff_str = ", ".join([
                f"{pid}: {payoff}" for pid, payoff in payoffs.items()
            ])
            lines.append(f"  {combo_key}: {payoff_str}")
        
        return "\n".join(lines)
    
    def _format_equilibrium_data(self, equilibrium_result: 'EquilibriumResult') -> str:
        """Format Nash equilibrium data for inclusion in prompt."""
        lines = ["COMPUTED NASH EQUILIBRIA:", ""]
        
        if not equilibrium_result.equilibria:
            lines.append("  No pure-strategy Nash equilibria found.")
        else:
            for i, eq in enumerate(equilibrium_result.equilibria, 1):
                strategies = eq.get("strategies", {})
                payoffs = eq.get("payoffs", {})
                
                strategy_str = ", ".join([
                    f"{pid}: {strat}" for pid, strat in strategies.items()
                ])
                payoff_str = ", ".join([
                    f"{pid}: {payoff}" for pid, payoff in payoffs.items()
                ])
                
                lines.append(f"  Equilibrium {i}:")
                lines.append(f"    Strategies: {strategy_str}")
                lines.append(f"    Payoffs: {payoff_str}")
        
        # Add dominant strategies
        if equilibrium_result.dominant_strategies:
            lines.append("")
            lines.append("DOMINANT STRATEGIES:")
            for player_id, strategy in equilibrium_result.dominant_strategies.items():
                lines.append(f"  {player_id}: {strategy.value}")
        
        # Add Pareto-efficient outcomes
        if equilibrium_result.pareto_efficient:
            lines.append("")
            lines.append("PARETO-EFFICIENT OUTCOMES:")
            for i, outcome in enumerate(equilibrium_result.pareto_efficient, 1):
                strategies = outcome.get("strategies", {})
                payoffs = outcome.get("payoffs", {})
                
                strategy_str = ", ".join([
                    f"{pid}: {strat}" for pid, strat in strategies.items()
                ])
                payoff_str = ", ".join([
                    f"{pid}: {payoff}" for pid, payoff in payoffs.items()
                ])
                
                lines.append(f"  Outcome {i}:")
                lines.append(f"    Strategies: {strategy_str}")
                lines.append(f"    Payoffs: {payoff_str}")
        
        return "\n".join(lines)
    
    def _extract_move_type_from_response(self, response_text: str) -> MoveType:
        """Extract move type from AI response (simplified)."""
        response_lower = response_text.lower()
        
        # Simple keyword matching
        if "cooperate" in response_lower or "cooperation" in response_lower:
            return MoveType.COOPERATE
        elif "defect" in response_lower or "defection" in response_lower:
            return MoveType.DEFECT
        elif "subsidize" in response_lower or "subsidy" in response_lower:
            return MoveType.SUBSIDIZE
        elif "regulate" in response_lower or "regulation" in response_lower:
            return MoveType.REGULATE
        else:
            # Default to cooperate for safety
            return MoveType.COOPERATE

