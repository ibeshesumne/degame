# Quick Deployment Steps for game6multi

## Step 1: Push to GitHub

```bash
cd /Users/ml/Documents/workingDocs/genwork_mac/game6multi

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - game6multi with multiparticipant features"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/game6multi.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username**

## Step 2: Deploy Backend First (Railway - Recommended)

1. Go to [railway.app](https://railway.app) and sign up/login with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `game6multi` repository
4. Click **"Add Service"** → **"GitHub Repo"** → Select `game6multi`
5. In the service settings:
   - **Root Directory**: Set to `backend`
   - **Start Command**: `python -m src` (or Railway will auto-detect)
6. Go to **Variables** tab and add:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `ANTHROPIC_API_KEY` = your Anthropic API key (optional)
7. Railway will provide a URL like: `https://your-app.railway.app`
8. **Copy this URL** - you'll need it for the frontend

### Update Backend CORS

After Railway deploys, update `backend/src/main.py` to allow your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://your-app.vercel.app",  # Add this after Vercel deployment
        "https://*.vercel.app",  # Or allow all Vercel previews
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then commit and push:
```bash
git add backend/src/main.py
git commit -m "Update CORS for Vercel deployment"
git push
```

Railway will auto-redeploy.

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `game6multi` repository
4. Configure:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `frontend` (IMPORTANT!)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)
5. **Environment Variables**:
   - Click **"Environment Variables"**
   - Add new variable:
     - **Key**: `VITE_API_BASE`
     - **Value**: Your Railway backend URL (e.g., `https://your-app.railway.app`)
     - **Environments**: Check all (Production, Preview, Development)
   - Click **"Save"**
6. Click **"Deploy"**

## Step 4: Update Backend CORS with Vercel URL

After Vercel deploys:

1. Copy your Vercel URL (e.g., `https://game6multi.vercel.app`)
2. Update `backend/src/main.py` CORS to include it
3. Commit and push:
   ```bash
   git add backend/src/main.py
   git commit -m "Add Vercel URL to CORS"
   git push
   ```

## Step 5: Test Deployment

1. Visit your Vercel URL
2. Open browser console (F12) to check for errors
3. Try creating a game
4. Try joining with multiple browser tabs/windows
5. Test AI features

## Troubleshooting

### Vercel Error: "Environment Variable references Secret which does not exist"
✅ **Fixed!** Removed the secret reference from `vercel.json`. Set `VITE_API_BASE` manually in Vercel dashboard.

### Frontend can't connect to backend
- Check `VITE_API_BASE` is set correctly in Vercel
- Verify backend URL is accessible (visit in browser - should see API info)
- Check backend CORS includes your Vercel domain
- Check browser console for CORS errors

### Backend CORS errors
- Update `allow_origins` in `backend/src/main.py`
- Include both `https://your-app.vercel.app` and `https://*.vercel.app` for previews
- Redeploy backend after changes

### Build fails
- Verify Root Directory is `frontend` in Vercel
- Check build logs for specific errors
- Ensure `package.json` exists in frontend directory

## Quick Commands Reference

```bash
# Check git status
git status

# Add all changes
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push

# Check remote
git remote -v
```

## Environment Variables Summary

### Backend (Railway)
- `OPENAI_API_KEY` - Required
- `ANTHROPIC_API_KEY` - Optional

### Frontend (Vercel)
- `VITE_API_BASE` - Your Railway backend URL (e.g., `https://your-app.railway.app`)

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy backend to Railway
3. ✅ Deploy frontend to Vercel
4. ✅ Update CORS
5. ✅ Test multiparticipant features
6. 🎉 Share Game IDs with friends to test!
