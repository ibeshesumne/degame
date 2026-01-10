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
