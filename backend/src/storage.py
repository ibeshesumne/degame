"""
JSON file-based storage for game persistence.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Dict, Optional, List
from datetime import datetime

# File locking (Unix only, gracefully fails on Windows)
try:
    import fcntl
    HAS_FCNTL = True
except ImportError:
    HAS_FCNTL = False

from .game_engine import GameEngine
from .models import PayoffMatrix, GameState, MoveType


class GameStorage:
    """Handles persistence of games to JSON files."""
    
    def __init__(self, data_dir: str = "data/games"):
        """
        Initialize storage.
        
        Args:
            data_dir: Directory to store game JSON files
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_file_path(self, game_id: str) -> Path:
        """Get file path for a game ID."""
        return self.data_dir / f"{game_id}.json"
    
    def save_game(self, engine: GameEngine) -> bool:
        """
        Save a game engine to JSON file.
        
        Args:
            engine: GameEngine instance to save
            
        Returns:
            True if successful, False otherwise
        """
        try:
            file_path = self._get_file_path(engine.game_id)
            
            # Serialize game engine to dict
            game_data = {
                "game_id": engine.game_id,
                "payoff_matrix": engine.payoff_matrix.model_dump(),
                "game_state": engine.game_state.model_dump(mode='json'),  # Use mode='json' for datetime serialization
            }
            
            # Write with file locking for safety (Unix only)
            with open(file_path, 'w') as f:
                if HAS_FCNTL:
                    try:
                        fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # Exclusive lock
                        json.dump(game_data, f, indent=2, default=str)
                        fcntl.flock(f.fileno(), fcntl.LOCK_UN)  # Release lock
                    except (OSError, IOError):
                        # If file locking fails, just write without lock
                        f.seek(0)
                        json.dump(game_data, f, indent=2, default=str)
                else:
                    # Windows or systems without fcntl - write without locking
                    json.dump(game_data, f, indent=2, default=str)
            
            return True
        except Exception as e:
            print(f"Error saving game {engine.game_id}: {e}")
            return False
    
    def load_game(self, game_id: str) -> Optional[GameEngine]:
        """
        Load a game engine from JSON file.
        
        Args:
            game_id: Game ID to load
            
        Returns:
            GameEngine instance or None if not found
        """
        try:
            file_path = self._get_file_path(game_id)
            
            if not file_path.exists():
                return None
            
            # Read with file locking (Unix only)
            with open(file_path, 'r') as f:
                if HAS_FCNTL:
                    try:
                        fcntl.flock(f.fileno(), fcntl.LOCK_SH)  # Shared lock
                        game_data = json.load(f)
                        fcntl.flock(f.fileno(), fcntl.LOCK_UN)  # Release lock
                    except (OSError, IOError):
                        # If file locking fails, just read without lock
                        game_data = json.load(f)
                else:
                    # Windows or systems without fcntl - read without locking
                    game_data = json.load(f)
            
            # Deserialize
            payoff_matrix = PayoffMatrix(**game_data["payoff_matrix"])
            
            # Reconstruct game state with proper datetime parsing
            game_state_data = game_data["game_state"]
            if "created_at" in game_state_data and isinstance(game_state_data["created_at"], str):
                game_state_data["created_at"] = datetime.fromisoformat(game_state_data["created_at"])
            if "updated_at" in game_state_data and isinstance(game_state_data["updated_at"], str):
                game_state_data["updated_at"] = datetime.fromisoformat(game_state_data["updated_at"])
            
            # Parse strategies with datetime
            if "strategies" in game_state_data:
                for strategy in game_state_data["strategies"]:
                    if "timestamp" in strategy and isinstance(strategy["timestamp"], str):
                        strategy["timestamp"] = datetime.fromisoformat(strategy["timestamp"])
            
            # Parse current_strategies with datetime
            if "current_strategies" in game_state_data:
                for player_id, strategy_data in game_state_data["current_strategies"].items():
                    if isinstance(strategy_data, dict) and "timestamp" in strategy_data:
                        if isinstance(strategy_data["timestamp"], str):
                            strategy_data["timestamp"] = datetime.fromisoformat(strategy_data["timestamp"])
            
            game_state = GameState(**game_state_data)
            
            # Reconstruct engine
            engine = GameEngine(game_id, payoff_matrix)
            engine.game_state = game_state
            
            return engine
        except Exception as e:
            print(f"Error loading game {game_id}: {e}")
            return None
    
    def list_games(self) -> List[str]:
        """
        List all saved game IDs.
        
        Returns:
            List of game IDs
        """
        try:
            return [
                f.stem  # Remove .json extension
                for f in self.data_dir.glob("*.json")
            ]
        except Exception as e:
            print(f"Error listing games: {e}")
            return []
    
    def delete_game(self, game_id: str) -> bool:
        """
        Delete a game file.
        
        Args:
            game_id: Game ID to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            file_path = self._get_file_path(game_id)
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            print(f"Error deleting game {game_id}: {e}")
            return False
