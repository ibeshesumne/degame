# Vercel Setup Instructions

## ⚠️ Important: Root Directory Configuration

When deploying to Vercel, you **MUST** set the **Root Directory** to `frontend` in the Vercel dashboard.

## Step-by-Step Vercel Configuration

### 1. Go to Vercel Dashboard
- Visit https://vercel.com
- Sign in with GitHub
- Click **"Add New Project"**

### 2. Import Repository
- Select your `degame` repository
- Click **"Import"**

### 3. Configure Project Settings

**⚠️ CRITICAL: Set Root Directory**

1. Click **"Configure Project"** (or "Settings" after import)
2. Scroll to **"Root Directory"**
3. Click **"Edit"**
4. Set to: `frontend`
5. Click **"Save"**

### 4. Build Settings (Should Auto-Detect)

After setting Root Directory to `frontend`, Vercel should auto-detect:
- **Framework Preset**: Vite
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

### 5. Environment Variables

1. Go to **"Environment Variables"** section
2. Click **"Add New"**
3. Add:
   - **Key**: `VITE_API_BASE`
   - **Value**: Your Railway backend URL (e.g., `https://your-app.railway.app`)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
4. Click **"Save"**

### 6. Deploy

Click **"Deploy"** button

## Why Root Directory Must Be `frontend`

The `vercel.json` file is now simplified because:
- When Root Directory = `frontend`, Vercel runs all commands FROM the frontend directory
- No need for `cd frontend` commands
- Commands run directly: `npm install`, `npm run build`

## Troubleshooting

### Error: "cd frontend: No such file or directory"
**Solution**: Set Root Directory to `frontend` in Vercel dashboard

### Build fails after setting Root Directory
1. Check Root Directory is exactly `frontend` (not `./frontend` or `/frontend`)
2. Verify `package.json` exists in frontend directory
3. Check build logs for specific errors

### Environment Variable not working
1. Verify `VITE_API_BASE` is set in Vercel dashboard
2. Check all environments are selected (Production, Preview, Development)
3. Redeploy after adding environment variable

## Do You Need Railway?

**Yes!** You need Railway (or another backend hosting service) because:

1. **Backend is Python FastAPI** - needs a server to run
2. **Vercel only hosts frontend** - static React/Vite app
3. **Backend provides API** - game logic, AI features, database

### Railway Setup (Quick)

1. Go to https://railway.app
2. Sign in with GitHub
3. **New Project** → **Deploy from GitHub**
4. Select `degame` repository
5. **Add Service** → **GitHub Repo**
6. Set **Root Directory**: `backend`
7. Add environment variable: `OPENAI_API_KEY`
8. Copy Railway URL → Use as `VITE_API_BASE` in Vercel

## Complete Setup Flow

```
GitHub Repo (degame)
    │
    ├─── Railway (Backend)
    │    └── Root Directory: backend
    │    └── URL: https://xxx.railway.app
    │
    └─── Vercel (Frontend)
         └── Root Directory: frontend ⚠️
         └── VITE_API_BASE: https://xxx.railway.app
```

## Quick Checklist

- [ ] Railway: Backend deployed, Root Directory = `backend`
- [ ] Railway: Environment variables set (`OPENAI_API_KEY`)
- [ ] Railway: URL copied
- [ ] Vercel: Root Directory = `frontend` ⚠️ **CRITICAL**
- [ ] Vercel: Environment variable `VITE_API_BASE` = Railway URL
- [ ] Vercel: Deploy successful
- [ ] Test: Visit Vercel URL, check browser console
