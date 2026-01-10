# Multi-Participant Features Guide

This document explains how game6multi supports multiple participants, session management, event tracking, and thread-based AI conversations.

## Overview

game6multi includes all functionality from game5multi:

✅ **Session Management** - Multiple users can join games  
✅ **Event Tracking** - All actions are tracked as events  
✅ **Thread-based AI Conversations** - Conversation threading support  
✅ **Multi-participant Prompts** - Multiple users can add prompts  
✅ **Real-time Updates** - Poll for game events  
✅ **Game Persistence** - Games saved to JSON files  

## How Games Are Saved

### Storage System

Games are saved using a **dual storage system**:

1. **Game State Storage** (`backend/src/storage.py`):
   - Location: `backend/data/games/*.json`
   - Stores: Game engine state, players, strategies, payoff matrix
   - Format: One JSON file per game

2. **Event Storage** (`backend/src/event_storage.py`):
   - Location: `backend/data/events/*_events.json`
   - Stores: All game events (moves, prompts, responses, joins)
   - Format: One JSON file per game with all events

3. **Session Storage** (`backend/src/event_storage.py`):
   - Location: `backend/data/sessions/*_sessions.json`
   - Stores: User sessions for each game
   - Format: One JSON file per game with all sessions

### Saving Process

**Automatic Saving:**
- Games are saved automatically after:
  - Creating a game
  - Adding a player
  - Submitting a move
  - Resolving a round
  - Asking AI (events are saved)

**Manual Saving:**
- Games persist to disk via `game_storage.save_game(game_id)`
- Events are saved immediately when created
- Sessions are saved when created or updated

### File Structure

```
backend/data/
├── games/
│   ├── prisoner_dilemma_abc123.json    # Game state
│   └── prisoner_dilemma_def456.json
├── events/
│   ├── prisoner_dilemma_abc123_events.json  # All events for game
│   └── prisoner_dilemma_def456_events.json
└── sessions/
    ├── prisoner_dilemma_abc123_sessions.json  # All sessions for game
    └── prisoner_dilemma_def456_sessions.json
```

## Multi-Participant Support

### Session Management

**Creating a Session:**
1. User joins a game via `POST /game/{game_id}/join`
2. Session is created with `session_id` (from Authorization header)
3. Session stored in memory and persisted to disk

**Session Tracking:**
- Each request includes `session_id` in Authorization header
- Sessions track: `user_name`, `game_id`, `joined_at`, `last_active`
- Multiple users can have sessions for the same game

### Joining a Game

```bash
# Join a game
POST /game/{game_id}/join
Headers: Authorization: Bearer {session_id}
Body: { "user_name": "Alice" }

Response:
{
  "message": "Joined game as Alice",
  "session_id": "session_123",
  "user_name": "Alice",
  "game_id": "prisoner_dilemma_abc123"
}
```

### Getting Active Sessions

```bash
# Get all sessions for a game
GET /game/{game_id}/sessions

Response:
{
  "sessions": [
    {
      "session_id": "session_123",
      "user_name": "Alice",
      "game_id": "prisoner_dilemma_abc123",
      "joined_at": "2024-01-01T12:00:00",
      "last_active": "2024-01-01T12:05:00"
    }
  ],
  "count": 1
}
```

## Event Tracking

### Event Types

All game actions are tracked as events:

- `PLAYER_JOINED` - User joined the game
- `MOVE` - Player submitted a move
- `PROMPT` - User asked AI a question
- `RESPONSE` - AI responded to a prompt
- `ROUND_RESOLVED` - Round was resolved

### Event Structure

```json
{
  "event_id": "event_abc123",
  "game_id": "prisoner_dilemma_abc123",
  "event_type": "PROMPT",
  "actor_session_id": "session_123",
  "actor_name": "Alice",
  "data": {
    "prompt_id": "prompt_xyz789",
    "prompt_text": "What is the Nash equilibrium?",
    "thread_id": "thread_456",
    "parent_prompt_id": null
  },
  "parent_event_id": null,
  "timestamp": "2024-01-01T12:00:00"
}
```

### Getting Updates

```bash
# Get all events for a game
GET /game/{game_id}/updates

# Get events since a timestamp
GET /game/{game_id}/updates?since=2024-01-01T12:00:00

Response:
{
  "events": [...],
  "count": 10,
  "latest_timestamp": "2024-01-01T12:05:00"
}
```

## Thread-Based AI Conversations

### How It Works

**Threading Support:**
- Each conversation has a `thread_id`
- Prompts can reply to other prompts via `parent_prompt_id`
- Multiple participants can add to the same thread

### Creating a New Thread

```bash
POST /game/ask-ai
Body: {
  "game_id": "prisoner_dilemma_abc123",
  "prompt_text": "What is the Nash equilibrium?",
  "role": "analyst",
  "model": "openai:gpt-4",
  "thread_id": null,  # Auto-generated if not provided
  "parent_prompt_id": null
}

Response:
{
  "response": {...},
  "prompt_id": "prompt_xyz789",
  "thread_id": "thread_456",  # Auto-generated
  "message": "AI analysis completed"
}
```

### Replying to a Prompt

```bash
POST /game/ask-ai
Body: {
  "game_id": "prisoner_dilemma_abc123",
  "prompt_text": "Can you explain that in simpler terms?",
  "role": "analyst",
  "model": "openai:gpt-4",
  "thread_id": "thread_456",  # Same thread
  "parent_prompt_id": "prompt_xyz789"  # Reply to previous prompt
}
```

### Multi-Participant Conversations

**Scenario:** Alice and Bob are both in the same game.

1. **Alice asks:**
   ```json
   {
     "prompt_text": "What should I do?",
     "thread_id": null  // Creates new thread "thread_1"
   }
   ```

2. **Bob replies:**
   ```json
   {
     "prompt_text": "I think you should cooperate",
     "thread_id": "thread_1",  // Same thread
     "parent_prompt_id": null  // Top-level reply
   }
   ```

3. **Alice follows up:**
   ```json
   {
     "prompt_text": "Why?",
     "thread_id": "thread_1",  // Same thread
     "parent_prompt_id": "prompt_bob_123"  // Reply to Bob
   }
   ```

**Result:** All prompts are in the same thread, with conversation threading.

## API Endpoints Summary

### Game Management
- `POST /game/create` - Create a new game
- `GET /games` - List all games
- `POST /game/{game_id}/join` - Join a game
- `GET /game/{game_id}/state` - Get game state

### Players & Moves
- `POST /game/{game_id}/add-player` - Add a player
- `POST /game/{game_id}/submit-move` - Submit a move
- `POST /game/{game_id}/resolve-round` - Resolve round

### AI & Analysis
- `POST /game/ask-ai` - Ask AI (supports threading)
- `GET /game/{game_id}/equilibria` - Get Nash equilibria

### Multi-Participant
- `GET /game/{game_id}/sessions` - Get all sessions
- `GET /game/{game_id}/updates` - Get game events/updates

## Frontend Integration

### Session Management

**On App Load:**
```javascript
// Generate or retrieve session_id
const sessionId = localStorage.getItem('session_id') || generateSessionId();
localStorage.setItem('session_id', sessionId);

// Join game
await axios.post(`/game/${gameId}/join`, 
  { user_name: 'Alice' },
  { headers: { 'Authorization': `Bearer ${sessionId}` } }
);
```

### Polling for Updates

```javascript
// Poll for updates every 5 seconds
setInterval(async () => {
  const response = await axios.get(
    `/game/${gameId}/updates?since=${lastTimestamp}`,
    { headers: { 'Authorization': `Bearer ${sessionId}` } }
  );
  
  // Process new events
  response.data.events.forEach(event => {
    if (event.event_type === 'PROMPT') {
      // Show new prompt in UI
    }
    if (event.event_type === 'RESPONSE') {
      // Show new AI response
    }
  });
  
  lastTimestamp = response.data.latest_timestamp;
}, 5000);
```

### Thread-Based UI

**Display Threads:**
```javascript
// Group prompts by thread_id
const threads = {};
prompts.forEach(prompt => {
  const threadId = prompt.thread_id;
  if (!threads[threadId]) {
    threads[threadId] = [];
  }
  threads[threadId].push(prompt);
});

// Render threads
Object.entries(threads).map(([threadId, prompts]) => (
  <Thread key={threadId} threadId={threadId} prompts={prompts} />
));
```

## Security Notes

- **Session IDs**: Currently uses Authorization header Bearer token
- **In Production**: Implement proper JWT authentication
- **Session Validation**: Validate session_id on each request
- **Rate Limiting**: Consider rate limiting for AI endpoints

## Example Workflow

1. **Alice creates game:**
   - `POST /game/create` → Returns `game_id`
   - Event: `PLAYER_JOINED` (Alice)

2. **Bob joins game:**
   - `POST /game/{game_id}/join` → Bob's session created
   - Event: `PLAYER_JOINED` (Bob)

3. **Both add players:**
   - Alice: `POST /game/{game_id}/add-player` → Event: `MOVE` (implicit)
   - Bob: `POST /game/{game_id}/add-player` → Event: `MOVE` (implicit)

4. **Alice asks AI:**
   - `POST /game/ask-ai` → Creates thread, Event: `PROMPT`
   - AI responds → Event: `RESPONSE`

5. **Bob replies in thread:**
   - `POST /game/ask-ai` with `thread_id` → Event: `PROMPT`
   - AI responds → Event: `RESPONSE`

6. **Both submit moves:**
   - Alice: `POST /game/{game_id}/submit-move` → Event: `MOVE`
   - Bob: `POST /game/{game_id}/submit-move` → Event: `MOVE`

7. **Alice resolves round:**
   - `POST /game/{game_id}/resolve-round` → Event: `ROUND_RESOLVED`

8. **Both poll for updates:**
   - `GET /game/{game_id}/updates` → See all events

## Summary

✅ **Games are saved** to `backend/data/games/*.json`  
✅ **Events are saved** to `backend/data/events/*_events.json`  
✅ **Sessions are saved** to `backend/data/sessions/*_sessions.json`  
✅ **Multiple participants** can join via `POST /game/{game_id}/join`  
✅ **Thread-based conversations** via `thread_id` and `parent_prompt_id`  
✅ **Real-time updates** via `GET /game/{game_id}/updates`  

All functionality from game5multi is now included in game6multi!
