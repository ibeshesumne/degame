# Game Storage Analysis

## Overview

This document provides a comprehensive analysis of how games are stored in the game6multi platform, including storage format, content structure, and memory usage.

## Storage Architecture

The game storage system uses a **three-file JSON-based architecture** where each game is split across three separate files:

1. **Game State File** (`backend/data/games/{game_id}.json`)
2. **Events File** (`backend/data/events/{game_id}_events.json`)
3. **Sessions File** (`backend/data/sessions/{game_id}_sessions.json`)

## Storage Format

### Format: JSON (JavaScript Object Notation)

All game data is stored as **human-readable JSON files** with:
- **Indentation**: 2 spaces for readability
- **Encoding**: UTF-8
- **File locking**: Unix file locking (fcntl) for concurrent access safety (gracefully falls back on Windows)

### File Structure

```
backend/data/
├── games/              # Game state files
│   ├── prisoner_dilemma_014a4902.json
│   └── prisoner_dilemma_03af77ab.json
├── events/             # Event log files
│   ├── prisoner_dilemma_014a4902_events.json
│   └── prisoner_dilemma_03af77ab_events.json
└── sessions/           # User session files
    ├── prisoner_dilemma_014a4902_sessions.json
    └── prisoner_dilemma_03af77ab_sessions.json
```

## Content Structure

### 1. Game State File (`{game_id}.json`)

**Location**: `backend/data/games/{game_id}.json`

**Content**:
- **game_id**: Unique identifier (e.g., "prisoner_dilemma_014a4902")
- **payoff_matrix**: Complete payoff matrix definition
  - `players`: List of player IDs
  - `strategies`: Available moves per player
  - `payoffs`: Payoff values for each strategy combination
- **game_state**: Current game state
  - `game_id`: Game identifier
  - `round`: Current round number
  - `players`: Dictionary of Player objects (id, name, type, role, objectives, constraints, resources)
  - `strategies`: List of all Strategy objects (historical moves)
  - `payoff_matrix`: Duplicate of payoff matrix (for quick access)
  - `current_strategies`: Dictionary of pending moves for current round
  - `history`: List of historical round results
  - `created_at`: ISO timestamp
  - `updated_at`: ISO timestamp

**Example Structure**:
```json
{
  "game_id": "prisoner_dilemma_014a4902",
  "payoff_matrix": {
    "players": ["player_1", "player_2"],
    "strategies": {
      "player_1": ["cooperate", "defect"],
      "player_2": ["cooperate", "defect"]
    },
    "payoffs": {
      "(cooperate,cooperate)": {"player_1": 3.0, "player_2": 3.0},
      "(cooperate,defect)": {"player_1": 0.0, "player_2": 5.0},
      ...
    }
  },
  "game_state": {
    "game_id": "prisoner_dilemma_014a4902",
    "round": 1,
    "players": {},
    "strategies": [],
    "current_strategies": {},
    "history": [],
    "created_at": "2026-01-09T19:02:45.217388",
    "updated_at": "2026-01-09T19:02:45.217393"
  }
}
```

### 2. Events File (`{game_id}_events.json`)

**Location**: `backend/data/events/{game_id}_events.json`

**Content**: Array of GameEvent objects tracking all game actions:
- **event_id**: Unique event identifier (e.g., "event_e05a9b9f")
- **game_id**: Associated game ID
- **event_type**: Type of event (MOVE, PROMPT, RESPONSE, ROUND_RESOLVED, PLAYER_JOINED, PLAYER_LEFT)
- **actor_session_id**: Session ID of the user who triggered the event
- **actor_name**: Display name of the actor
- **data**: Event-specific data payload
- **parent_event_id**: Optional reference to parent event (for event chains)
- **timestamp**: ISO timestamp

**Example Structure**:
```json
[
  {
    "event_id": "event_e05a9b9f",
    "game_id": "prisoner_dilemma_014a4902",
    "event_type": "PLAYER_JOINED",
    "actor_session_id": "anonymous",
    "actor_name": "User_anonymou",
    "data": {"message": "Game created"},
    "parent_event_id": null,
    "timestamp": "2026-01-09T19:02:45.218019"
  }
]
```

#### AI Prompts and Responses Storage

**YES, prompts and AI responses are saved** in the events file as `PROMPT` and `RESPONSE` event types.

**Storage Location**: `backend/data/events/{game_id}_events.json`

**How They're Linked to game_id**:
- Both PROMPT and RESPONSE events contain a `game_id` field that directly links them to the game
- For general analysis questions (not tied to a specific game), they use `game_id: "general_analysis"`
- All events for a game are stored in the same file: `{game_id}_events.json`

**PROMPT Event Structure**:
```json
{
  "event_id": "event_61c34269",
  "game_id": "prisoner_dilemma_2d1ac618",
  "event_type": "PROMPT",
  "actor_session_id": "session_1767995564528_nrt72pii0",
  "actor_name": "ml",
  "data": {
    "prompt_id": "prompt_5c053edb",
    "prompt_text": "what strategic options does China have...",
    "role": "analyst",
    "model": "openai:gpt-4",
    "thread_id": "thread_9ab8fce6",
    "parent_prompt_id": null
  },
  "parent_event_id": null,
  "timestamp": "2026-01-09T22:56:30.598863"
}
```

**RESPONSE Event Structure**:
```json
{
  "event_id": "event_b481aa03",
  "game_id": "prisoner_dilemma_2d1ac618",
  "event_type": "RESPONSE",
  "actor_session_id": "session_1767995564528_nrt72pii0",
  "actor_name": "ml",
  "data": {
    "prompt_id": "prompt_1767995804.884565",
    "response_text": "ANALYSIS:\n\n1. Strategic players/stakeholders:...",
    "role": "analyst",
    "model": "openai:gpt-4",
    "thread_id": "thread_9ab8fce6",
    "parent_prompt_id": null
  },
  "parent_event_id": "event_61c34269",
  "timestamp": "2026-01-09T22:56:44.884666"
}
```

**Linking Mechanism**:
1. **Direct game_id link**: Both PROMPT and RESPONSE events have a `game_id` field linking them to the game
2. **Parent-child relationship**: RESPONSE events have a `parent_event_id` field that references the `event_id` of the corresponding PROMPT event
3. **Thread linking**: Both events share a `thread_id` in their data payload for conversation threading
4. **Prompt ID linking**: Both events contain a `prompt_id` in their data payload (though they may differ - the response uses the AI-generated prompt_id)

**Storage Process**:
1. When a user submits a prompt via `/game/{game_id}/ai-prompt`, a PROMPT event is created and saved immediately
2. After the AI processes the prompt, a RESPONSE event is created with:
   - `parent_event_id` set to the PROMPT event's `event_id`
   - Full `response_text` stored in the `data` field
   - Same `game_id` as the prompt
3. Both events are appended to the same `{game_id}_events.json` file

### 3. Sessions File (`{game_id}_sessions.json`)

**Location**: `backend/data/sessions/{game_id}_sessions.json`

**Content**: Array of UserSession objects:
- **session_id**: Unique session identifier
- **user_name**: Display name of the user
- **game_id**: Associated game ID
- **joined_at**: ISO timestamp when session was created
- **last_active**: ISO timestamp of last activity
- **metadata**: Dictionary of additional session metadata

**Example Structure**:
```json
[
  {
    "session_id": "session_1767982814462_q279o01ky",
    "user_name": "User_session_",
    "game_id": "prisoner_dilemma_03af77ab",
    "joined_at": "2026-01-09T19:20:24.206044",
    "last_active": "2026-01-09T19:20:24.206050",
    "metadata": {}
  }
]
```

## Memory Usage Analysis

Based on analysis of 21 games currently stored:

### Per-File Statistics

#### Game State Files
- **Average size**: 1,710 bytes (1.67 KB)
- **Size range**: 1,618 - 2,135 bytes (1.58 - 2.08 KB)
- **Typical content**: 
  - Base game structure: ~1,600 bytes
  - Additional size from: players, strategies, history entries

#### Event Files
- **Average size**: 740 bytes (0.72 KB)
- **Size range**: 324 - 4,143 bytes (0.32 - 4.05 KB)
- **Average events per file**: 1.6 events
- **Size factors**:
  - Minimal event (PLAYER_JOINED): ~324 bytes
  - Event with AI response: Can grow to several KB (depends on response length)

#### AI Prompts and Responses Storage Details

**Current System Statistics** (based on 4 prompts and 4 responses):
- **PROMPT Events**:
  - Average size: 467 bytes (0.46 KB)
  - Size range: 399 - 529 bytes (0.39 - 0.52 KB)
  - Total storage: 1,869 bytes (1.83 KB)
  - Contains: prompt text, prompt_id, role, model, thread_id, parent_prompt_id

- **RESPONSE Events**:
  - Average size: 1,126 bytes (1.10 KB)
  - Size range: 558 - 2,810 bytes (0.54 - 2.74 KB)
  - Total storage: 4,504 bytes (4.40 KB)
  - Contains: Full response text (can be very long), prompt_id, role, model, thread_id

**Storage Breakdown**:
- Prompts: ~467 bytes each (relatively small, just the question)
- Responses: ~1,126 bytes average, but can grow significantly:
  - Short responses: ~558 bytes (0.54 KB)
  - Long responses: Up to 2,810 bytes (2.74 KB) or more
  - Response size directly correlates with AI response length

**Linking Statistics**:
- 100% of responses are linked to their prompts via `parent_event_id`
- All prompt-response pairs share the same `game_id`
- All pairs share the same `thread_id` for conversation threading

#### Session Files
- **Average size**: 246 bytes (0.24 KB)
- **Size range**: 235 - 257 bytes (0.23 - 0.25 KB)
- **Average sessions per file**: 1.0 session
- **Very consistent size**: Minimal variation

### Per-Game Totals

**Average total storage per game**: 2,422 bytes (2.37 KB)

**Breakdown**:
- Game state: ~1,710 bytes (70.6%)
- Events: ~607 bytes (25.1%)
- Sessions: ~105 bytes (4.3%)

### Storage Growth Patterns

**Game State File Growth**:
- Base size: ~1,600 bytes (empty game)
- Per player added: ~200-300 bytes
- Per strategy/move: ~150-200 bytes
- Per history entry: ~100-150 bytes
- **Estimated max**: ~10-20 KB for a heavily played game (100+ rounds)

**Event File Growth**:
- Per simple event: ~300-400 bytes
- Per AI prompt event: ~467 bytes average (400-530 bytes range)
- Per AI response event: ~1,126 bytes average, but highly variable:
  - Short responses: ~550 bytes
  - Medium responses: ~1,100 bytes
  - Long responses: ~2,800+ bytes (can grow much larger with detailed analysis)
- **Estimated max**: Can grow significantly with many AI interactions:
  - 10 prompt-response pairs: ~16 KB
  - 50 prompt-response pairs: ~80 KB
  - 100+ prompt-response pairs: 160+ KB
  - Games with extensive AI analysis can reach several hundred KB

**Session File Growth**:
- Per session: ~250 bytes
- **Estimated max**: ~2-3 KB for games with many participants (10+ sessions)

### Total Storage

**Current system totals**:
- Total games: 21
- Total events: 22 files
- Total sessions: 9 files
- **Total storage**: 54,387 bytes (53.11 KB)

**Directory breakdown**:
- `backend/data/games/`: 84 KB
- `backend/data/events/`: 92 KB
- `backend/data/sessions/`: 36 KB

## Storage Implementation Details

### Saving Process

1. **Game State**: Saved via `GameStorage.save_game()` in `backend/src/storage.py`
   - Triggered after: game creation, player addition, move submission, round resolution
   - Uses file locking for thread safety

2. **Events**: Saved via `EventStorage.create_event()` in `backend/src/event_storage.py`
   - Saved immediately when events are created
   - Appends to existing event array

3. **Sessions**: Saved via `EventStorage.create_session()` in `backend/src/event_storage.py`
   - Saved when session is created or updated
   - Maintains dictionary structure for quick lookups

### Loading Process

1. **Game State**: Loaded via `GameStorage.load_game()` 
   - Deserializes JSON and reconstructs GameEngine object
   - Parses datetime strings back to datetime objects

2. **Events**: Loaded via `EventStorage.get_events()`
   - Supports filtering by timestamp (`since` parameter)
   - Supports limiting results
   - Returns list of GameEvent objects

3. **Sessions**: Loaded via `EventStorage.get_sessions()`
   - Returns list of UserSession objects

## Storage Characteristics

### Advantages
- ✅ **Human-readable**: JSON format allows easy inspection and debugging
- ✅ **Portable**: Standard JSON format works across platforms
- ✅ **Version control friendly**: Text-based format works with git
- ✅ **Simple**: No database setup required
- ✅ **Thread-safe**: File locking prevents corruption

### Limitations
- ⚠️ **Scalability**: File-based storage doesn't scale well for thousands of games
- ⚠️ **Query performance**: No indexing, requires loading entire files
- ⚠️ **Concurrent writes**: File locking helps but not ideal for high concurrency
- ⚠️ **Event file growth**: Can grow large with many AI interactions

### Recommendations

For production at scale:
- Consider migrating to a database (PostgreSQL, MongoDB) for better query performance
- Implement event archiving/rotation for old games
- Add compression for historical data
- Consider separating frequently accessed data (current game state) from historical data (events)

## Summary

Games are stored as **three separate JSON files** per game:
1. **Game state** (~1.7 KB avg): Core game structure and current state
2. **Events** (~0.7 KB avg): Action log and AI interactions
3. **Sessions** (~0.25 KB avg): User session information

**Total per game**: ~2.4 KB average, with potential growth to 10-100+ KB depending on game activity and AI interaction volume.

### AI Prompts and Responses Summary

**✅ YES, prompts and AI responses are saved**

**Storage Location**: `backend/data/events/{game_id}_events.json`

**Linking to game_id**:
- Both PROMPT and RESPONSE events contain a `game_id` field
- All events for a game are stored in `{game_id}_events.json`
- Responses link to prompts via `parent_event_id` field
- Both share `thread_id` for conversation threading

**Storage Size**:
- **Prompts**: ~467 bytes each (0.46 KB)
- **Responses**: ~1,126 bytes average (1.10 KB), but can range from 558 bytes to 2,800+ bytes depending on response length
- **Per prompt-response pair**: ~1,593 bytes average (1.56 KB)
- **Growth potential**: Games with extensive AI analysis can reach 100+ KB in event files alone
