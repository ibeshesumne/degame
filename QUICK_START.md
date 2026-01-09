# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Python 3.8+ installed
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))

## Step 1: Backend Setup (2 minutes)

```bash
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start backend
python -m src
# Or use: ./start.sh
```

Backend will run on `http://localhost:8000`

## Step 2: Frontend Setup (2 minutes)

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## Step 3: Use the App (1 minute)

1. Open browser: `http://localhost:5173`
2. Add 2 players (click "Add Player")
3. Submit moves (Cooperate or Defect)
4. Click "Resolve Round"
5. Try AI Analysis or Nash Equilibria!

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (needs 3.8+)
- Check port 8000 is free: `lsof -i :8000` (macOS/Linux) or `netstat -ano | findstr :8000` (Windows)

### Frontend can't connect
- Make sure backend is running on port 8000
- Check browser console for errors

### AI not working
- Verify `OPENAI_API_KEY` is set in `backend/.env`
- Check API key is valid and has credits

## Next Steps

- Read [README.md](README.md) for full documentation
- Read [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to Vercel
