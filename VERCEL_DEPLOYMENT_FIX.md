# Vercel Deployment Fix - Step by Step

## ✅ Fixed: Environment Variable Error

The error `Environment Variable "VITE_API_BASE" references Secret "api_base_url", which does not exist` has been fixed by removing the secret reference from `vercel.json`.

## Deployment Steps

### 1. Code is Already Pushed to GitHub ✅
Your code has been pushed to: `github.com:ibeshesumne/degame.git`

### 2. Deploy Backend First (Railway)

1. **Go to Railway**: https://railway.app
2. **Sign up/login** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select repository**: `degame` (or your repo name)
5. **Add Service** → **GitHub Repo**
6. **Configure**:
   - **Root Directory**: `backend`
   - Railway will auto-detect Python and start command
7. **Add Environment Variables**:
   - Go to **Variables** tab
   - Add: `OPENAI_API_KEY` = your OpenAI API key
   - Add: `ANTHROPIC_API_KEY` = your Anthropic key (optional)
8. **Copy the Railway URL** (e.g., `https://your-app.railway.app`)

### 3. Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up/login** with GitHub
3. **Add New Project**
4. **Import** your `degame` repository
5. **Configure**:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
6. **Environment Variables**:
   - Click **"Environment Variables"** section
   - Click **"Add New"**
   - **Key**: `VITE_API_BASE`
   - **Value**: Your Railway backend URL (e.g., `https://your-app.railway.app`)
   - **Environments**: Check all ✅ (Production, Preview, Development)
   - Click **"Save"**
7. **Click "Deploy"**

### 4. After Vercel Deployment

1. **Copy your Vercel URL** (e.g., `https://degame.vercel.app`)
2. **Update backend CORS** (if needed - already includes `*.vercel.app` wildcard)
3. **Test the deployment**:
   - Visit your Vercel URL
   - Open browser console (F12)
   - Try creating a game
   - Try joining with multiple browser tabs

## Quick Fix Summary

### What Was Fixed:
- ✅ Removed `"env": { "VITE_API_BASE": "@api_base_url" }` from `vercel.json`
- ✅ Added multiparticipant UI components
- ✅ Updated CORS to allow Vercel domains (`*.vercel.app`)

### What You Need to Do:
1. ✅ Code is pushed to GitHub
2. ⏳ Deploy backend to Railway
3. ⏳ Deploy frontend to Vercel
4. ⏳ Set `VITE_API_BASE` environment variable in Vercel dashboard
5. ⏳ Test multiparticipant features

## Environment Variables

### Backend (Railway)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-... (optional)
```

### Frontend (Vercel)
```
VITE_API_BASE=https://your-railway-app.railway.app
```

## Testing Multiparticipant Features

1. Open your Vercel URL in **two different browser tabs/windows**
2. In Tab 1: Enter name "Alice" and create a new game
3. Copy the Game ID
4. In Tab 2: Enter name "Bob" and paste the Game ID
5. You should see:
   - **Active Participants** panel showing both Alice and Bob
   - **Event Feed** showing join events
   - Real-time updates when either person makes moves or asks AI questions

## Troubleshooting

### Still Getting Environment Variable Error?
- Make sure you **removed** the `env` section from `vercel.json` ✅ (already done)
- Set `VITE_API_BASE` **manually** in Vercel dashboard (not in vercel.json)

### Frontend Can't Connect to Backend?
- Verify `VITE_API_BASE` is set correctly in Vercel
- Check backend URL is accessible (visit in browser)
- Check browser console for CORS errors
- Verify backend CORS includes `*.vercel.app`

### CORS Errors?
- Backend already includes `*.vercel.app` wildcard
- If specific domain needed, add it to `allow_origins` in `backend/src/main.py`

## Next Steps After Deployment

1. Test multiparticipant features with friends
2. Share Game IDs to test real-time collaboration
3. Monitor Railway logs for backend issues
4. Monitor Vercel logs for frontend issues
