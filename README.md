# Game6Multi - Game-Theoretic Platform

A React + Python FastAPI application for game theory analysis with Nash equilibrium computation and AI integration.

## Features

- **Prisoner's Dilemma Game**: Interactive game-theoretic platform
- **Nash Equilibrium Analysis**: Computes Nash equilibria, dominant strategies, and Pareto-efficient outcomes
- **AI Integration**: OpenAI GPT-4/3.5 and Anthropic Claude support for strategic analysis
- **Multi-player Support**: Add players, submit moves, and resolve rounds
- **Real-time Game State**: Track game progress and history
- **Multi-Participant Support**: Multiple users can join games and interact
- **Session Management**: Track user sessions and activity
- **Event Tracking**: All game actions tracked as events
- **Thread-based AI Conversations**: Conversation threading for AI prompts
- **Game Persistence**: Games saved to JSON files automatically

## Project Structure

```
game6multi/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/           # Python FastAPI backend
│   ├── src/
│   │   ├── main.py
│   │   ├── game_engine.py
│   │   ├── ai_orchestrator.py
│   │   └── analytics_engine.py
│   └── requirements.txt
└── README.md
```

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- OpenAI API key (for AI features)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp ../.env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

5. Start the backend server:
   ```bash
   python -m src
   ```
   
   The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local if your backend runs on a different port
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173`

## Deployment

### Deploy Frontend to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/game6multi.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Click "Deploy"

3. **Set Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add `VITE_API_BASE` with your backend URL
     - For local testing: `http://localhost:8000`
     - For production: Your deployed backend URL

### Backend Deployment Options

#### Option 1: Deploy Backend Separately (Recommended)

You can deploy the backend to:
- **Railway**: [railway.app](https://railway.app) - Easy Python deployment
- **Render**: [render.com](https://render.com) - Free tier available
- **Fly.io**: [fly.io](https://fly.io) - Good for Python apps
- **Heroku**: [heroku.com](https://heroku.com) - Classic option

**For Railway/Render/Fly.io:**
1. Create a new project
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Set start command: `python -m src` or `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `OPENAI_API_KEY`

#### Option 2: Use Vercel Serverless Functions (Advanced)

You can convert the backend to Vercel serverless functions, but this requires restructuring the code.

### Environment Variables Setup

#### For Local Development

**Backend** (`backend/.env`):
```env
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here  # Optional
PORT=8000
```

**Frontend** (`frontend/.env.local`):
```env
VITE_API_BASE=http://localhost:8000
```

#### For Production (Vercel)

In Vercel Dashboard → Project Settings → Environment Variables:

- `VITE_API_BASE`: Your deployed backend URL (e.g., `https://your-backend.railway.app`)
- `OPENAI_API_KEY`: Your OpenAI API key (if using serverless functions)

**Important**: Never commit `.env` files or API keys to Git!

## Usage

1. **Start Backend**: `cd backend && python -m src`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Create Game**: A new game is automatically created
5. **Add Players**: Click "Add Player" and fill in details
6. **Submit Moves**: Select Cooperate or Defect for each player
7. **Resolve Round**: Click "Resolve Round" when all players have moved
8. **AI Analysis**: Use the AI Panel to ask questions about game theory
9. **Nash Equilibria**: Click "Compute" to analyze Nash equilibria

## API Endpoints

### Game Management
- `GET /` - API information
- `POST /game/create` - Create a new game
- `GET /games` - List all games
- `POST /game/{game_id}/join` - Join a game (multi-participant)
- `GET /game/{game_id}/state` - Get game state

### Players & Moves
- `POST /game/{game_id}/add-player` - Add a player
- `POST /game/{game_id}/submit-move` - Submit a move
- `POST /game/{game_id}/resolve-round` - Resolve current round

### AI & Analysis
- `POST /game/ask-ai` - Ask AI for analysis (supports threading)
- `GET /game/{game_id}/equilibria` - Compute Nash equilibria

### Multi-Participant
- `GET /game/{game_id}/sessions` - Get all active sessions
- `GET /game/{game_id}/updates` - Get game events/updates (real-time polling)

See [MULTI_PARTICIPANT_GUIDE.md](MULTI_PARTICIPANT_GUIDE.md) for details on multi-participant features.

## Security Notes

- **API Keys**: Never commit API keys to Git
- **CORS**: Backend allows requests from `localhost:5173` and `localhost:3000` by default
- **Authentication**: Currently uses simple Bearer token ("anonymous") - implement proper auth for production

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (needs 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is available: `lsof -i :8000`

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check `VITE_API_BASE` in `.env.local`
- Check browser console for CORS errors

### AI features not working
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Review backend logs for API errors

## Documentation

- `QUICK_START.md` - 5-minute quick start guide
- `DEPLOYMENT.md` - Detailed deployment instructions
- `SETUP_COMPLETE.md` - Summary of what was created
- `MULTI_PARTICIPANT_GUIDE.md` - Multi-participant features guide
- `FEATURES_COMPARISON.md` - Comparison with game5multi

## License

MIT
