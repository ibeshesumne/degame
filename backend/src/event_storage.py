"""
Event storage for tracking game events and user sessions.
"""
from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

from .models import GameEvent, UserSession, EventType


class EventStorage:
    """Handles storage of game events and user sessions."""
    
    def __init__(self, data_dir: str = "data"):
        """
        Initialize event storage.
        
        Args:
            data_dir: Base directory for data storage
        """
        self.data_dir = Path(data_dir)
        self.events_dir = self.data_dir / "events"
        self.sessions_dir = self.data_dir / "sessions"
        self.events_dir.mkdir(parents=True, exist_ok=True)
        self.sessions_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_events_file(self, game_id: str) -> Path:
        """Get events file path for a game."""
        return self.events_dir / f"{game_id}_events.json"
    
    def _get_sessions_file(self, game_id: str) -> Path:
        """Get sessions file path for a game."""
        return self.sessions_dir / f"{game_id}_sessions.json"
    
    def create_event(
        self,
        game_id: str,
        event_type: EventType,
        actor_session_id: str,
        data: Dict,
        actor_name: Optional[str] = None,
        parent_event_id: Optional[str] = None
    ) -> GameEvent:
        """
        Create a new game event.
        
        Returns:
            Created GameEvent
        """
        event_id = f"event_{uuid.uuid4().hex[:8]}"
        event = GameEvent(
            event_id=event_id,
            game_id=game_id,
            event_type=event_type,
            actor_session_id=actor_session_id,
            actor_name=actor_name,
            data=data,
            parent_event_id=parent_event_id,
            timestamp=datetime.now()
        )
        
        # Load existing events
        events_file = self._get_events_file(game_id)
        events = []
        if events_file.exists():
            try:
                with open(events_file, 'r') as f:
                    events_data = json.load(f)
                    events = [GameEvent(**e) for e in events_data]
            except Exception as e:
                print(f"Error loading events: {e}")
        
        # Add new event
        events.append(event)
        
        # Save events
        try:
            with open(events_file, 'w') as f:
                json.dump([e.model_dump(mode='json') for e in events], f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving events: {e}")
        
        return event
    
    def get_events(
        self,
        game_id: str,
        since: Optional[datetime] = None,
        limit: Optional[int] = None
    ) -> List[GameEvent]:
        """
        Get events for a game, optionally filtered by timestamp.
        
        Args:
            game_id: Game ID
            since: Only return events after this timestamp
            limit: Maximum number of events to return (ignored if since is None to allow full history)
            
        Returns:
            List of GameEvent objects
        """
        events_file = self._get_events_file(game_id)
        if not events_file.exists():
            return []
        
        try:
            with open(events_file, 'r') as f:
                events_data = json.load(f)
                events = [GameEvent(**e) for e in events_data]
            
            # Filter by timestamp if provided
            if since:
                events = [e for e in events if e.timestamp > since]
            
            # Sort by timestamp
            events.sort(key=lambda e: e.timestamp)
            
            # Apply limit logic:
            # - If since is None (initial fetch), return all events (or up to 10000 if limit is set)
            # - If since is provided (incremental update), apply the limit
            if since is None:
                # For initial fetch, return all events (or up to 10000 if limit is set)
                if limit:
                    events = events[-10000:]  # Large limit for initial fetch
                # else: return all events (no limit applied)
            else:
                # For incremental updates, apply the limit if provided
                if limit:
                    events = events[-limit:]
            
            return events
        except Exception as e:
            print(f"Error loading events: {e}")
            return []
    
    def create_session(
        self,
        session_id: str,
        user_name: str,
        game_id: str,
        metadata: Optional[Dict] = None
    ) -> UserSession:
        """
        Create or update a user session.
        
        Returns:
            UserSession object
        """
        session = UserSession(
            session_id=session_id,
            user_name=user_name,
            game_id=game_id,
            joined_at=datetime.now(),
            last_active=datetime.now(),
            metadata=metadata or {}
        )
        
        # Load existing sessions
        sessions_file = self._get_sessions_file(game_id)
        sessions_dict = {}
        existing_joined_at = None
        if sessions_file.exists():
            try:
                with open(sessions_file, 'r') as f:
                    sessions_data = json.load(f)
                    sessions_dict = {s['session_id']: s for s in sessions_data}
                    # Preserve original joined_at if session already exists
                    if session_id in sessions_dict:
                        existing_joined_at = sessions_dict[session_id].get('joined_at')
            except Exception as e:
                print(f"Error loading sessions: {e}")
        
        # Update or add session
        session_dict = session.model_dump(mode='json')
        # Preserve original joined_at if updating existing session
        if existing_joined_at:
            session_dict['joined_at'] = existing_joined_at
        sessions_dict[session_id] = session_dict
        
        # Save sessions
        try:
            with open(sessions_file, 'w') as f:
                json.dump(list(sessions_dict.values()), f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving sessions: {e}")
        
        return session
    
    def update_session_activity(self, session_id: str, game_id: str):
        """Update last_active timestamp for a session."""
        sessions_file = self._get_sessions_file(game_id)
        if not sessions_file.exists():
            return
        
        try:
            with open(sessions_file, 'r') as f:
                sessions_data = json.load(f)
            
            # Find and update session
            for session_data in sessions_data:
                if session_data['session_id'] == session_id:
                    session_data['last_active'] = datetime.now().isoformat()
                    break
            
            # Save updated sessions
            with open(sessions_file, 'w') as f:
                json.dump(sessions_data, f, indent=2, default=str)
        except Exception as e:
            print(f"Error updating session: {e}")
    
    def get_sessions(self, game_id: str) -> List[UserSession]:
        """
        Get all sessions for a game.
        
        Returns:
            List of UserSession objects
        """
        sessions_file = self._get_sessions_file(game_id)
        if not sessions_file.exists():
            return []
        
        try:
            with open(sessions_file, 'r') as f:
                sessions_data = json.load(f)
                return [UserSession(**s) for s in sessions_data]
        except Exception as e:
            print(f"Error loading sessions: {e}")
            return []
    
    def delete_events(self, game_id: str) -> bool:
        """
        Delete events file for a game.
        
        Args:
            game_id: Game ID to delete events for
            
        Returns:
            True if successful, False otherwise
        """
        try:
            events_file = self._get_events_file(game_id)
            if events_file.exists():
                events_file.unlink()
                return True
            return False
        except Exception as e:
            print(f"Error deleting events for game {game_id}: {e}")
            return False
    
    def delete_sessions(self, game_id: str) -> bool:
        """
        Delete sessions file for a game.
        
        Args:
            game_id: Game ID to delete sessions for
            
        Returns:
            True if successful, False otherwise
        """
        try:
            sessions_file = self._get_sessions_file(game_id)
            if sessions_file.exists():
                sessions_file.unlink()
                return True
            return False
        except Exception as e:
            print(f"Error deleting sessions for game {game_id}: {e}")
            return False
    
    def get_game_creator(self, game_id: str) -> Optional[str]:
        """
        Get the session_id of the game creator.
        
        The creator is identified as the actor_session_id of the first PLAYER_JOINED
        event with data containing {"message": "Game created"}.
        
        Args:
            game_id: Game ID
            
        Returns:
            Session ID of the creator, or None if not found
        """
        events = self.get_events(game_id, since=None, limit=None)
        # Sort by timestamp to find the first event
        events.sort(key=lambda e: e.timestamp)
        
        for event in events:
            if (event.event_type == EventType.PLAYER_JOINED and 
                event.data.get("message") == "Game created"):
                return event.actor_session_id
        
        return None
