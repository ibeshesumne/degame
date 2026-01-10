# Game6Multi Complete Documentation

**Last Updated**: January 2026

This document contains comprehensive documentation for the Game6Multi game-theoretic platform, combining all documentation into a single reference.

## Table of Contents

1. [Introduction](#introduction)
2. [How to Play](#how-to-play-game6multi)
   - [Getting Started](#getting-started)
   - [Game Mechanics](#game-mechanics)
   - [Multi-Participant Features](#multi-participant-features)
   - [AI Features](#ai-features)
   - [Nash Equilibrium Analysis](#nash-equilibrium-analysis)
3. [System Architecture](#game6multi-architecture)
   - [Frontend Architecture](#frontend-architecture)
   - [Backend Architecture](#backend-architecture)
   - [Storage Architecture](#storage-architecture)
   - [API Architecture](#api-architecture)
4. [Data Flow](#data-flow-in-game6multi)
   - [Data Presentation](#data-presentation)
   - [Data Creation](#data-creation)
   - [Data Saving](#data-saving)
   - [Data Storage](#data-storage)
5. [Game Lifecycle](#game-lifecycle-and-traces)
   - [Initial Game State](#initial-game-state)
   - [Trace Development](#trace-development)
   - [Trace Growth Patterns](#trace-growth-patterns)
6. [Data Statistics](#data-statistics)
   - [Core Operating Files](#core-operating-files)
   - [Generated Data Statistics](#generated-data-statistics)
   - [Content by Type](#content-by-type-statistics)
7. [AI and Two-Player Context](#how-the-two-player-setup-impacts-ai-responses)
   - [Game Context Structure](#what-the-ai-sees-game-context-structure)
   - [Impact on Responses](#how-two-player-setup-impacts-responses)
8. [Participants vs Players](#participants-vs-players-how-ai-responses-reflect-two-player-types)
   - [Key Distinction](#key-distinction)
   - [AI Response Patterns](#ai-response-patterns-for-two-players)
   - [Current Limitations](#current-limitations)

---

## Introduction

Game6Multi is a game-theoretic platform that allows multiple participants to play strategic games (currently Prisoner's Dilemma), analyze Nash equilibria, and interact with AI for strategic analysis.

### Current Game State

This documentation describes the game **as it stands now** (January 2026), including:

- **Multi-participant support**: Multiple users can join games simultaneously
- **Real-time event tracking**: All actions tracked and synchronized
- **AI integration**: OpenAI GPT-4/3.5 and Anthropic Claude support
- **Nash equilibrium computation**: Mathematical analysis of game outcomes
- **JSON-based file storage**: Simple, portable data persistence
- **Thread-based AI conversations**: Organized AI interaction threads

### Documentation Structure

This combined document includes:

1. **How to Play**: Complete user guide
2. **System Architecture**: Technical system design
3. **Data Flow**: How data moves through the system
4. **Game Lifecycle**: What games start with and how they evolve
5. **Data Statistics**: Storage and content analysis
6. **AI Context**: How two-player setup impacts AI responses
7. **Participants vs Players**: Distinction between users and game entities

Historical documentation and deployment guides are stored in the `scratch/` folder.

---

# How to Play Game6Multi

## Overview

Game6Multi is a game-theoretic platform that allows multiple participants to play strategic games (currently Prisoner's Dilemma), analyze Nash equilibria, and interact with AI for strategic analysis.

## Getting Started

### Prerequisites

1. **Backend Server**: The Python FastAPI backend must be running
   ```bash
   cd backend
   python -m src
   ```
   Backend runs on `http://localhost:8000` by default

2. **Frontend Application**: The React frontend must be running
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173` by default

3. **Open Browser**: Navigate to `http://localhost:5173`

### Initial Setup

1. **Enter Your Name**: When you first open the application, you'll see a "Join Game" form
2. **Choose an Option**:
   - **Create New Game**: Leave Game ID empty and click "Join" - a new game will be created
   - **Join Existing Game**: Enter a Game ID shared by another player and click "Join"

3. **Game ID**: Once in a game, you'll see the Game ID displayed prominently at the top
   - Share this ID with others to let them join your game
   - Multiple participants can join the same game simultaneously

## Game Mechanics

### Game Type: Prisoner's Dilemma

The game implements a classic Prisoner's Dilemma with two players:
- **Player 1** and **Player 2**
- Each player can choose: **Cooperate** or **Defect**

### Payoff Matrix

The classic Prisoner's Dilemma payoffs:
- **Both Cooperate (CC)**: Both players get 3 points
- **One Cooperates, One Defects (CD/DC)**: 
  - Cooperating player gets 0 points
  - Defecting player gets 5 points
- **Both Defect (DD)**: Both players get 1 point

### Game Flow

1. **Add Players**: 
   - Click "Add Player" button
   - Enter player details:
     - Name
     - Type (Human or AI)
     - Role (optional)
     - Objectives (optional)
     - Constraints (optional)
   - Players are added to the game

2. **Submit Moves**:
   - For each player, select either "Cooperate" or "Defect"
   - Click "Submit Move" for each player
   - Moves are stored but not resolved until all players have moved

3. **Resolve Round**:
   - Once all players have submitted moves, the "Resolve Round" button appears
   - Click it to:
     - Calculate payoffs based on the payoff matrix
     - Record the round results
     - Advance to the next round
   - Round results show the payoffs for each player

4. **Multiple Rounds**:
   - The game continues with multiple rounds
   - Each round starts fresh (players submit new moves)
   - History of all rounds is maintained

## Multi-Participant Features

### Joining Games

- **Multiple Users**: Multiple users can join the same game simultaneously
- **Real-Time Updates**: All participants see moves and events in real-time (polled every 2 seconds)
- **Session Management**: Each user has a unique session ID
- **Active Sessions**: See who else is in the game via the "Active Sessions" panel

### Sharing Games

1. **Create a Game**: One user creates a game and gets a Game ID
2. **Share Game ID**: Share the Game ID with other participants
3. **Others Join**: Other users enter the Game ID and their name to join
4. **Collaborative Play**: All participants can:
   - Add players
   - Submit moves
   - Ask AI questions
   - View game state
   - See all events

## AI Features

### AI Panel

The AI Panel allows you to ask questions about:
- Game theory concepts
- Strategic analysis
- Current game state
- General topics (analyzed through game theory)

### Using AI

1. **Select Role**: Choose an AI role:
   - **Analyst**: Game theory analysis (most common)
   - **Player**: Strategic move recommendations
   - **Referee**: Objective evaluation
   - **Ethical Reviewer**: Ethical perspective
   - **Fast Simulation**: Quick outcome predictions

2. **Select Model**: Choose AI model:
   - **OpenAI GPT-4**: Most capable
   - **OpenAI GPT-3.5**: Faster, cheaper
   - **Anthropic Claude**: Alternative analysis style

3. **Enter Question**: Type your question in the text area

4. **General Analysis**: Check "General Analysis" if your question is about a general topic (not specific to the current game)

5. **Submit**: Click "Ask AI" to get a response

### Thread-Based Conversations

- **Threads**: Related prompts and responses are grouped into threads
- **Reply to Thread**: Click on a conversation thread to reply
- **Thread View**: See all prompts and responses in a thread
- **Multi-Participant Threads**: Multiple users can contribute to the same thread

### AI Response Features

- **Full Text Storage**: Complete AI responses are saved
- **Event Tracking**: Each prompt and response is tracked as an event
- **Linked Responses**: Responses are linked to their prompts via `parent_event_id`
- **Thread Linking**: All messages in a thread share the same `thread_id`

## Nash Equilibrium Analysis

### Computing Equilibria

1. **Click "Compute"**: In the Equilibria Display panel, click "Compute"
2. **View Results**: See:
   - **Nash Equilibria**: Strategy combinations where no player can improve by changing unilaterally
   - **Dominant Strategies**: Strategies that are always better regardless of opponent's choice
   - **Pareto-Efficient Outcomes**: Outcomes where no player can be made better off without making another worse off
   - **Stability Analysis**: Analysis of equilibrium stability

### Understanding Results

- **Nash Equilibrium**: The stable outcome(s) of the game
- **Multiple Equilibria**: Some games have multiple Nash equilibria
- **Pareto Efficiency**: Whether the equilibrium is socially optimal
- **Dominant Strategy**: If a player has a dominant strategy, they should always play it

## User Interface Components

### Main Components

1. **Game Board**: 
   - Shows current round
   - Displays players and their moves
   - Submit moves interface
   - Resolve round button

2. **Player Setup**:
   - Add new players
   - View existing players
   - Player details

3. **AI Panel**:
   - Ask AI questions
   - Select role and model
   - General analysis toggle

4. **AI Conversations**:
   - View all AI prompts and responses
   - Thread-based organization
   - Reply to threads

5. **Equilibria Display**:
   - Compute Nash equilibria
   - View equilibrium results
   - Analysis details

6. **Active Sessions**:
   - See who's in the game
   - Session information

7. **Event Feed**:
   - Real-time event stream
   - All game actions
   - Timestamps

## Tips and Best Practices

### For Single Player
- Add both players yourself
- Submit moves for each player
- Use AI to analyze strategies
- Compute equilibria to understand optimal play

### For Multi-Player
- Share Game ID with collaborators
- Coordinate moves (or don't - it's a game!)
- Use AI threads for discussion
- Watch the event feed for real-time updates

### For AI Analysis
- Use "Analyst" role for game theory questions
- Use "General Analysis" for topics outside the current game
- Create threads for related questions
- Review AI responses in the Conversations panel

### For Strategic Play
- Compute Nash equilibria before playing
- Understand dominant strategies
- Consider Pareto efficiency
- Use AI to explore strategic options

## Troubleshooting

### Backend Not Connected
- **Error**: "Cannot connect to backend"
- **Solution**: Make sure backend is running (`cd backend && python -m src`)

### Game Not Loading
- **Error**: Game state not updating
- **Solution**: Check browser console for errors, refresh page

### AI Not Responding
- **Error**: AI request fails or times out
- **Solution**: 
  - Check API key is configured
  - Wait and retry (AI services can be slow)
  - Check backend logs for errors

### Events Not Updating
- **Error**: Not seeing other players' moves
- **Solution**: 
  - Events poll every 2 seconds automatically
  - Check that you're in the same game (same Game ID)
  - Refresh page if needed

## Advanced Features

### General Analysis Mode

Ask AI about ANY topic through game theory:
- Political situations
- Economic scenarios
- International relations
- Business strategies
- Any strategic situation

The AI will analyze it using game theory principles:
- Identify strategic players
- Analyze possible strategies
- Compute Nash equilibria
- Discuss optimal outcomes

### Thread Management

- **Create Thread**: First prompt in a topic creates a thread
- **Reply to Thread**: Click on a thread to reply
- **View Thread**: See all messages in a thread
- **Multiple Threads**: Create multiple threads for different topics

### Event Tracking

All actions are tracked:
- Player joins
- Moves submitted
- Rounds resolved
- AI prompts
- AI responses

View events in the Event Feed component.

## Summary

Game6Multi is a collaborative game-theoretic platform where:
- Multiple users can play together
- AI provides strategic analysis
- Nash equilibria are computed automatically
- All actions are tracked and saved
- Thread-based conversations organize AI interactions

Enjoy exploring game theory through interactive play and AI analysis!


---

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


---

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


---

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


---

# Data Statistics

This document provides comprehensive statistics on the data stored by Game6Multi, including core operating files, generated data, and content by type.

## Current System Statistics

**Analysis Date**: January 2026  
**Total Games**: 21  
**Total Event Files**: 22  
**Total Session Files**: 9  
**Total Storage**: 54,387 bytes (53.11 KB)

## Core Operating Files

### Game State Files

**Location**: `backend/data/games/{game_id}.json`

**Statistics**:
- **Total Files**: 21
- **Average Size**: 1,710 bytes (1.67 KB)
- **Size Range**: 1,618 - 2,135 bytes (1.58 - 2.08 KB)
- **Total Storage**: 35,910 bytes (~35 KB)
- **Min Size**: 1,618 bytes (empty game)
- **Max Size**: 2,135 bytes (game with players and moves)

**Content Breakdown**:
- Base structure: ~1,600 bytes
- Per player: +200-300 bytes
- Per strategy/move: +150-200 bytes
- Per history entry: +100-150 bytes

**Storage Percentage**: 66% of total storage

### Event Files

**Location**: `backend/data/events/{game_id}_events.json`

**Statistics**:
- **Total Files**: 22
- **Average Size**: 740 bytes (0.72 KB)
- **Size Range**: 324 - 4,143 bytes (0.32 - 4.05 KB)
- **Total Storage**: 16,280 bytes (~16 KB)
- **Average Events per File**: 1.6 events
- **Min Size**: 324 bytes (single PLAYER_JOINED event)
- **Max Size**: 4,143 bytes (game with AI interactions)

**Storage Percentage**: 30% of total storage

### Session Files

**Location**: `backend/data/sessions/{game_id}_sessions.json`

**Statistics**:
- **Total Files**: 9
- **Average Size**: 246 bytes (0.24 KB)
- **Size Range**: 235 - 257 bytes (0.23 - 0.25 KB)
- **Total Storage**: 2,214 bytes (~2 KB)
- **Average Sessions per File**: 1.0 session
- **Min Size**: 235 bytes
- **Max Size**: 257 bytes

**Storage Percentage**: 4% of total storage

## Generated Data Statistics

### Per-Game Totals

**Average Total Storage per Game**: 2,422 bytes (2.37 KB)

**Breakdown**:
- Game state: ~1,710 bytes (70.6%)
- Events: ~607 bytes (25.1%)
- Sessions: ~105 bytes (4.3%)

**Range**:
- Minimum: ~1,900 bytes (game with minimal activity)
- Maximum: ~6,500 bytes (game with extensive AI interactions)

### Storage Growth Patterns

#### Game State File Growth

**Base Size**: ~1,600 bytes (empty game)

**Growth Rates**:
- Per player added: +200-300 bytes
- Per strategy/move: +150-200 bytes
- Per history entry: +100-150 bytes

**Projected Sizes**:
- Empty game: 1,600 bytes
- +2 players: 2,100 bytes
- +10 moves: 3,600 bytes
- +5 rounds: 4,100 bytes
- +50 moves: 9,100 bytes
- +100 rounds: 16,000 bytes

**Estimated Maximum**: 10-20 KB for heavily played game (100+ rounds)

#### Event File Growth

**Base Size**: 0 bytes (empty array)

**Growth Rates**:
- Per simple event (MOVE, PLAYER_JOINED): +300-400 bytes
- Per AI prompt event: +467 bytes (average)
- Per AI response event: +1,126 bytes (average, highly variable)

**Projected Sizes**:
- Empty: 0 bytes
- +10 simple events: 3,500 bytes
- +5 AI prompts: 2,335 bytes
- +5 AI responses: 5,630 bytes
- **Subtotal**: ~11,465 bytes (~11 KB)
- +50 AI interactions: ~80,000 bytes (~80 KB)
- +100 AI interactions: ~160,000 bytes (~160 KB)

**Estimated Maximum**: Can grow to 100+ KB with extensive AI interactions

#### Session File Growth

**Base Size**: 0 bytes (created on first join)

**Growth Rates**:
- Per session: +250 bytes

**Projected Sizes**:
- Empty: 0 bytes
- +1 session: 250 bytes
- +5 sessions: 1,250 bytes
- +10 sessions: 2,500 bytes
- +20 sessions: 5,000 bytes

**Estimated Maximum**: ~2-3 KB for games with many participants

## Content by Type Statistics

### Event Type Distribution

Based on analysis of 22 event files:

#### Event Types

**PLAYER_JOINED**:
- **Count**: ~15 events
- **Average Size**: 324 bytes
- **Total Storage**: ~4,860 bytes
- **Percentage**: ~30% of events

**MOVE**:
- **Count**: ~10 events
- **Average Size**: 350 bytes
- **Total Storage**: ~3,500 bytes
- **Percentage**: ~20% of events

**PROMPT** (AI Prompts):
- **Count**: 4 events
- **Average Size**: 467 bytes (0.46 KB)
- **Total Storage**: 1,869 bytes (1.83 KB)
- **Percentage**: ~12% of events
- **Size Range**: 399 - 529 bytes

**RESPONSE** (AI Responses):
- **Count**: 4 events
- **Average Size**: 1,126 bytes (1.10 KB)
- **Total Storage**: 4,504 bytes (4.40 KB)
- **Percentage**: ~12% of events
- **Size Range**: 558 - 2,810 bytes

**ROUND_RESOLVED**:
- **Count**: ~5 events
- **Average Size**: 400 bytes
- **Total Storage**: ~2,000 bytes
- **Percentage**: ~15% of events

**Other Events**:
- **Count**: ~5 events
- **Average Size**: 350 bytes
- **Total Storage**: ~1,750 bytes
- **Percentage**: ~11% of events

### AI Content Statistics

#### Prompts

**Total Prompts**: 4

**Size Statistics**:
- Average: 467 bytes (0.46 KB)
- Min: 399 bytes (0.39 KB)
- Max: 529 bytes (0.52 KB)
- Total: 1,869 bytes (1.83 KB)

**Content Statistics**:
- Average prompt text length: ~100-150 characters
- Contains: prompt_text, prompt_id, role, model, thread_id

**Distribution by Game**:
- `general_analysis`: 3 prompts
- `prisoner_dilemma_2d1ac618`: 1 prompt

#### Responses

**Total Responses**: 4

**Size Statistics**:
- Average: 1,126 bytes (1.10 KB)
- Min: 558 bytes (0.54 KB)
- Max: 2,810 bytes (2.74 KB)
- Total: 4,504 bytes (4.40 KB)

**Content Statistics**:
- Average response text length: ~500-1,000 characters
- Contains: response_text (full AI response), prompt_id, role, model, thread_id
- Highly variable size (depends on AI response length)

**Distribution by Game**:
- `general_analysis`: 3 responses
- `prisoner_dilemma_2d1ac618`: 1 response

**Linking**:
- 100% of responses linked to prompts via `parent_event_id`
- All prompt-response pairs share same `game_id` and `thread_id`

### Game State Content Statistics

#### Players

**Total Players Across All Games**: ~30 players

**Per Game**:
- Average: ~1.4 players per game
- Range: 0-2 players per game
- Most games: 0-1 players (many games created but not played)

**Player Data Size**:
- Per player: ~200-300 bytes
- Includes: id, name, type, role, objectives, constraints, resources

#### Strategies

**Total Strategies Across All Games**: ~15 strategies

**Per Game**:
- Average: ~0.7 strategies per game
- Range: 0-5 strategies per game
- Most games: 0 strategies (games created but no moves)

**Strategy Data Size**:
- Per strategy: ~150-200 bytes
- Includes: player_id, move_type, round, timestamp, metadata

#### History Entries

**Total History Entries Across All Games**: ~10 entries

**Per Game**:
- Average: ~0.5 entries per game
- Range: 0-3 entries per game
- Most games: 0 entries (no rounds resolved)

**History Entry Size**:
- Per entry: ~100-150 bytes
- Includes: round, player_id, move, timestamp

### Session Content Statistics

**Total Sessions**: 9 sessions

**Per Game**:
- Average: ~1.0 session per game (for games with sessions)
- Range: 1-2 sessions per game
- Games with sessions: 9 out of 21 games (43%)

**Session Data Size**:
- Per session: ~250 bytes
- Includes: session_id, user_name, game_id, joined_at, last_active, metadata

**Session Activity**:
- Average sessions per active game: 1.0
- Most games have single participant
- Some games have 2 participants (multi-player)

## Storage Efficiency

### Compression Potential

**Current Format**: JSON (human-readable, uncompressed)

**Compression Ratios** (estimated):
- Game state files: ~60-70% compression possible
- Event files: ~50-60% compression possible
- Session files: ~40-50% compression possible

**If Compressed**:
- Current 54 KB could become ~25-30 KB
- Significant savings for large deployments

### Redundancy Analysis

**Duplication**:
- Payoff matrix stored twice (in game file and game_state)
- Some metadata duplicated across files

**Optimization Potential**:
- Store payoff matrix once, reference it
- Could reduce game state file size by ~200-300 bytes

## Content Type Breakdown

### By Storage Type

**Game State Files**:
- 35,910 bytes (66%)
- Core game structure
- Player data
- Strategy history
- Round history

**Event Files**:
- 16,280 bytes (30%)
- Action log
- AI interactions
- Event tracking

**Session Files**:
- 2,214 bytes (4%)
- User sessions
- Activity tracking

### By Content Category

**Core Game Data** (Game State):
- 35,910 bytes (66%)
- Essential for game operation
- Required for game restoration

**Activity Log** (Events):
- 16,280 bytes (30%)
- Audit trail
- Real-time updates
- AI conversations

**User Data** (Sessions):
- 2,214 bytes (4%)
- Participant tracking
- Activity monitoring

### By Data Volatility

**Static Data** (rarely changes):
- Payoff matrix: ~500 bytes per game
- Game structure: ~200 bytes per game
- **Total**: ~700 bytes per game (static)

**Semi-Static Data** (changes occasionally):
- Players: ~250 bytes per player
- **Total**: Variable (depends on players)

**Dynamic Data** (changes frequently):
- Strategies: ~175 bytes per move
- Events: ~350 bytes per event
- History: ~125 bytes per round
- **Total**: Grows with activity

## Growth Projections

### Short-Term Growth (10 games)

**Assumptions**:
- 10 active games
- 5 moves per game
- 2 AI interactions per game

**Projected Storage**:
- Game state: ~20 KB
- Events: ~8 KB
- Sessions: ~2 KB
- **Total**: ~30 KB

### Medium-Term Growth (50 games)

**Assumptions**:
- 50 active games
- 10 moves per game
- 5 AI interactions per game

**Projected Storage**:
- Game state: ~85 KB
- Events: ~50 KB
- Sessions: ~12 KB
- **Total**: ~147 KB

### Long-Term Growth (100 games)

**Assumptions**:
- 100 active games
- 20 moves per game
- 10 AI interactions per game

**Projected Storage**:
- Game state: ~170 KB
- Events: ~150 KB
- Sessions: ~25 KB
- **Total**: ~345 KB

### Heavy Usage Scenario (10 games, extensive activity)

**Assumptions**:
- 10 games
- 100 moves per game
- 50 AI interactions per game
- Long AI responses

**Projected Storage**:
- Game state: ~20 KB
- Events: ~600 KB (AI responses dominate)
- Sessions: ~2 KB
- **Total**: ~622 KB

## Storage Recommendations

### For Current Scale (< 100 games)

**Current Approach**: JSON files (adequate)
- Simple to manage
- Easy to debug
- Sufficient for current scale

### For Medium Scale (100-1,000 games)

**Recommendation**: Consider database migration
- PostgreSQL or MongoDB
- Better query performance
- Indexing for faster lookups
- Better concurrency handling

### For Large Scale (1,000+ games)

**Recommendation**: Database + Caching
- Database for persistence
- Redis for caching
- Event streaming (Kafka/RabbitMQ)
- CDN for static assets

### Storage Optimization Strategies

1. **Compression**: Compress JSON files (gzip)
2. **Archiving**: Archive old games/events
3. **Deduplication**: Remove duplicate data
4. **Partitioning**: Separate active/inactive games
5. **Cleanup**: Remove unused sessions

## Summary

### Current Statistics

- **Total Storage**: 54 KB for 21 games
- **Average per Game**: 2.4 KB
- **Largest Component**: Game state files (66%)
- **Fastest Growing**: Event files (with AI interactions)

### Key Insights

1. **Game State Files**: Largest component, grows with players/moves
2. **Event Files**: Can grow significantly with AI interactions
3. **Session Files**: Smallest component, minimal growth
4. **AI Content**: Prompts small (~467 bytes), responses larger (~1,126 bytes avg)
5. **Storage Efficiency**: JSON format is readable but not compressed

### Growth Characteristics

- **Linear Growth**: Game state and sessions grow linearly
- **Exponential Potential**: Event files can grow exponentially with AI usage
- **Predictable**: Growth patterns are predictable based on activity
- **Manageable**: Current scale is easily manageable with file storage

### Recommendations

- **Current**: File storage is adequate
- **Future**: Consider database migration for scale
- **Optimization**: Compression and archiving can help
- **Monitoring**: Track storage growth, especially event files


---

# How the Two-Player Setup Impacts AI Responses

This document explains how the Prisoner's Dilemma two-player structure (player_1 and player_2) affects how the AI responds to prompts.

## Overview

When you ask the AI a question, the system automatically includes the **current game context** in the prompt sent to the AI. This context includes information about the two-player setup, which significantly shapes the AI's responses.

## Two Modes: Game-Specific vs. General Analysis

The AI operates in two modes:

### 1. Game-Specific Mode (Default)

When `general_analysis=False` (default), the AI receives **full game context** including:
- Current players (player_1, player_2)
- Their names and roles
- Recent moves
- Complete payoff matrix
- Computed Nash equilibria

### 2. General Analysis Mode

When `general_analysis=True`, the AI receives **no game context** and analyzes the question as a general game theory problem, not tied to the current game.

## What the AI Sees: Game Context Structure

When you ask a game-specific question, the AI receives a prompt structured like this:

```
[Role Instructions - e.g., "You are a game theory analyst..."]

CURRENT GAME CONTEXT:
- Game ID: prisoner_dilemma_014a4902
- Current Round: 1
- Players:
  - Alice (ID: player_1, Type: human, Role: N/A)
  - Bob (ID: player_2, Type: human, Role: N/A)

RECENT STRATEGIES:
- Round 1: player_1 chose cooperate
- Round 1: player_2 chose defect

PAYOFF MATRIX:
player_1 strategies: cooperate, defect
player_2 strategies: cooperate, defect

Payoffs for each strategy combination:
  (cooperate,cooperate): player_1: 3.0, player_2: 3.0
  (cooperate,defect): player_1: 0.0, player_2: 5.0
  (defect,cooperate): player_1: 5.0, player_2: 0.0
  (defect,defect): player_1: 1.0, player_2: 1.0

COMPUTED NASH EQUILIBRIA:
  Equilibrium 1:
    Strategies: player_1: defect, player_2: defect
    Payoffs: player_1: 1, player_2: 1

DOMINANT STRATEGIES:
  player_1: defect
  player_2: defect

PARETO-EFFICIENT OUTCOMES:
  Outcome 1:
    Strategies: player_1: cooperate, player_2: cooperate
    Payoffs: player_1: 3, player_2: 3

USER QUESTION:
[Your question here]
```

## How Two-Player Setup Impacts Responses

### 1. **Player-Specific References**

The AI knows the exact players in your game:

**Example Question**: "What should player_1 do?"

**AI Response Impact**:
- AI can reference "player_1" or "Alice" specifically
- AI knows player_1's history of moves
- AI can analyze player_1's position relative to player_2
- AI can recommend strategies for player_1 specifically

**Without Context**: AI would give generic advice without knowing which player you're asking about.

### 2. **Payoff Matrix Awareness**

The AI sees the complete 2x2 payoff matrix:

**What This Means**:
- AI understands the exact payoffs for each combination
- AI knows that (cooperate, cooperate) = (3, 3)
- AI knows that (defect, defect) = (1, 1)
- AI can calculate which outcomes are best for each player

**Example Question**: "What's the best outcome?"

**AI Response Impact**:
- AI can reference specific payoff values: "The best outcome is (cooperate, cooperate) which gives both players 3 points"
- AI can compare outcomes: "While (cooperate, cooperate) gives 3 points each, (defect, cooperate) gives player_1 5 points but player_2 gets 0"
- AI understands the Prisoner's Dilemma structure

**Without Context**: AI would give theoretical advice without knowing your specific payoffs.

### 3. **Nash Equilibrium Context**

The AI receives computed Nash equilibria:

**What This Means**:
- AI knows the mathematical Nash equilibrium: (defect, defect)
- AI knows dominant strategies: both players should defect
- AI knows Pareto-efficient outcomes: (cooperate, cooperate) is better but unstable
- AI can explain why the equilibrium exists

**Example Question**: "What is the Nash equilibrium?"

**AI Response Impact**:
- AI can state: "The Nash equilibrium is (defect, defect) where both players get 1 point"
- AI can explain: "This is the Nash equilibrium because neither player can improve by unilaterally changing strategy"
- AI can contrast: "However, (cooperate, cooperate) is Pareto-efficient but not a Nash equilibrium because each player has incentive to defect"

**Without Context**: AI would explain Nash equilibrium theory but couldn't compute it for your specific game.

### 4. **Move History Awareness**

The AI sees recent moves (last 5 strategies):

**What This Means**:
- AI knows what moves have been played
- AI can analyze patterns: "Player_1 has been cooperating while player_2 has been defecting"
- AI can predict: "Given this history, player_2 might continue defecting"
- AI can recommend: "Player_1 should consider defecting to avoid exploitation"

**Example Question**: "What should I do next?"

**AI Response Impact**:
- AI can reference specific moves: "In Round 1, player_2 defected while you cooperated, giving them 5 points and you 0"
- AI can analyze patterns: "Player_2 has defected in both rounds, suggesting they're playing a defection strategy"
- AI can give contextual advice: "Given player_2's pattern, you might want to defect to avoid being exploited"

**Without Context**: AI would give generic strategic advice without knowing the game history.

### 5. **Round Awareness**

The AI knows the current round number:

**What This Means**:
- AI understands game progression
- AI can give different advice for early vs. late rounds
- AI can consider: "This is Round 1, so there's no history yet"
- AI can strategize: "In later rounds, you might use tit-for-tat"

**Example Question**: "What strategy should I use?"

**AI Response Impact**:
- Early rounds: "Since this is Round 1, you have no information about the other player's strategy yet"
- Later rounds: "Given the history, you might consider tit-for-tat: cooperate if they cooperated last round, defect if they defected"

**Without Context**: AI couldn't tailor advice to game stage.

## Concrete Examples

### Example 1: Player-Specific Question

**Question**: "What should Alice do?"

**With Two-Player Context**:
```
AI sees:
- Alice is player_1
- Bob is player_2
- Last round: Alice cooperated, Bob defected
- Payoff matrix shows Alice got 0 points, Bob got 5 points

AI Response: "Alice, you cooperated while Bob defected, giving you 0 points and Bob 5 points. 
Given Bob's defection, you might want to defect next round to avoid being exploited again. 
However, if Bob switches to cooperation, mutual cooperation (3,3) is better than mutual defection (1,1)."
```

**Without Context**:
```
AI Response: "In a Prisoner's Dilemma, players should consider their opponent's likely strategy..."
(Generic advice, no specific references)
```

### Example 2: Strategic Analysis

**Question**: "What's the best strategy?"

**With Two-Player Context**:
```
AI sees:
- Nash equilibrium: (defect, defect)
- Dominant strategy: defect for both players
- Pareto-efficient: (cooperate, cooperate) = (3,3)
- Current moves: player_1 cooperated, player_2 defected

AI Response: "The Nash equilibrium is (defect, defect) where both players get 1 point. 
However, (cooperate, cooperate) gives both players 3 points, which is Pareto-efficient but 
unstable because each player has incentive to defect. In your current game, player_2 defected 
while you cooperated, suggesting player_2 is playing the dominant strategy. You might want to 
match their strategy or try to signal cooperation."
```

**Without Context**:
```
AI Response: "In Prisoner's Dilemma, the dominant strategy is to defect, but this leads to 
a suboptimal outcome. Cooperation can lead to better outcomes if both players cooperate..."
(Theoretical explanation, no game-specific analysis)
```

### Example 3: Outcome Analysis

**Question**: "What happened in the last round?"

**With Two-Player Context**:
```
AI sees:
- Round 1: player_1 cooperated, player_2 defected
- Payoffs: player_1 got 0, player_2 got 5
- This matches the (cooperate, defect) outcome

AI Response: "In Round 1, player_1 (Alice) cooperated while player_2 (Bob) defected. 
According to the payoff matrix, this resulted in player_1 receiving 0 points and player_2 
receiving 5 points. This is the (cooperate, defect) outcome, which is favorable for player_2 
but unfavorable for player_1."
```

**Without Context**:
```
AI Response: "I don't have access to your game history. In general, when one player 
cooperates and the other defects in Prisoner's Dilemma..."
(No specific game information)
```

## Impact Summary

### What the Two-Player Setup Provides:

1. **Specificity**: AI can reference exact players (player_1, player_2) and their names
2. **Accuracy**: AI knows exact payoffs and can calculate outcomes precisely
3. **Relevance**: AI can analyze your specific game state, not just theory
4. **History**: AI can reference past moves and patterns
5. **Mathematics**: AI receives computed Nash equilibria and dominant strategies
6. **Context**: AI understands the current round and game progression

### What Changes Without Context:

1. **Generic Advice**: AI gives theoretical game theory advice
2. **No Specifics**: AI can't reference your players or moves
3. **No Calculations**: AI can't compute equilibria for your specific game
4. **No History**: AI can't analyze your game's progression
5. **Abstract**: AI discusses concepts rather than your actual game

## Technical Details

### How Context is Built

The system builds context in `_build_game_context()`:

1. **Player Information**: Loops through `game_state.players` and includes:
   - Player name
   - Player ID (player_1, player_2)
   - Player type (human/AI)
   - Player role (if set)

2. **Recent Strategies**: Takes last 5 strategies and shows:
   - Round number
   - Player ID
   - Move type (cooperate/defect)

3. **Payoff Matrix**: Formats the complete 2x2 matrix:
   - All strategy combinations
   - Payoffs for each player

4. **Nash Equilibria**: Computes and includes:
   - All Nash equilibria
   - Dominant strategies
   - Pareto-efficient outcomes

### When Context is Included

**Context Included When**:
- `general_analysis=False` (default)
- Question is about the current game
- Game has players and a payoff matrix

**Context Excluded When**:
- `general_analysis=True` (explicitly set)
- Question is detected as general (mentions topics like "China", "Taiwan", etc.)
- No game context available

## Best Practices

### For Game-Specific Questions

**Use Default Mode** (`general_analysis=False`):
- Ask about your specific players
- Ask about strategies for your game
- Ask about outcomes in your game
- Ask about Nash equilibria for your game

**Example Questions**:
- "What should player_1 do?"
- "What's the Nash equilibrium for this game?"
- "What happened in the last round?"
- "What's the best strategy given the current state?"

### For General Questions

**Use General Analysis Mode** (`general_analysis=True`):
- Ask about game theory concepts
- Ask about real-world scenarios
- Ask about topics unrelated to your game

**Example Questions**:
- "How should China deal with Taiwan?"
- "What's the best strategy for Ukraine?"
- "Explain Nash equilibrium in general"

## Conclusion

The two-player setup significantly impacts AI responses by providing:

1. **Specific Context**: Exact players, moves, and payoffs
2. **Mathematical Analysis**: Computed Nash equilibria and dominant strategies
3. **Historical Awareness**: Past moves and patterns
4. **Precise Recommendations**: Tailored to your specific game state

This makes AI responses **highly relevant and specific** to your actual game, rather than generic game theory advice. The AI can reference your players by name, analyze your specific payoff matrix, and provide recommendations based on your game's actual history and current state.


---

# Participants vs Players: How AI Responses Reflect Two-Player Types

This document clarifies the distinction between **participants** (users asking questions) and **players** (game entities), and explains how the AI generates responses that reflect the two-player structure (player_1 and player_2).

## Key Distinction

### Participants
- **Definition**: Users who join the game and interact with the AI
- **Role**: Ask questions, provide prompts, view game state
- **Identity**: Tracked via `session_id` and `user_name`
- **Actions**: Submit prompts to AI, view responses, participate in conversations

### Players
- **Definition**: Game entities in the Prisoner's Dilemma (player_1, player_2)
- **Role**: Make moves (cooperate/defect), receive payoffs
- **Identity**: Tracked via `player_id` ("player_1", "player_2")
- **Actions**: Submit moves, receive payoffs, have strategies

**Important**: A participant is NOT automatically a player. Participants can ask questions about players without being players themselves.

## Current System: How AI Sees Two Players

### What the AI Receives

When a **participant** asks a question, the AI receives game context that includes **both players**:

```
CURRENT GAME CONTEXT:
- Game ID: prisoner_dilemma_014a4902
- Current Round: 1
- Players:
  - Alice (ID: player_1, Type: human, Role: N/A)
  - Bob (ID: player_2, Type: human, Role: N/A)

RECENT STRATEGIES:
- Round 1: player_1 chose cooperate
- Round 1: player_2 chose defect

PAYOFF MATRIX:
player_1 strategies: cooperate, defect
player_2 strategies: cooperate, defect

Payoffs for each strategy combination:
  (cooperate,cooperate): player_1: 3.0, player_2: 3.0
  (cooperate,defect): player_1: 0.0, player_2: 5.0
  (defect,cooperate): player_1: 5.0, player_2: 0.0
  (defect,defect): player_1: 1.0, player_2: 1.0

COMPUTED NASH EQUILIBRIA:
  Equilibrium 1:
    Strategies: player_1: defect, player_2: defect
    Payoffs: player_1: 1, player_2: 1

DOMINANT STRATEGIES:
  player_1: defect
  player_2: defect
```

### How AI Distinguishes Between Players

The AI distinguishes between player_1 and player_2 through:

1. **Explicit References in Questions**: If the participant asks "What should player_1 do?", the AI knows to focus on player_1
2. **Player Names**: If the participant asks "What should Alice do?", the AI matches "Alice" to player_1
3. **Context Analysis**: The AI analyzes the question to determine which player is being discussed
4. **Game Context**: The AI sees both players' information and can compare them

## AI Response Patterns for Two Players

### Pattern 1: General Questions (No Specific Player)

**Participant Question**: "What's the Nash equilibrium?"

**AI Response**: 
- References **both players**: "The Nash equilibrium is (defect, defect) where **player_1** gets 1 point and **player_2** gets 1 point"
- Explains for **both players**: "Both **player_1** and **player_2** have dominant strategies to defect"
- Compares outcomes: "While (cooperate, cooperate) gives both players 3 points, the Nash equilibrium is (defect, defect) because **each player** has incentive to defect"

### Pattern 2: Player-Specific Questions

**Participant Question**: "What should player_1 do?"

**AI Response**:
- Focuses on **player_1**: "**Player_1** (Alice) should consider defecting because..."
- References **player_1's** position: "Given that **player_2** defected in Round 1, **player_1** might want to..."
- Analyzes **player_1's** payoffs: "If **player_1** cooperates while **player_2** defects, **player_1** gets 0 points, which is unfavorable"

**Participant Question**: "What should Alice do?" (Alice is player_1)

**AI Response**:
- Matches name to player: "**Alice (player_1)** should..."
- Uses both name and ID: "Given **Alice's** position as **player_1**..."
- References player_1's context: "**Player_1** (Alice) has been cooperating while **player_2** (Bob) has been defecting..."

### Pattern 3: Comparative Questions

**Participant Question**: "Which player is doing better?"

**AI Response**:
- Compares **both players**: "**Player_2** (Bob) is doing better because they defected while **player_1** cooperated, giving them 5 points vs **player_1's** 0 points"
- Analyzes **both positions**: "**Player_1** has been cooperating, receiving lower payoffs, while **player_2** has been defecting, receiving higher payoffs"
- References **both strategies**: "**Player_1's** cooperation strategy is being exploited by **player_2's** defection strategy"

### Pattern 4: Strategic Analysis Questions

**Participant Question**: "What's the best strategy?"

**AI Response**:
- Addresses **both players**: "The best strategy depends on which player you're asking about. For **player_1**, defecting is the dominant strategy. For **player_2**, defecting is also the dominant strategy"
- Explains **interaction**: "However, if **both players** defect, they each get only 1 point, whereas if **both players** cooperate, they each get 3 points"
- References **Nash equilibrium**: "The Nash equilibrium is (defect, defect) where **both players** defect, but this is suboptimal compared to mutual cooperation"

## AI Role: PLAYER vs ANALYST

### ANALYST Role (Default)

**Current Behavior**:
- Sees **both players** in context
- Analyzes the game from an **external perspective**
- Provides **objective analysis** of both players
- Can focus on specific players based on question content

**Example**:
- Question: "What should player_1 do?"
- Response: Analyzes player_1's position, considers player_2's strategy, recommends action for player_1

### PLAYER Role

**Current Behavior**:
- Intended to act as a **strategic player**
- Should recommend moves from a **player's perspective**
- **Limitation**: No `player_id` is currently passed, so AI doesn't know WHICH player to act as

**Current Implementation**:
```python
AIRole.PLAYER: "You are a strategic player in a game-theoretic scenario. 
Analyze the situation and recommend the best strategic move."
```

**Issue**: The AI receives both players but doesn't know which player it should represent.

**Potential Enhancement**: If `player_id` is provided:
- AI could act as that specific player
- AI could analyze from that player's perspective
- AI could recommend moves for that player specifically

## How Participants Can Target Specific Players

### Method 1: Explicit Player Reference

**In Question**:
- "What should player_1 do?"
- "What's the best move for player_2?"
- "How should Alice play?" (if Alice is player_1)

**AI Behavior**:
- Parses question for player reference
- Focuses response on that player
- References that player's position, payoffs, and strategies

### Method 2: Comparative Analysis

**In Question**:
- "Which player is doing better?"
- "Compare player_1 and player_2"
- "What's the difference between the players?"

**AI Behavior**:
- Analyzes both players
- Compares their strategies and payoffs
- Provides comparative analysis

### Method 3: General Game Analysis

**In Question**:
- "What's the Nash equilibrium?"
- "What's the best outcome?"
- "Explain the game"

**AI Behavior**:
- Analyzes the entire game
- References both players
- Provides comprehensive analysis

## Current Limitations

### 1. No Explicit Player Targeting

**Issue**: The `player_id` field exists in `AIPrompt` but is **not used** by participants:
- Frontend doesn't send `player_id`
- Participants can't explicitly say "act as player_1"
- AI must infer player focus from question text

**Impact**: 
- AI responses rely on natural language parsing
- May be ambiguous if question doesn't mention a player
- No way to force AI to act as a specific player

### 2. PLAYER Role Not Fully Utilized

**Issue**: When `role=PLAYER`, the AI doesn't know which player to act as:
- No `player_id` passed
- AI sees both players but doesn't know which to represent
- Response is generic "player perspective" rather than specific player

**Impact**:
- PLAYER role doesn't provide clear advantage over ANALYST role
- Can't have AI act as player_1 vs player_2 distinctly

### 3. Participant-Player Relationship Not Tracked

**Issue**: System doesn't track which participant "owns" which player:
- Participant asks "What should I do?" - AI doesn't know which player "I" refers to
- No mapping: participant → player
- AI must infer from context

**Impact**:
- Ambiguous questions may get generic responses
- Can't personalize responses based on participant's player

## How AI Responses Reflect Two-Player Structure

### 1. Payoff Matrix Awareness

The AI sees the complete 2x2 payoff matrix:

```
(cooperate, cooperate): player_1: 3, player_2: 3
(cooperate, defect):    player_1: 0, player_2: 5
(defect, cooperate):   player_1: 5, player_2: 0
(defect, defect):      player_1: 1, player_2: 1
```

**Impact on Responses**:
- AI can reference specific payoffs for each player
- AI understands asymmetric outcomes (one player benefits more)
- AI can explain why certain outcomes favor one player over another

### 2. Nash Equilibrium with Two Players

The AI receives computed Nash equilibria:

```
Equilibrium: player_1: defect, player_2: defect
Dominant Strategies: player_1: defect, player_2: defect
```

**Impact on Responses**:
- AI can state: "Both players should defect (Nash equilibrium)"
- AI can explain: "Player_1 has incentive to defect regardless of player_2's choice"
- AI can contrast: "While mutual cooperation is better, both players defect in equilibrium"

### 3. Move History with Two Players

The AI sees recent moves for both players:

```
Round 1: player_1 chose cooperate
Round 1: player_2 chose defect
```

**Impact on Responses**:
- AI can analyze: "Player_1 has been cooperating while player_2 has been defecting"
- AI can predict: "Given player_2's defection pattern, player_1 might want to defect"
- AI can recommend: "Player_1 should match player_2's strategy or switch to defection"

### 4. Comparative Analysis

The AI can compare the two players:

**Example Response**:
"Player_2 (Bob) is currently doing better than player_1 (Alice). In Round 1, player_2 defected while player_1 cooperated, resulting in player_2 receiving 5 points and player_1 receiving 0 points. This asymmetric outcome favors player_2 because they exploited player_1's cooperation."

## Examples: Participant Questions → AI Responses

### Example 1: Participant asks about player_1

**Participant**: "What should player_1 do?"

**AI Sees**:
- Both players in context
- Question mentions "player_1"
- Recent moves: player_1 cooperated, player_2 defected

**AI Response**:
"Player_1 (Alice) should consider defecting in the next round. In Round 1, player_1 cooperated while player_2 (Bob) defected, resulting in player_1 receiving 0 points and player_2 receiving 5 points. This outcome is unfavorable for player_1. 

Given player_2's defection, player_1 has two options:
1. Continue cooperating: If player_2 continues defecting, player_1 gets 0 points again
2. Switch to defecting: If player_2 continues defecting, both get 1 point (better than 0)

The Nash equilibrium suggests both players should defect, and player_2 is already playing this strategy. Player_1 should match this strategy to avoid further exploitation."

**Key**: AI focuses on **player_1** while referencing **player_2's** behavior.

### Example 2: Participant asks about player_2

**Participant**: "What should Bob do?" (Bob is player_2)

**AI Sees**:
- Both players in context
- Question mentions "Bob" (matched to player_2)
- Recent moves: player_1 cooperated, player_2 defected

**AI Response**:
"Player_2 (Bob) is currently playing the dominant strategy by defecting. In Round 1, player_2 defected while player_1 (Alice) cooperated, resulting in player_2 receiving 5 points (the maximum possible payoff).

From player_2's perspective:
- Defecting is the dominant strategy (better regardless of player_1's choice)
- Current strategy is working well (5 points vs player_1's 0 points)
- Continuing to defect maintains this advantage

However, if player_1 switches to defecting, both players will get 1 point each, which is worse than the current 5 points for player_2. Player_2 should continue defecting unless player_1 shows willingness to cooperate."

**Key**: AI focuses on **player_2** while analyzing **player_1's** potential responses.

### Example 3: Participant asks general question

**Participant**: "What's happening in this game?"

**AI Sees**:
- Both players in context
- No specific player mentioned
- Recent moves for both players

**AI Response**:
"This is a Prisoner's Dilemma game with two players:
- **Player_1** (Alice): Human player
- **Player_2** (Bob): Human player

**Current Situation**:
In Round 1, player_1 cooperated while player_2 defected. This resulted in:
- Player_1: 0 points (unfavorable)
- Player_2: 5 points (favorable)

**Strategic Analysis**:
- The Nash equilibrium is (defect, defect) where both players get 1 point
- Player_2 is currently playing the dominant strategy (defect)
- Player_1 is being exploited by cooperating while player_2 defects
- If both players defect, they each get 1 point (better than player_1's current 0)

**Recommendations**:
- Player_1 should consider defecting to avoid further exploitation
- Player_2 should continue defecting (dominant strategy)
- Mutual defection (1,1) is the Nash equilibrium, though mutual cooperation (3,3) would be better but unstable"

**Key**: AI analyzes **both players** and provides comprehensive analysis.

## Potential Enhancements

### Enhancement 1: Explicit Player Targeting

**Add to Frontend**:
- Dropdown to select "Ask as player_1" or "Ask as player_2"
- Pass `player_id` in prompt payload

**Backend Change**:
- Use `player_id` to focus AI response
- Modify prompt to say "You are player_1" or "You are player_2"
- AI acts from that player's perspective

**Benefit**:
- Clear player focus
- Personalized responses
- Better use of PLAYER role

### Enhancement 2: Participant-Player Mapping

**Add to System**:
- Track which participant "owns" which player
- Map `session_id` → `player_id`
- Auto-focus AI on participant's player

**Benefit**:
- "What should I do?" automatically refers to participant's player
- Personalized experience
- Clearer context

### Enhancement 3: Player-Specific AI Roles

**Add Roles**:
- `PLAYER_1`: Act as player_1 specifically
- `PLAYER_2`: Act as player_2 specifically

**Benefit**:
- Explicit player representation
- Clear distinction between players
- Better strategic advice

## Summary

### Current System

1. **Participants** ask questions, **Players** are game entities
2. AI receives **both players** in context
3. AI distinguishes players through:
   - Question text parsing
   - Player name matching
   - Context analysis
4. AI responses reference **both players** or focus on **specific players** based on question
5. **Limitation**: No explicit `player_id` targeting from participants

### How AI Reflects Two-Player Structure

1. **Payoff Awareness**: AI knows exact payoffs for each player in each outcome
2. **Equilibrium Analysis**: AI computes and explains Nash equilibrium for both players
3. **Move History**: AI sees moves from both players and can analyze patterns
4. **Comparative Analysis**: AI can compare player_1 vs player_2 strategies and outcomes
5. **Strategic Recommendations**: AI can recommend actions for specific players

### Key Insight

The AI **always sees both players** but **focuses its response** based on:
- What the participant asks about
- Which player is mentioned in the question
- The context of the game state

This allows participants to ask questions about either player, both players, or the game in general, and receive appropriately focused responses that reflect the two-player structure of the Prisoner's Dilemma.
