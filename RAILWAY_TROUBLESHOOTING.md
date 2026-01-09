# Railway Troubleshooting - "featureFlags" Error

## Error: "Cannot query field 'featureFlags' on type 'Project'"

This is a **Railway platform issue**, not a problem with your code. It's likely a temporary API/GraphQL error.

## Solutions (Try in Order)

### Solution 1: Retry Railway Deployment

1. **Refresh Railway Dashboard** - Sometimes it's a temporary API glitch
2. **Try Again** - Click "Deploy" again
3. **Wait a few minutes** - Railway might be experiencing issues

### Solution 2: Use Railway CLI Instead

If the web interface is having issues, use the CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize in backend directory
cd backend
railway init

# Link to existing project (or create new)
railway link

# Set environment variables
railway variables set OPENAI_API_KEY=your-key-here

# Deploy
railway up
```

### Solution 3: Use Alternative Backend Hosting

If Railway continues to have issues, use one of these alternatives:

#### Option A: Render (Free Tier Available)

1. Go to https://render.com
2. Sign up/login with GitHub
3. **New** → **Web Service**
4. Connect your `degame` repository
5. Configure:
   - **Name**: `game6multi-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `OPENAI_API_KEY` = your key
7. Click **Create Web Service**
8. Copy the Render URL (e.g., `https://game6multi-backend.onrender.com`)

**Update CORS in `backend/src/main.py`:**
```python
allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "https://*.vercel.app",  # Vercel
    "https://*.onrender.com",  # Add Render
]
```

#### Option B: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# In backend directory
cd backend
fly launch

# Set secrets
fly secrets set OPENAI_API_KEY=your-key-here

# Deploy
fly deploy
```

#### Option C: Heroku (Classic Option)

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create game6multi-backend`
4. Set buildpack: `heroku buildpacks:set heroku/python`
5. Set config: `heroku config:set OPENAI_API_KEY=your-key`
6. Deploy: `git push heroku main`

### Solution 4: Check Railway Status

1. Visit https://status.railway.app
2. Check if there are any ongoing incidents
3. If yes, wait for Railway to resolve

### Solution 5: Create New Railway Project

Sometimes creating a fresh project works:

1. **Delete** the problematic project in Railway
2. **Create New Project** → **Deploy from GitHub**
3. Select `degame` repository
4. **Add Service** → **GitHub Repo**
5. Set Root Directory: `backend`
6. Add environment variables
7. Deploy

## Recommended: Use Render (Easiest Alternative)

Render is often more reliable and has a free tier:

### Quick Render Setup

1. **Go to Render**: https://render.com
2. **Sign up** with GitHub
3. **New** → **Web Service**
4. **Connect** `degame` repository
5. **Settings**:
   - Name: `game6multi-backend`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
6. **Environment**: Add `OPENAI_API_KEY`
7. **Deploy**

Render will give you a URL like: `https://game6multi-backend.onrender.com`

### Update Vercel Environment Variable

After deploying to Render:
1. Go to Vercel dashboard
2. **Settings** → **Environment Variables**
3. Update `VITE_API_BASE` to your Render URL
4. **Redeploy**

## Testing After Deployment

1. Visit your backend URL directly (should see API info)
2. Check Vercel frontend can connect
3. Test creating a game
4. Test multiparticipant features

## Which Service to Use?

| Service | Free Tier | Ease | Reliability |
|---------|-----------|------|-------------|
| **Render** | ✅ Yes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Railway | ❌ No ($5/mo) | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Fly.io | ✅ Yes | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Heroku | ❌ No | ⭐⭐⭐ | ⭐⭐⭐ |

**Recommendation**: Try **Render** if Railway continues to have issues.
