"""
Analytics Engine for computing Nash equilibria and game-theoretic analysis.
Non-AI mathematical analysis to ensure strategic clarity.
"""
from typing import List, Dict, Optional, Tuple, Any
from itertools import product
import numpy as np

from .models import (
    GameState, PayoffMatrix, EquilibriumResult, MoveType, Player
)


class AnalyticsEngine:
    """Engine for computing Nash equilibria and game analysis."""
    
    def compute_nash_equilibrium(
        self,
        game_state: GameState
    ) -> EquilibriumResult:
        """
        Compute Nash equilibria for the current game state.
        
        Args:
            game_state: Current game state with payoff matrix
            
        Returns:
            Equilibrium analysis result
        """
        if not game_state.payoff_matrix:
            raise ValueError("Payoff matrix not defined")
        
        payoff_matrix = game_state.payoff_matrix
        players = list(payoff_matrix.players)
        
        # Build strategy combinations
        strategy_combinations = self._get_all_strategy_combinations(
            payoff_matrix.strategies
        )
        
        # Find Nash equilibria
        equilibria = self._find_nash_equilibria(
            strategy_combinations,
            payoff_matrix,
            players
        )
        
        # Find dominant strategies
        dominant_strategies = self._find_dominant_strategies(
            payoff_matrix,
            players
        )
        
        # Find Pareto efficient outcomes
        pareto_efficient = self._find_pareto_efficient(
            strategy_combinations,
            payoff_matrix,
            players
        )
        
        # Stability analysis
        stability = self._analyze_stability(
            equilibria,
            strategy_combinations,
            payoff_matrix,
            players
        )
        
        return EquilibriumResult(
            game_id=game_state.game_id,
            round=game_state.round,
            equilibria=equilibria,
            dominant_strategies=dominant_strategies,
            pareto_efficient=pareto_efficient,
            stability_analysis=stability
        )
    
    def _get_all_strategy_combinations(
        self,
        strategies: Dict[str, List[MoveType]]
    ) -> List[Tuple[str, ...]]:
        """Get all possible strategy combinations."""
        player_ids = list(strategies.keys())
        strategy_lists = [strategies[pid] for pid in player_ids]
        
        combinations = []
        for combo in product(*strategy_lists):
            combinations.append(combo)
        
        return combinations
    
    def _find_nash_equilibria(
        self,
        strategy_combinations: List[Tuple[str, ...]],
        payoff_matrix: PayoffMatrix,
        players: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Find all Nash equilibria.
        
        A Nash equilibrium is a strategy combination where no player
        can improve their payoff by unilaterally changing their strategy.
        """
        equilibria = []
        
        for combo in strategy_combinations:
            combo_key = self._combo_to_key(combo)
            
            # Get payoffs for this combination
            if combo_key not in payoff_matrix.payoffs:
                continue
            
            payoffs = payoff_matrix.payoffs[combo_key]
            
            # Check if this is a Nash equilibrium
            is_equilibrium = True
            
            for i, player_id in enumerate(players):
                current_payoff = payoffs.get(player_id, 0)
                
                # Try all alternative strategies for this player
                player_strategies = payoff_matrix.strategies[player_id]
                
                for alt_strategy in player_strategies:
                    if alt_strategy == combo[i]:
                        continue  # Skip current strategy
                    
                    # Create alternative combination
                    alt_combo = list(combo)
                    alt_combo[i] = alt_strategy
                    alt_combo_key = self._combo_to_key(tuple(alt_combo))
                    
                    if alt_combo_key in payoff_matrix.payoffs:
                        alt_payoff = payoff_matrix.payoffs[alt_combo_key].get(player_id, 0)
                        
                        # If player can improve, not an equilibrium
                        if alt_payoff > current_payoff:
                            is_equilibrium = False
                            break
                
                if not is_equilibrium:
                    break
            
            if is_equilibrium:
                equilibria.append({
                    "strategies": {players[i]: combo[i].value for i in range(len(players))},
                    "payoffs": payoffs,
                    "key": combo_key
                })
        
        return equilibria
    
    def _find_dominant_strategies(
        self,
        payoff_matrix: PayoffMatrix,
        players: List[str]
    ) -> Dict[str, MoveType]:
        """
        Find dominant strategies for each player.
        
        A dominant strategy is one that gives a better payoff
        regardless of what other players do.
        """
        dominant = {}
        
        for player_id in players:
            player_strategies = payoff_matrix.strategies[player_id]
            other_players = [p for p in players if p != player_id]
            
            # For each strategy, check if it's always better
            for strategy in player_strategies:
                is_dominant = True
                
                # Compare against all other strategies
                for other_strategy in player_strategies:
                    if other_strategy == strategy:
                        continue
                    
                    # Check all combinations of other players' strategies
                    other_strategies = {
                        pid: payoff_matrix.strategies[pid]
                        for pid in other_players
                    }
                    
                    for other_combo in product(*other_strategies.values()):
                        # Create combo with current strategy
                        combo_with_strategy = self._create_combo(
                            players, player_id, strategy, other_combo, other_players
                        )
                        combo_with_other = self._create_combo(
                            players, player_id, other_strategy, other_combo, other_players
                        )
                        
                        key_with_strategy = self._combo_to_key(combo_with_strategy)
                        key_with_other = self._combo_to_key(combo_with_other)
                        
                        if (key_with_strategy in payoff_matrix.payoffs and
                            key_with_other in payoff_matrix.payoffs):
                            
                            payoff_strategy = payoff_matrix.payoffs[key_with_strategy].get(player_id, 0)
                            payoff_other = payoff_matrix.payoffs[key_with_other].get(player_id, 0)
                            
                            if payoff_strategy <= payoff_other:
                                is_dominant = False
                                break
                    
                    if not is_dominant:
                        break
                
                if is_dominant:
                    dominant[player_id] = strategy
                    break
        
        return dominant
    
    def _create_combo(
        self,
        players: List[str],
        target_player: str,
        target_strategy: MoveType,
        other_combo: Tuple,
        other_players: List[str]
    ) -> Tuple:
        """Create a strategy combination."""
        combo = []
        other_idx = 0
        for player_id in players:
            if player_id == target_player:
                combo.append(target_strategy)
            else:
                combo.append(other_combo[other_idx])
                other_idx += 1
        return tuple(combo)
    
    def _find_pareto_efficient(
        self,
        strategy_combinations: List[Tuple],
        payoff_matrix: PayoffMatrix,
        players: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Find Pareto efficient outcomes.
        
        An outcome is Pareto efficient if no player can be made
        better off without making another player worse off.
        """
        pareto_efficient = []
        
        for combo in strategy_combinations:
            combo_key = self._combo_to_key(combo)
            
            if combo_key not in payoff_matrix.payoffs:
                continue
            
            payoffs = payoff_matrix.payoffs[combo_key]
            
            # Check if this is Pareto efficient
            is_pareto = True
            
            for other_combo in strategy_combinations:
                if other_combo == combo:
                    continue
                
                other_key = self._combo_to_key(other_combo)
                if other_key not in payoff_matrix.payoffs:
                    continue
                
                other_payoffs = payoff_matrix.payoffs[other_key]
                
                # Check if other_combo Pareto dominates this combo
                all_better_or_equal = True
                at_least_one_better = False
                
                for player_id in players:
                    current_payoff = payoffs.get(player_id, 0)
                    other_payoff = other_payoffs.get(player_id, 0)
                    
                    if other_payoff < current_payoff:
                        all_better_or_equal = False
                        break
                    elif other_payoff > current_payoff:
                        at_least_one_better = True
                
                if all_better_or_equal and at_least_one_better:
                    is_pareto = False
                    break
            
            if is_pareto:
                pareto_efficient.append({
                    "strategies": {players[i]: combo[i].value for i in range(len(players))},
                    "payoffs": payoffs,
                    "key": combo_key
                })
        
        return pareto_efficient
    
    def _analyze_stability(
        self,
        equilibria: List[Dict[str, Any]],
        strategy_combinations: List[Tuple],
        payoff_matrix: PayoffMatrix,
        players: List[str]
    ) -> Dict[str, Any]:
        """Analyze stability of equilibria."""
        stability = {
            "num_equilibria": len(equilibria),
            "unique_equilibria": len(set(eq["key"] for eq in equilibria)),
            "equilibrium_details": []
        }
        
        for eq in equilibria:
            # Calculate welfare (sum of payoffs)
            welfare = sum(eq["payoffs"].values())
            
            stability["equilibrium_details"].append({
                "key": eq["key"],
                "welfare": welfare,
                "payoffs": eq["payoffs"]
            })
        
        return stability
    
    def _combo_to_key(self, combo: Tuple) -> str:
        """Convert strategy combination to key string."""
        return "(" + ",".join(str(s.value) for s in combo) + ")"
    
    def compute_welfare(self, payoffs: Dict[str, float]) -> float:
        """Compute total welfare (sum of all payoffs)."""
        return sum(payoffs.values())
    
    def compare_outcomes(
        self,
        outcome1: Dict[str, float],
        outcome2: Dict[str, float]
    ) -> Dict[str, Any]:
        """Compare two outcomes."""
        comparison = {
            "outcome1_welfare": self.compute_welfare(outcome1),
            "outcome2_welfare": self.compute_welfare(outcome2),
            "welfare_difference": self.compute_welfare(outcome2) - self.compute_welfare(outcome1),
            "player_comparisons": {}
        }
        
        all_players = set(outcome1.keys()) | set(outcome2.keys())
        for player_id in all_players:
            payoff1 = outcome1.get(player_id, 0)
            payoff2 = outcome2.get(player_id, 0)
            comparison["player_comparisons"][player_id] = {
                "outcome1": payoff1,
                "outcome2": payoff2,
                "difference": payoff2 - payoff1
            }
        
        return comparison

