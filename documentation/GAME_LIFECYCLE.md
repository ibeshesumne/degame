# Game Lifecycle and Traces

This document describes what the game starts with (initial state) and how traces develop as the game progresses.

## Initial Game State

### What a Game Starts With

When a new game is created, it begins with a minimal but complete structure:

#### 1. Game ID

**Generated**: Unique identifier
**Format**: `prisoner_dilemma_{8_hex_digits}`
**Example**: `prisoner_dilemma_014a4902`

**Generation**:
```python
game_id = f"prisoner_dilemma_{uuid.uuid4().hex[:8]}"
```

#### 2. Payoff Matrix

**Predefined**: Classic Prisoner's Dilemma structure

**Players**:
- `player_1`
- `player_2`

**Strategies** (per player):
- `cooperate`
- `defect`

**Payoffs**:
```json
{
  "(cooperate,cooperate)": {"player_1": 3.0, "player_2": 3.0},
  "(cooperate,defect)": {"player_1": 0.0, "player_2": 5.0},
  "(defect,cooperate)": {"player_1": 5.0, "player_2": 0.0},
  "(defect,defect)": {"player_1": 1.0, "player_2": 1.0}
}
```

#### 3. Initial Game State

**Structure**:
```json
{
  "game_id": "prisoner_dilemma_014a4902",
  "round": 1,
  "players": {},
  "strategies": [],
  "payoff_matrix": { ... },
  "current_strategies": {},
  "history": [],
  "created_at": "2026-01-09T19:02:45.217388",
  "updated_at": "2026-01-09T19:02:45.217393"
}
```

**Empty Collections**:
- `players`: No players yet
- `strategies`: No moves yet
- `current_strategies`: No pending moves
- `history`: No round results yet

**Initial Values**:
- `round`: 1 (first round)
- `created_at`: Timestamp of creation
- `updated_at`: Same as created_at initially

#### 4. Initial Files Created

**Game State File**: `data/games/{game_id}.json`
- Contains game structure
- Contains payoff matrix
- Contains initial game state

**Event File**: `data/events/{game_id}_events.json`
- Initially empty array: `[]`
- First event added: `PLAYER_JOINED`

**Session File**: `data/sessions/{game_id}_sessions.json`
- Created when first user joins
- Contains first user's session

### Initial Event

**First Event**: `PLAYER_JOINED`

**Structure**:
```json
{
  "event_id": "event_e05a9b9f",
  "game_id": "prisoner_dilemma_014a4902",
  "event_type": "PLAYER_JOINED",
  "actor_session_id": "anonymous",
  "actor_name": "User_anonymou",
  "data": {
    "message": "Game created"
  },
  "parent_event_id": null,
  "timestamp": "2026-01-09T19:02:45.218019"
}
```

## Trace Development

### Trace Types

The game develops multiple types of traces as it progresses:

1. **Game State Trace**: Evolution of game state
2. **Event Trace**: Chronological log of all actions
3. **Strategy Trace**: History of moves
4. **Round Trace**: History of round results
5. **Session Trace**: User participation history
6. **AI Conversation Trace**: AI interactions

### 1. Game State Trace

**Initial State**:
- Round 1
- No players
- No moves
- No history

**After Adding Players**:
```json
{
  "round": 1,
  "players": {
    "player_1": {
      "id": "player_1",
      "name": "Alice",
      "type": "human",
      "role": null,
      "objectives": [],
      "constraints": []
    }
  },
  "strategies": [],
  "current_strategies": {},
  "history": []
}
```

**After Submitting Moves**:
```json
{
  "round": 1,
  "players": { ... },
  "strategies": [
    {
      "player_id": "player_1",
      "move_type": "cooperate",
      "round": 1,
      "timestamp": "2026-01-09T19:03:00.123456"
    }
  ],
  "current_strategies": {
    "player_1": {
      "player_id": "player_1",
      "move_type": "cooperate",
      "round": 1
    }
  },
  "history": []
}
```

**After Resolving Round**:
```json
{
  "round": 2,
  "players": { ... },
  "strategies": [ ... ],
  "current_strategies": {},
  "history": [
    {
      "round": 1,
      "player_id": "player_1",
      "move": "cooperate",
      "timestamp": "2026-01-09T19:03:00.123456"
    }
  ]
}
```

**Evolution Pattern**:
- Round number increments
- Players accumulate
- Strategies accumulate (never removed)
- History accumulates (round results)
- Current strategies reset each round

### 2. Event Trace

**Chronological Sequence**:

**Event 1**: `PLAYER_JOINED`
```json
{
  "event_type": "PLAYER_JOINED",
  "timestamp": "2026-01-09T19:02:45.218019"
}
```

**Event 2**: `PLAYER_JOINED` (second user)
```json
{
  "event_type": "PLAYER_JOINED",
  "timestamp": "2026-01-09T19:02:51.123456"
}
```

**Event 3**: `MOVE` (player added)
```json
{
  "event_type": "MOVE",
  "data": {
    "player_id": "player_1",
    "move_type": "cooperate"
  },
  "timestamp": "2026-01-09T19:03:00.123456"
}
```

**Event 4**: `MOVE` (another move)
```json
{
  "event_type": "MOVE",
  "data": {
    "player_id": "player_2",
    "move_type": "defect"
  },
  "timestamp": "2026-01-09T19:03:05.789012"
}
```

**Event 5**: `ROUND_RESOLVED`
```json
{
  "event_type": "ROUND_RESOLVED",
  "data": {
    "round": 1,
    "strategies": {
      "player_1": "cooperate",
      "player_2": "defect"
    },
    "payoffs": {
      "player_1": 0.0,
      "player_2": 5.0
    }
  },
  "timestamp": "2026-01-09T19:03:10.345678"
}
```

**Event 6**: `PROMPT` (AI question)
```json
{
  "event_type": "PROMPT",
  "data": {
    "prompt_id": "prompt_5c053edb",
    "prompt_text": "What is the Nash equilibrium?",
    "role": "analyst",
    "model": "openai:gpt-4",
    "thread_id": "thread_9ab8fce6"
  },
  "timestamp": "2026-01-09T19:03:15.901234"
}
```

**Event 7**: `RESPONSE` (AI answer)
```json
{
  "event_type": "RESPONSE",
  "parent_event_id": "event_6_id",
  "data": {
    "prompt_id": "prompt_1767995804.884565",
    "response_text": "The Nash equilibrium is...",
    "role": "analyst",
    "model": "openai:gpt-4",
    "thread_id": "thread_9ab8fce6"
  },
  "timestamp": "2026-01-09T19:03:30.567890"
}
```

**Event Trace Characteristics**:
- Chronological order
- Never deleted (append-only)
- All actions tracked
- Linked via `parent_event_id` (for responses)
- Grouped by `thread_id` (for conversations)

### 3. Strategy Trace

**Accumulation Pattern**:

**Round 1**:
```json
"strategies": [
  {
    "player_id": "player_1",
    "move_type": "cooperate",
    "round": 1,
    "timestamp": "2026-01-09T19:03:00"
  },
  {
    "player_id": "player_2",
    "move_type": "defect",
    "round": 1,
    "timestamp": "2026-01-09T19:03:05"
  }
]
```

**Round 2**:
```json
"strategies": [
  { ... round 1 moves ... },
  {
    "player_id": "player_1",
    "move_type": "defect",
    "round": 2,
    "timestamp": "2026-01-09T19:04:00"
  },
  {
    "player_id": "player_2",
    "move_type": "cooperate",
    "round": 2,
    "timestamp": "2026-01-09T19:04:05"
  }
]
```

**Strategy Trace Characteristics**:
- Never removed (complete history)
- Ordered by timestamp
- Includes round number
- Includes player ID
- Includes move type

### 4. Round Trace (History)

**Accumulation Pattern**:

**After Round 1**:
```json
"history": [
  {
    "round": 1,
    "player_id": "player_1",
    "move": "cooperate",
    "timestamp": "2026-01-09T19:03:00"
  }
]
```

**After Round 2**:
```json
"history": [
  {
    "round": 1,
    "player_id": "player_1",
    "move": "cooperate",
    "timestamp": "2026-01-09T19:03:00"
  },
  {
    "round": 2,
    "player_id": "player_1",
    "move": "defect",
    "timestamp": "2026-01-09T19:04:00"
  }
]
```

**Round Trace Characteristics**:
- Summarizes each round
- Includes round number
- Includes moves
- Includes timestamps
- Never removed

### 5. Session Trace

**Initial Session**:
```json
[
  {
    "session_id": "session_1767982814462_q279o01ky",
    "user_name": "Alice",
    "game_id": "prisoner_dilemma_014a4902",
    "joined_at": "2026-01-09T19:02:45.206044",
    "last_active": "2026-01-09T19:02:45.206050",
    "metadata": {}
  }
]
```

**After Second User Joins**:
```json
[
  {
    "session_id": "session_1767982814462_q279o01ky",
    "user_name": "Alice",
    "game_id": "prisoner_dilemma_014a4902",
    "joined_at": "2026-01-09T19:02:45.206044",
    "last_active": "2026-01-09T19:05:30.123456",
    "metadata": {}
  },
  {
    "session_id": "session_1767982815000_abc123xyz",
    "user_name": "Bob",
    "game_id": "prisoner_dilemma_014a4902",
    "joined_at": "2026-01-09T19:03:00.789012",
    "last_active": "2026-01-09T19:03:00.789012",
    "metadata": {}
  }
]
```

**Session Trace Characteristics**:
- Tracks all participants
- Updates `last_active` on activity
- Preserves `joined_at` timestamp
- Never removed (persistent)

### 6. AI Conversation Trace

**Thread Development**:

**Initial Prompt**:
```json
{
  "event_type": "PROMPT",
  "event_id": "event_61c34269",
  "data": {
    "thread_id": "thread_9ab8fce6",
    "prompt_text": "What is the Nash equilibrium?"
  },
  "parent_event_id": null
}
```

**Response**:
```json
{
  "event_type": "RESPONSE",
  "event_id": "event_b481aa03",
  "data": {
    "thread_id": "thread_9ab8fce6",
    "response_text": "The Nash equilibrium is..."
  },
  "parent_event_id": "event_61c34269"
}
```

**Follow-up Prompt** (in same thread):
```json
{
  "event_type": "PROMPT",
  "event_id": "event_xyz789",
  "data": {
    "thread_id": "thread_9ab8fce6",
    "prompt_text": "Can you explain more?",
    "parent_prompt_id": "prompt_5c053edb"
  },
  "parent_event_id": null
}
```

**AI Conversation Trace Characteristics**:
- Grouped by `thread_id`
- Linked via `parent_event_id` (responses link to prompts)
- Can have multiple prompts in a thread
- Can have multiple responses
- Chronological within thread

## Trace Growth Patterns

### Game State File Growth

**Initial Size**: ~1,600 bytes

**Growth Factors**:
- **Per Player**: +200-300 bytes
- **Per Move**: +150-200 bytes
- **Per Round Result**: +100-150 bytes

**Example Growth**:
- Empty game: 1,600 bytes
- +2 players: +500 bytes = 2,100 bytes
- +10 moves: +1,500 bytes = 3,600 bytes
- +5 rounds: +500 bytes = 4,100 bytes

**Estimated Maximum**: 10-20 KB for heavily played game (100+ rounds)

### Event File Growth

**Initial Size**: 0 bytes (empty array)

**Growth Factors**:
- **Per Simple Event**: +300-400 bytes
- **Per AI Prompt**: +467 bytes
- **Per AI Response**: +1,126 bytes (average, can be much larger)

**Example Growth**:
- Empty: 0 bytes
- +10 simple events: +3,500 bytes
- +5 AI prompts: +2,335 bytes
- +5 AI responses: +5,630 bytes
- **Total**: ~11,465 bytes (~11 KB)

**Estimated Maximum**: Can grow to 100+ KB with extensive AI interactions

### Session File Growth

**Initial Size**: 0 bytes (created on first join)

**Growth Factors**:
- **Per Session**: +250 bytes

**Example Growth**:
- Empty: 0 bytes
- +1 session: +250 bytes
- +5 sessions: +1,250 bytes
- +10 sessions: +2,500 bytes

**Estimated Maximum**: ~2-3 KB for games with many participants

## Trace Relationships

### Linking Mechanisms

**1. Game ID Linking**:
- All traces share the same `game_id`
- Links game state, events, and sessions

**2. Event Parent-Child Linking**:
- Responses link to prompts via `parent_event_id`
- Creates conversation chains

**3. Thread Linking**:
- Related prompts/responses share `thread_id`
- Groups conversations

**4. Round Linking**:
- Strategies include `round` number
- History entries include `round` number
- Links moves to rounds

**5. Session Linking**:
- Events include `actor_session_id`
- Links actions to users

**6. Timestamp Linking**:
- All traces include timestamps
- Enables chronological ordering
- Enables filtering by time

## Trace Persistence

### What Persists

**Always Persisted**:
- Game state (after operations)
- Events (immediately)
- Sessions (on create/update)

**Never Deleted**:
- Historical strategies
- Historical events
- Historical rounds
- Historical sessions

**Reset Each Round**:
- `current_strategies` (cleared after resolution)
- Round number (incremented)

### Trace Recovery

**On Backend Restart**:
- Games reloaded from files
- Events preserved
- Sessions preserved
- Complete history maintained

**From Files**:
- Game state: `games/{game_id}.json`
- Events: `events/{game_id}_events.json`
- Sessions: `sessions/{game_id}_sessions.json`

## Summary

### What Game Starts With

1. **Unique Game ID**: `prisoner_dilemma_{hex}`
2. **Predefined Payoff Matrix**: Classic Prisoner's Dilemma
3. **Empty Game State**: Round 1, no players, no moves
4. **Empty Event File**: Ready for first event
5. **No Session File**: Created on first join

### How Traces Develop

1. **Game State Trace**: 
   - Players accumulate
   - Strategies accumulate (never removed)
   - History accumulates
   - Round increments

2. **Event Trace**:
   - Chronological log
   - All actions tracked
   - Never deleted
   - Linked via parent_event_id

3. **Strategy Trace**:
   - Complete move history
   - Ordered by timestamp
   - Includes round numbers

4. **Round Trace**:
   - Round results accumulate
   - Summarizes each round

5. **Session Trace**:
   - Participants accumulate
   - Activity tracked
   - Never removed

6. **AI Conversation Trace**:
   - Threads develop
   - Prompts and responses linked
   - Grouped by thread_id

### Trace Characteristics

- **Append-Only**: Traces never shrink, only grow
- **Chronological**: Ordered by timestamp
- **Linked**: Multiple linking mechanisms
- **Persistent**: Saved to files
- **Recoverable**: Can rebuild from files
- **Complete**: Full history maintained

The game creates a rich, interconnected trace of all activities, enabling:
- Complete audit trail
- Real-time collaboration
- Historical analysis
- AI conversation threading
- Multi-participant tracking
