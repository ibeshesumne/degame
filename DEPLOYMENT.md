# Deployment Guide for Game6Multi

This guide covers deploying the frontend to Vercel and the backend to a hosting service.

## Overview

- **Frontend**: Deploy to Vercel (static React app)
- **Backend**: Deploy separately (Railway, Render, Fly.io, etc.)
- **Environment Variables**: Set securely in each platform

## Step 1: Prepare Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/game6multi.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend

### Option A: Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `game6multi` repository
5. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `python -m src` or `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ANTHROPIC_API_KEY`: (Optional) Your Anthropic API key
7. Railway will provide a URL like: `https://your-app.railway.app`
8. **Important**: Update CORS in `backend/src/main.py` to include your Railway URL

### Option B: Render

1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `game6multi-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
7. Render will provide a URL like: `https://your-app.onrender.com`

### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Create app: `fly launch` (in backend directory)
4. Set secrets:
   ```bash
   fly secrets set OPENAI_API_KEY=your-key-here
   ```
5. Deploy: `fly deploy`

## Step 3: Update Backend CORS

After deploying backend, update `backend/src/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-frontend.vercel.app",  # Add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and redeploy backend.

## Step 4: Deploy Frontend to Vercel

1. **Go to Vercel**: [vercel.com](https://vercel.com)
2. **Sign up/login** with GitHub
3. **Click "New Project"**
4. **Import** your GitHub repository (`game6multi`)
5. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)
6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - **Name**: `VITE_API_BASE`
     - **Value**: Your backend URL (e.g., `https://your-app.railway.app`)
     - **Environment**: Production, Preview, Development (select all)
7. **Click "Deploy"**

## Step 5: Update Frontend Environment Variable

After deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_BASE` with your backend URL
3. Redeploy: Go to Deployments → Click "..." → "Redeploy"

## Step 6: Test Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Check browser console for errors
3. Test creating a game
4. Test AI features (requires API key)

## Environment Variables Summary

### Backend (Railway/Render/Fly.io)

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | No |
| `PORT` | Server port (usually auto-set) | No |

### Frontend (Vercel)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE` | Backend API URL | Yes |

## Security Checklist

- ✅ Never commit `.env` files
- ✅ Never commit API keys
- ✅ Use environment variables in hosting platforms
- ✅ Update CORS to only allow your frontend domain
- ✅ Use HTTPS (automatic with Vercel/Railway/Render)

## Troubleshooting

### Frontend shows "Cannot connect to backend"
- Check `VITE_API_BASE` is set correctly in Vercel
- Verify backend URL is accessible (visit in browser)
- Check backend CORS settings include your Vercel domain

### Backend CORS errors
- Update `allow_origins` in `backend/src/main.py` to include Vercel URL
- Redeploy backend after changes

### AI features not working
- Verify `OPENAI_API_KEY` is set in backend environment variables
- Check backend logs for API errors
- Verify API key has credits/quota

### Build fails on Vercel
- Check `Root Directory` is set to `frontend`
- Verify `package.json` exists in frontend directory
- Check build logs for specific errors

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Backend
- Railway/Render/Fly.io support custom domains
- Configure in respective platform settings

## Monitoring

- **Vercel**: Built-in analytics and logs
- **Railway**: Built-in logs and metrics
- **Render**: Built-in logs
- **Fly.io**: `fly logs` command

## Cost Estimates

- **Vercel**: Free tier (Hobby) sufficient for most use cases
- **Railway**: $5/month minimum (or free trial)
- **Render**: Free tier available (with limitations)
- **Fly.io**: Pay-as-you-go, very affordable

## Next Steps

- Set up monitoring/analytics
- Configure custom domains
- Set up CI/CD for automatic deployments
- Add error tracking (Sentry, etc.)
