"""
Game Engine - Core logic for managing game state and moves.
Pure logic, no AI - enforces rules and computes payoffs.
"""
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
import uuid

from .models import (
    GameState, Player, Strategy, PayoffMatrix, MoveType, PlayerType
)


class GameEngine:
    """Core game engine for managing game state."""
    
    def __init__(self, game_id: str, payoff_matrix: PayoffMatrix):
        """
        Initialize game engine.
        
        Args:
            game_id: Unique game identifier
            payoff_matrix: Payoff matrix for the game
        """
        self.game_id = game_id
        self.payoff_matrix = payoff_matrix
        
        # Initialize game state
        self.game_state = GameState(
            game_id=game_id,
            round=1,
            players={},
            payoff_matrix=payoff_matrix
        )
    
    def add_player(self, player: Player):
        """Add a player to the game."""
        if player.id not in self.payoff_matrix.players:
            raise ValueError(f"Player {player.id} not in payoff matrix")
        
        self.game_state.players[player.id] = player
    
    def submit_move(
        self,
        player_id: str,
        move_type: MoveType
    ) -> bool:
        """
        Submit a move for a player.
        
        Args:
            player_id: ID of the player
            move_type: The move/strategy chosen
            
        Returns:
            True if move was accepted, False otherwise
        """
        # Validate player exists
        if player_id not in self.game_state.players:
            return False
        
        # Validate move is available for this player
        player = self.game_state.players[player_id]
        available_moves = self.payoff_matrix.strategies.get(player_id, [])
        if move_type not in available_moves:
            return False
        
        # Create strategy
        strategy = Strategy(
            player_id=player_id,
            move_type=move_type,
            round=self.game_state.round,
            timestamp=datetime.now()
        )
        
        # Store current strategy for this player
        self.game_state.current_strategies[player_id] = strategy
        
        # Add to history
        self.game_state.strategies.append(strategy)
        self.game_state.history.append({
            "round": self.game_state.round,
            "player_id": player_id,
            "move": move_type.value,
            "timestamp": strategy.timestamp.isoformat()
        })
        
        self.game_state.updated_at = datetime.now()
        
        return True
    
    def resolve_round(self) -> Dict[str, Any]:
        """
        Resolve the current round and compute payoffs.
        
        Returns:
            Dictionary with round results including payoffs
        """
        # Check if all players have submitted moves
        all_players = set(self.payoff_matrix.players)
        players_with_moves = set(self.game_state.current_strategies.keys())
        
        if all_players != players_with_moves:
            return {
                "resolved": False,
                "message": f"Waiting for moves from: {all_players - players_with_moves}"
            }
        
        # Build strategy combination key
        strategy_combo = tuple(
            self.game_state.current_strategies[pid].move_type
            for pid in self.payoff_matrix.players
        )
        
        combo_key = self._combo_to_key(strategy_combo)
        
        # Get payoffs
        if combo_key not in self.payoff_matrix.payoffs:
            return {
                "resolved": False,
                "message": f"Payoff not defined for strategy combination: {combo_key}"
            }
        
        payoffs = self.payoff_matrix.payoffs[combo_key]
        
        # Store round results
        round_result = {
            "round": self.game_state.round,
            "strategies": {
                pid: self.game_state.current_strategies[pid].move_type.value
                for pid in self.payoff_matrix.players
            },
            "payoffs": payoffs,
            "combo_key": combo_key
        }
        
        # Clear current strategies for next round
        self.game_state.current_strategies = {}
        
        # Advance round
        self.game_state.round += 1
        
        return {
            "resolved": True,
            "round_result": round_result
        }
    
    def get_current_state(self) -> GameState:
        """Get current game state."""
        return self.game_state
    
    def get_player_payoff(
        self,
        player_id: str,
        strategy_combo: Optional[Dict[str, MoveType]] = None
    ) -> Optional[float]:
        """
        Get payoff for a player given a strategy combination.
        
        Args:
            player_id: Player ID
            strategy_combo: Optional strategy combination dict (player_id -> MoveType)
                          If None, uses current strategies
        """
        if strategy_combo is None:
            if player_id not in self.game_state.current_strategies:
                return None
            
            # Build combo from current strategies
            strategy_combo = {
                pid: self.game_state.current_strategies[pid].move_type
                for pid in self.payoff_matrix.players
            }
        
        # Build combo key
        combo = tuple(
            strategy_combo[pid]
            for pid in self.payoff_matrix.players
        )
        combo_key = self._combo_to_key(combo)
        
        if combo_key not in self.payoff_matrix.payoffs:
            return None
        
        return self.payoff_matrix.payoffs[combo_key].get(player_id)
    
    def _combo_to_key(self, combo: tuple) -> str:
        """Convert strategy combination to key string."""
        return "(" + ",".join(str(s.value) for s in combo) + ")"


def create_prisoner_dilemma_game() -> Tuple[GameEngine, PayoffMatrix]:
    """
    Create a classic Prisoner's Dilemma game.
    
    Returns:
        Tuple of (GameEngine, PayoffMatrix)
    """
    game_id = f"prisoner_dilemma_{uuid.uuid4().hex[:8]}"
    
    # Define players
    players = ["player_1", "player_2"]
    
    # Define strategies
    strategies = {
        "player_1": [MoveType.COOPERATE, MoveType.DEFECT],
        "player_2": [MoveType.COOPERATE, MoveType.DEFECT]
    }
    
    # Define payoffs (classic PD: CC=3,3; CD=0,5; DC=5,0; DD=1,1)
    payoffs = {
        "(cooperate,cooperate)": {"player_1": 3, "player_2": 3},
        "(cooperate,defect)": {"player_1": 0, "player_2": 5},
        "(defect,cooperate)": {"player_1": 5, "player_2": 0},
        "(defect,defect)": {"player_1": 1, "player_2": 1}
    }
    
    payoff_matrix = PayoffMatrix(
        players=players,
        strategies=strategies,
        payoffs=payoffs
    )
    
    engine = GameEngine(game_id, payoff_matrix)
    
    return engine, payoff_matrix

