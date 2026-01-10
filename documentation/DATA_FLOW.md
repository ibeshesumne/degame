# Data Flow in Game6Multi

This document describes how data flows through the system: how it's presented to users, how it's created, how it's saved, and how it's stored.

## Data Presentation

### Frontend Data Display

Data is presented to users through React components that render JSON data from the backend API.

#### Game State Presentation

**Component**: `GameBoard.jsx`

**Data Source**: `GET /game/{game_id}/state`

**Displayed Data**:
- Current round number
- List of players with their moves
- Move selection buttons (Cooperate/Defect)
- Payoff matrix display
- Round resolution button

**Data Format**:
```json
{
  "game_state": {
    "game_id": "prisoner_dilemma_abc123",
    "round": 1,
    "players": {
      "player_1": {
        "id": "player_1",
        "name": "Alice",
        "type": "human"
      }
    },
    "current_strategies": {
      "player_1": {
        "player_id": "player_1",
        "move_type": "cooperate",
        "round": 1
      }
    },
    "payoff_matrix": {
      "payoffs": {
        "(cooperate,cooperate)": {"player_1": 3, "player_2": 3}
      }
    }
  }
}
```

#### Events Presentation

**Component**: `EventFeed.jsx`, `AIConversations.jsx`

**Data Source**: `GET /game/{game_id}/updates`

**Displayed Data**:
- Event stream (all game actions)
- AI prompts and responses
- Thread-based conversations
- Timestamps

**Data Format**:
```json
{
  "events": [
    {
      "event_id": "event_abc123",
      "game_id": "prisoner_dilemma_abc123",
      "event_type": "MOVE",
      "actor_name": "Alice",
      "data": {
        "player_id": "player_1",
        "move_type": "cooperate"
      },
      "timestamp": "2026-01-09T19:02:45.218019"
    }
  ],
  "latest_timestamp": "2026-01-09T19:02:45.218019"
}
```

#### Sessions Presentation

**Component**: `ActiveSessions.jsx`

**Data Source**: `GET /game/{game_id}/sessions`

**Displayed Data**:
- List of active users
- User names
- Join timestamps
- Last activity timestamps

**Data Format**:
```json
{
  "sessions": [
    {
      "session_id": "session_123",
      "user_name": "Alice",
      "game_id": "prisoner_dilemma_abc123",
      "joined_at": "2026-01-09T19:02:45",
      "last_active": "2026-01-09T19:05:30"
    }
  ]
}
```

#### Equilibria Presentation

**Component**: `EquilibriaDisplay.jsx`

**Data Source**: `GET /game/{game_id}/equilibria`

**Displayed Data**:
- Nash equilibria
- Dominant strategies
- Pareto-efficient outcomes
- Stability analysis

**Data Format**:
```json
{
  "equilibria": {
    "game_id": "prisoner_dilemma_abc123",
    "round": 1,
    "equilibria": [
      {
        "strategies": {"player_1": "defect", "player_2": "defect"},
        "payoffs": {"player_1": 1, "player_2": 1}
      }
    ],
    "dominant_strategies": {
      "player_1": "defect",
      "player_2": "defect"
    }
  }
}
```

### Real-Time Updates

**Polling Mechanism**:
- Frontend polls `/game/{game_id}/updates` every 2 seconds
- Uses `since` parameter to get only new events
- Updates displayed data automatically
- Refreshes game state if moves detected

**Update Flow**:
```
Frontend → GET /game/{id}/updates?since={timestamp}
         ↓
    Backend filters events
         ↓
    Returns new events
         ↓
    Frontend updates state
         ↓
    Components re-render
```

## Data Creation

### Game Creation

**Trigger**: User clicks "Join" with empty Game ID

**Flow**:
```
Frontend → POST /game/create?game_type=prisoner_dilemma
         ↓
    Backend: create_prisoner_dilemma_game()
         ↓
    Creates GameEngine with:
      - Unique game_id
      - PayoffMatrix (predefined)
      - Empty GameState
         ↓
    Save to storage (games/{game_id}.json)
         ↓
    Create PLAYER_JOINED event
         ↓
    Save event (events/{game_id}_events.json)
         ↓
    Return game_id to frontend
```

**Created Data**:
- Game state file: `games/{game_id}.json`
- Event file: `events/{game_id}_events.json`
- Initial event: `PLAYER_JOINED`

### Player Addition

**Trigger**: User fills "Add Player" form and submits

**Flow**:
```
Frontend → POST /game/{id}/add-player
         Body: {name, type, role, objectives, constraints}
         ↓
    Backend: GameEngine.add_player()
         ↓
    Creates Player object
         ↓
    Adds to game_state.players
         ↓
    Save game state
         ↓
    Create MOVE event (implicit)
         ↓
    Save event
         ↓
    Return success
```

**Created Data**:
- Updated game state (with new player)
- Event: `MOVE` (implicit player addition)

### Move Submission

**Trigger**: User selects move and clicks "Submit Move"

**Flow**:
```
Frontend → POST /game/{id}/submit-move?player_id={id}&move_type={move}
         ↓
    Backend: GameEngine.submit_move()
         ↓
    Creates Strategy object:
      - player_id
      - move_type
      - round
      - timestamp
         ↓
    Adds to game_state.current_strategies
    Adds to game_state.strategies (history)
    Adds to game_state.history
         ↓
    Save game state
         ↓
    Create MOVE event
         ↓
    Save event
         ↓
    Return success
```

**Created Data**:
- Updated game state (with move)
- Strategy object in history
- Event: `MOVE`

### Round Resolution

**Trigger**: User clicks "Resolve Round" (all players moved)

**Flow**:
```
Frontend → POST /game/{id}/resolve-round
         ↓
    Backend: GameEngine.resolve_round()
         ↓
    Check all players have moves
         ↓
    Build strategy combination
         ↓
    Look up payoffs in PayoffMatrix
         ↓
    Create round_result:
      - round number
      - strategies chosen
      - payoffs for each player
         ↓
    Clear current_strategies
    Increment round number
    Add to history
         ↓
    Save game state
         ↓
    Create ROUND_RESOLVED event
         ↓
    Save event
         ↓
    Return round_result
```

**Created Data**:
- Updated game state (round advanced, history updated)
- Round result in history
- Event: `ROUND_RESOLVED`

### AI Prompt Creation

**Trigger**: User submits question in AI Panel

**Flow**:
```
Frontend → POST /game/ask-ai
         Body: {prompt_text, role, model, thread_id, general_analysis}
         ↓
    Backend: Create AIPrompt object
         ↓
    Create PROMPT event:
      - event_id (unique)
      - game_id
      - event_type: PROMPT
      - data: {prompt_id, prompt_text, role, model, thread_id}
      - timestamp
         ↓
    Save event immediately
         ↓
    AIOrchestrator.process_prompt()
         ↓
    Build prompt with context
         ↓
    Call AI API (OpenAI/Anthropic)
         ↓
    Create RESPONSE event:
      - event_id (unique)
      - game_id (same)
      - event_type: RESPONSE
      - parent_event_id: PROMPT event_id
      - data: {prompt_id, response_text, role, model, thread_id}
      - timestamp
         ↓
    Save event immediately
         ↓
    Return response to frontend
```

**Created Data**:
- Event: `PROMPT` (saved immediately)
- Event: `RESPONSE` (saved immediately)
- Both linked via `parent_event_id`
- Both share `thread_id` for threading

### Session Creation

**Trigger**: User joins game (enters name and Game ID)

**Flow**:
```
Frontend → POST /game/{id}/join
         Body: {user_name}
         ↓
    Backend: get_or_create_session()
         ↓
    Generate session_id (if new)
         ↓
    Create UserSession object:
      - session_id
      - user_name
      - game_id
      - joined_at (timestamp)
      - last_active (timestamp)
         ↓
    Save session (sessions/{game_id}_sessions.json)
         ↓
    Create PLAYER_JOINED event
         ↓
    Save event
         ↓
    Return session info
```

**Created Data**:
- Session file: `sessions/{game_id}_sessions.json`
- Event: `PLAYER_JOINED`

## Data Saving

### Save Triggers

**Game State Saved After**:
- Game creation
- Player addition
- Move submission
- Round resolution

**Events Saved**:
- Immediately when created
- No batching or queuing

**Sessions Saved**:
- When created
- When updated (last_active)

### Save Process

#### Game State Save

**Location**: `backend/src/storage.py`

**Process**:
```
GameEngine → GameStorage.save_game()
         ↓
    Serialize to dict:
      - game_id
      - payoff_matrix.model_dump()
      - game_state.model_dump(mode='json')
         ↓
    Write to JSON file:
      - Path: data/games/{game_id}.json
      - Format: JSON with 2-space indent
      - Encoding: UTF-8
      - File locking: fcntl (Unix) or none (Windows)
         ↓
    File saved
```

**File Format**:
```json
{
  "game_id": "prisoner_dilemma_abc123",
  "payoff_matrix": { ... },
  "game_state": { ... }
}
```

#### Event Save

**Location**: `backend/src/event_storage.py`

**Process**:
```
Event → EventStorage.create_event()
     ↓
    Load existing events from file
     ↓
    Append new event to array
     ↓
    Serialize all events:
      - Use model_dump(mode='json')
      - Convert datetime to ISO strings
     ↓
    Write to JSON file:
      - Path: data/events/{game_id}_events.json
      - Format: JSON array
      - Indent: 2 spaces
     ↓
    File saved
```

**File Format**:
```json
[
  {
    "event_id": "event_abc123",
    "game_id": "prisoner_dilemma_abc123",
    "event_type": "MOVE",
    "data": { ... },
    "timestamp": "2026-01-09T19:02:45.218019"
  }
]
```

#### Session Save

**Location**: `backend/src/event_storage.py`

**Process**:
```
Session → EventStorage.create_session()
        ↓
    Load existing sessions from file
        ↓
    Update or add session to dict
        ↓
    Serialize all sessions:
      - Use model_dump(mode='json')
      - Convert datetime to ISO strings
        ↓
    Write to JSON file:
      - Path: data/sessions/{game_id}_sessions.json
      - Format: JSON array
      - Indent: 2 spaces
        ↓
    File saved
```

**File Format**:
```json
[
  {
    "session_id": "session_123",
    "user_name": "Alice",
    "game_id": "prisoner_dilemma_abc123",
    "joined_at": "2026-01-09T19:02:45",
    "last_active": "2026-01-09T19:05:30"
  }
]
```

### File Locking

**Unix Systems**:
- Uses `fcntl` for file locking
- Exclusive lock (`LOCK_EX`) for writes
- Shared lock (`LOCK_SH`) for reads
- Prevents corruption from concurrent access

**Windows Systems**:
- No file locking (gracefully fails)
- Relies on single-process assumption
- May cause issues with multiple backend instances

## Data Storage

### Storage Structure

```
backend/data/
├── games/              # Game state files
│   ├── prisoner_dilemma_014a4902.json
│   └── prisoner_dilemma_03af77ab.json
├── events/             # Event log files
│   ├── prisoner_dilemma_014a4902_events.json
│   ├── prisoner_dilemma_03af77ab_events.json
│   └── general_analysis_events.json
└── sessions/           # User session files
    ├── prisoner_dilemma_014a4902_sessions.json
    └── prisoner_dilemma_03af77ab_sessions.json
```

### Storage Format

**All Files**: JSON format
- **Encoding**: UTF-8
- **Indentation**: 2 spaces
- **Human-readable**: Yes
- **Version control friendly**: Yes

### Storage Characteristics

#### Game State Files

**Location**: `data/games/{game_id}.json`

**Content**:
- Complete game structure
- Payoff matrix (duplicated in game_state)
- Current game state
- Player information
- Strategy history
- Round history

**Size**: ~1.6-2.1 KB per game (base)

**Growth**: Increases with:
- Players added
- Moves submitted
- Rounds played

#### Event Files

**Location**: `data/events/{game_id}_events.json`

**Content**:
- Array of all events
- Chronological order
- All event types

**Size**: Variable
- Base: ~324 bytes (empty)
- Per event: ~300-400 bytes (simple)
- Per AI prompt: ~467 bytes
- Per AI response: ~1,126 bytes (average)

**Growth**: Can grow significantly with:
- Many moves
- Many AI interactions
- Long AI responses

#### Session Files

**Location**: `data/sessions/{game_id}_sessions.json`

**Content**:
- Array of user sessions
- Session metadata

**Size**: ~235-257 bytes per file
- Per session: ~250 bytes

**Growth**: Increases with:
- More participants
- More sessions

### Data Loading

#### On Backend Startup

**Process**:
```
Backend startup → load_games()
              ↓
         GameStorage.list_games()
              ↓
         For each game_id:
           - Load game from file
           - Deserialize JSON
           - Reconstruct GameEngine
           - Parse datetime strings
           - Add to games dict
              ↓
         Games available in memory
```

**Loaded Data**:
- All game state files
- Games available immediately
- Events and sessions loaded on-demand

#### On-Demand Loading

**Events**:
```
API request → EventStorage.get_events()
           ↓
      Load file if exists
           ↓
      Deserialize JSON array
           ↓
      Convert to GameEvent objects
           ↓
      Filter by timestamp (if since provided)
           ↓
      Sort by timestamp
           ↓
      Return events
```

**Sessions**:
```
API request → EventStorage.get_sessions()
           ↓
      Load file if exists
           ↓
      Deserialize JSON array
           ↓
      Convert to UserSession objects
           ↓
      Return sessions
```

### Data Persistence

**Persistence Strategy**:
- **Immediate**: Events saved immediately
- **After Operations**: Game state saved after operations
- **On Update**: Sessions saved when updated

**Durability**:
- Files written to disk
- No in-memory only data (except active games)
- Survives backend restart

**Recovery**:
- Games reloaded on startup
- Events preserved
- Sessions preserved
- Can recover from crashes

## Data Flow Summary

### Complete Flow Example: User Submits Move

```
1. USER ACTION
   User clicks "Submit Move" button
         ↓
2. FRONTEND
   App.jsx: submitMove()
   → POST /game/{id}/submit-move
         ↓
3. BACKEND API
   main.py: submit_move()
   → GameEngine.submit_move()
   → Creates Strategy object
   → Updates game_state
         ↓
4. SAVE GAME STATE
   GameStorage.save_game()
   → Serialize to JSON
   → Write to games/{id}.json
         ↓
5. CREATE EVENT
   EventStorage.create_event()
   → Create MOVE event
   → Load existing events
   → Append new event
   → Write to events/{id}_events.json
         ↓
6. RETURN RESPONSE
   Backend returns success
         ↓
7. FRONTEND UPDATE
   Frontend receives response
   → fetchGameState() (refresh)
   → fetchUpdates() (get events)
         ↓
8. UI UPDATE
   Components re-render
   → GameBoard shows move
   → EventFeed shows event
```

### Complete Flow Example: AI Question

```
1. USER ACTION
   User submits AI question
         ↓
2. FRONTEND
   App.jsx: askAI()
   → POST /game/ask-ai
         ↓
3. BACKEND API
   main.py: ask_ai()
   → Create PROMPT event
   → Save event immediately
         ↓
4. AI PROCESSING
   AIOrchestrator.process_prompt()
   → Build prompt with context
   → Call OpenAI/Anthropic API
   → Get response
         ↓
5. CREATE RESPONSE EVENT
   EventStorage.create_event()
   → Create RESPONSE event
   → Link to PROMPT via parent_event_id
   → Save event immediately
         ↓
6. RETURN RESPONSE
   Backend returns AI response
         ↓
7. FRONTEND UPDATE
   Frontend receives response
   → fetchUpdates() (get events)
         ↓
8. UI UPDATE
   Components re-render
   → AIConversations shows prompt/response
   → Thread view updated
```

## Summary

Data in Game6Multi flows through these stages:

1. **Presentation**: JSON data displayed in React components
2. **Creation**: User actions create data objects
3. **Saving**: Data saved immediately to JSON files
4. **Storage**: Three-file system (games, events, sessions)
5. **Loading**: Data loaded on startup and on-demand
6. **Updates**: Real-time polling keeps data synchronized

The system uses a simple but effective file-based storage approach that:
- Preserves all game data
- Tracks all events
- Maintains session information
- Supports multi-participant collaboration
- Enables real-time updates
