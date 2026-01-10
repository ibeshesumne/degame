# Game6Multi Architecture

## System Overview

Game6Multi is a full-stack web application consisting of:
- **Frontend**: React + Vite application (client-side)
- **Backend**: Python FastAPI application (server-side)
- **Storage**: JSON file-based persistence
- **AI Integration**: OpenAI GPT-4/3.5 and Anthropic Claude

## High-Level Architecture

```
┌─────────────────┐
│   React Frontend │  (Port 5173)
│   (Vite + React) │
└────────┬────────┘
         │ HTTP/REST API
         │ (CORS enabled)
         ▼
┌─────────────────┐
│  FastAPI Backend │  (Port 8000)
│   (Python)       │
└────────┬────────┘
         │
         ├──► Game Engine (in-memory)
         ├──► AI Orchestrator
         ├──► Analytics Engine
         ├──► Game Storage (JSON files)
         └──► Event Storage (JSON files)
```

## Frontend Architecture

### Technology Stack
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React hooks (useState, useEffect)

### Component Structure

```
App.jsx (Root Component)
├── JoinGame
│   └── User name input
│   └── Game ID input
├── GameBoard
│   └── Player move selection
│   └── Round resolution
├── PlayerSetup
│   └── Add player form
│   └── Player list
├── AIPanel
│   └── Prompt input
│   └── Role/model selection
├── AIConversations
│   └── Thread display
│   └── Conversation view
├── EquilibriaDisplay
│   └── Compute button
│   └── Results display
├── ActiveSessions
│   └── Session list
└── EventFeed
    └── Event stream
```

### Frontend State Management

**Global State (App.jsx)**:
- `gameId`: Current game identifier
- `gameState`: Current game state object
- `players`: Array of player objects
- `equilibria`: Nash equilibrium results
- `userName`: Current user's name
- `sessionId`: Current user's session ID
- `sessions`: Array of active sessions
- `events`: Array of game events
- `lastUpdateTime`: Timestamp for polling

**State Flow**:
1. User actions trigger API calls
2. API responses update state
3. Components re-render based on state
4. Polling updates state every 2 seconds

### Frontend API Integration

**Base URL**: `import.meta.env.VITE_API_BASE` or `http://localhost:8000`

**Key API Calls**:
- `POST /game/create` - Create new game
- `POST /game/{game_id}/join` - Join game
- `GET /game/{game_id}/state` - Get game state
- `POST /game/{game_id}/add-player` - Add player
- `POST /game/{game_id}/submit-move` - Submit move
- `POST /game/{game_id}/resolve-round` - Resolve round
- `GET /game/{game_id}/equilibria` - Compute equilibria
- `POST /game/ask-ai` - Ask AI question
- `GET /game/{game_id}/updates` - Get events (polling)
- `GET /game/{game_id}/sessions` - Get sessions

**Polling Mechanism**:
- Polls `/game/{game_id}/updates` every 2 seconds
- Uses `since` parameter to get only new events
- Updates `events` state with new events
- Refreshes game state if moves detected

## Backend Architecture

### Technology Stack
- **Framework**: FastAPI (Python)
- **API**: RESTful API with JSON
- **Storage**: JSON files (file-based)
- **AI**: OpenAI and Anthropic SDKs
- **CORS**: Enabled for frontend access

### Core Components

#### 1. Main API (`main.py`)

**Responsibilities**:
- API endpoint definitions
- Request/response handling
- Authentication (simplified Bearer token)
- Session management
- Game state management

**Key Endpoints**:
```
GET  /                          - API info
POST /game/create               - Create game
GET  /games                     - List games
POST /game/{game_id}/join       - Join game
GET  /game/{game_id}/state       - Get state
POST /game/{game_id}/add-player - Add player
POST /game/{game_id}/submit-move - Submit move
POST /game/{game_id}/resolve-round - Resolve round
GET  /game/{game_id}/equilibria - Compute equilibria
POST /game/ask-ai               - AI prompt
GET  /game/{game_id}/updates    - Get events
GET  /game/{game_id}/sessions   - Get sessions
```

**In-Memory Storage**:
- `games: Dict[str, GameEngine]` - Active games in memory
- `sessions: Dict[str, UserSession]` - Active sessions

**Startup**:
- Loads all saved games from storage on startup
- Games persist to disk after operations

#### 2. Game Engine (`game_engine.py`)

**Responsibilities**:
- Game state management
- Move validation
- Round resolution
- Payoff calculation
- Strategy tracking

**Key Classes**:
- `GameEngine`: Main game logic
- `create_prisoner_dilemma_game()`: Factory function

**Game State**:
- Current round number
- Players dictionary
- Strategies list (history)
- Current strategies (pending moves)
- History of round results
- Payoff matrix

**Operations**:
- `add_player()`: Add player to game
- `submit_move()`: Record player move
- `resolve_round()`: Calculate payoffs and advance round
- `get_current_state()`: Return game state
- `get_player_payoff()`: Get payoff for player

#### 3. AI Orchestrator (`ai_orchestrator.py`)

**Responsibilities**:
- AI model routing
- Prompt building
- Response handling
- Error management
- Timeout handling

**Key Classes**:
- `AIOrchestrator`: Main AI handler

**Supported Models**:
- OpenAI GPT-4 (`openai:gpt-4`)
- OpenAI GPT-3.5 (`openai:gpt-3.5-turbo`)
- Anthropic Claude (`anthropic:claude`)
- Local models (`local:llama`) - placeholder

**AI Roles**:
- `PLAYER`: Strategic move recommendations
- `ANALYST`: Game theory analysis (most common)
- `REFEREE`: Objective evaluation
- `ETHICAL_REVIEWER`: Ethical perspective
- `FAST_SIMULATION`: Quick predictions

**Prompt Building**:
- Includes game context
- Includes Nash equilibria (if computed)
- Includes payoff matrix
- Role-specific instructions
- General analysis mode support

**Response Handling**:
- 60-second timeout
- Error handling (rate limits, auth, timeouts)
- Response parsing
- Analysis extraction

#### 4. Analytics Engine (`analytics_engine.py`)

**Responsibilities**:
- Nash equilibrium computation
- Dominant strategy detection
- Pareto efficiency analysis
- Stability analysis

**Key Classes**:
- `AnalyticsEngine`: Mathematical analysis

**Algorithms**:
- **Nash Equilibrium**: Brute force check of all strategy combinations
- **Dominant Strategies**: Compare strategies across all opponent combinations
- **Pareto Efficiency**: Check if any outcome Pareto dominates
- **Stability Analysis**: Analyze equilibrium properties

**Dependencies**:
- NumPy for numerical operations
- itertools for combinations

#### 5. Storage (`storage.py`)

**Responsibilities**:
- Game state persistence
- File I/O operations
- JSON serialization/deserialization
- File locking (Unix)

**Key Classes**:
- `GameStorage`: Game state storage

**Storage Location**: `backend/data/games/{game_id}.json`

**Operations**:
- `save_game()`: Save game to JSON file
- `load_game()`: Load game from JSON file
- `list_games()`: List all saved games
- `delete_game()`: Delete game file

**File Format**: JSON with 2-space indentation

**Thread Safety**: File locking (fcntl) on Unix systems

#### 6. Event Storage (`event_storage.py`)

**Responsibilities**:
- Event persistence
- Session persistence
- Event querying
- Timestamp filtering

**Key Classes**:
- `EventStorage`: Event and session storage

**Storage Locations**:
- Events: `backend/data/events/{game_id}_events.json`
- Sessions: `backend/data/sessions/{game_id}_sessions.json`

**Event Types**:
- `MOVE`: Player move submitted
- `PROMPT`: AI prompt created
- `RESPONSE`: AI response received
- `ROUND_RESOLVED`: Round completed
- `PLAYER_JOINED`: Player joined game
- `PLAYER_LEFT`: Player left game

**Operations**:
- `create_event()`: Create and save event
- `get_events()`: Query events (with filtering)
- `create_session()`: Create/update session
- `get_sessions()`: Get all sessions for game
- `update_session_activity()`: Update last_active timestamp

### Data Models (`models.py`)

**Core Models** (Pydantic):
- `Player`: Player information
- `Strategy`: Move/strategy choice
- `PayoffMatrix`: Game payoff structure
- `GameState`: Current game state
- `AIPrompt`: AI prompt request
- `AIResponse`: AI response
- `EquilibriumResult`: Nash equilibrium results
- `UserSession`: User session information
- `GameEvent`: Event tracking

**Enums**:
- `PlayerType`: HUMAN, AI
- `MoveType`: COOPERATE, DEFECT, etc.
- `AIRole`: PLAYER, ANALYST, REFEREE, etc.
- `AIModel`: OPENAI_GPT4, OPENAI_GPT35, ANTHROPIC_CLAUDE
- `EventType`: MOVE, PROMPT, RESPONSE, etc.

## Storage Architecture

### File Structure

```
backend/data/
├── games/
│   ├── prisoner_dilemma_014a4902.json
│   └── prisoner_dilemma_03af77ab.json
├── events/
│   ├── prisoner_dilemma_014a4902_events.json
│   └── general_analysis_events.json
└── sessions/
    ├── prisoner_dilemma_014a4902_sessions.json
    └── prisoner_dilemma_03af77ab_sessions.json
```

### Storage Strategy

**Three-File System**:
1. **Game State File**: Core game structure and current state
2. **Events File**: All game events (actions, AI interactions)
3. **Sessions File**: User session information

**Persistence**:
- Games saved after: creation, player addition, move submission, round resolution
- Events saved immediately when created
- Sessions saved when created or updated

**Loading**:
- Games loaded from disk on backend startup
- Events loaded on-demand via API
- Sessions loaded on-demand via API

## API Architecture

### Request/Response Format

**Request Headers**:
```
Authorization: Bearer {session_id}
Content-Type: application/json
```

**Response Format**:
```json
{
  "game_id": "prisoner_dilemma_abc123",
  "game_state": { ... },
  "message": "Success"
}
```

### Error Handling

**Error Response Format**:
```json
{
  "detail": "Error message"
}
```

**HTTP Status Codes**:
- `200`: Success
- `400`: Bad request
- `404`: Not found
- `500`: Server error

### CORS Configuration

**Allowed Origins**:
- Development: `localhost:3000`, `localhost:5173`
- Production: Configurable via `ALLOWED_ORIGINS` env var
- Default: All origins (`*`) if not specified

## Security Architecture

### Current Implementation

**Authentication**:
- Simplified Bearer token (session_id)
- No JWT validation
- Session ID in Authorization header

**Security Notes**:
- ⚠️ **Not Production Ready**: Current auth is simplified
- ⚠️ **No Rate Limiting**: API endpoints not rate-limited
- ⚠️ **CORS**: Currently allows all origins (configurable)

### Recommended for Production

1. **JWT Authentication**: Proper token validation
2. **Rate Limiting**: Prevent abuse
3. **CORS Restrictions**: Limit allowed origins
4. **Input Validation**: Already done via Pydantic
5. **HTTPS**: Enforce HTTPS in production
6. **API Key Security**: Secure API key storage

## Deployment Architecture

### Frontend Deployment

**Platform**: Vercel (recommended)
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_API_BASE`

### Backend Deployment

**Platform Options**:
- Railway: Easy Python deployment
- Render: Free tier available
- Fly.io: Good for Python apps
- Heroku: Classic option

**Requirements**:
- Python 3.8+
- Environment variable: `OPENAI_API_KEY`
- Port: Configurable via `PORT` env var
- Start command: `python -m src` or `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

### Storage Considerations

**Current**: JSON files (ephemeral on many platforms)
**Production Recommendations**:
- Database: PostgreSQL or MongoDB
- Persistent storage: S3, Azure Blob, etc.
- Backup strategy: Regular backups
- Migration: Can migrate from JSON to database

## Component Interactions

### Game Creation Flow

```
User → Frontend → POST /game/create
                ↓
         Backend creates GameEngine
                ↓
         Save to storage
                ↓
         Create PLAYER_JOINED event
                ↓
         Return game_id
                ↓
         Frontend updates state
```

### Move Submission Flow

```
User selects move → Frontend → POST /game/{id}/submit-move
                              ↓
                       GameEngine.submit_move()
                              ↓
                       Save game state
                              ↓
                       Create MOVE event
                              ↓
                       Return success
                              ↓
                       Frontend polls for updates
```

### AI Request Flow

```
User asks AI → Frontend → POST /game/ask-ai
                        ↓
                 Create PROMPT event
                        ↓
                 AIOrchestrator.process_prompt()
                        ↓
                 Build prompt with context
                        ↓
                 Call AI API (OpenAI/Anthropic)
                        ↓
                 Create RESPONSE event
                        ↓
                 Return response
                        ↓
                 Frontend displays response
```

### Equilibrium Computation Flow

```
User clicks Compute → Frontend → GET /game/{id}/equilibria
                                  ↓
                           AnalyticsEngine.compute_nash_equilibrium()
                                  ↓
                           Calculate all combinations
                                  ↓
                           Find Nash equilibria
                                  ↓
                           Find dominant strategies
                                  ↓
                           Find Pareto-efficient outcomes
                                  ↓
                           Return EquilibriumResult
                                  ↓
                           Frontend displays results
```

## Scalability Considerations

### Current Limitations

1. **In-Memory Games**: All games loaded in memory
2. **File-Based Storage**: Doesn't scale to thousands of games
3. **No Caching**: No caching layer
4. **Synchronous Operations**: All operations synchronous
5. **No Load Balancing**: Single backend instance

### Scaling Strategies

1. **Database Migration**: Move from JSON to database
2. **Caching Layer**: Redis for frequently accessed data
3. **Load Balancing**: Multiple backend instances
4. **Async Operations**: Async/await for I/O operations
5. **Event Streaming**: Kafka/RabbitMQ for events
6. **CDN**: Static asset delivery
7. **Horizontal Scaling**: Multiple backend servers

## Summary

Game6Multi uses a modern full-stack architecture:
- **Frontend**: React with real-time polling
- **Backend**: FastAPI with modular components
- **Storage**: JSON files (can migrate to database)
- **AI**: Multiple model support with orchestration
- **Analytics**: Mathematical Nash equilibrium computation

The architecture is designed for:
- Multi-participant collaboration
- Real-time updates
- AI integration
- Game theory analysis
- Easy deployment
