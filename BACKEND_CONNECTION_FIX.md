# Backend Connection Fix - Render + Vercel

## Issue: "Network Error" connecting to Render backend

### Common Causes:

1. **Render Free Tier Sleeping** - Services sleep after 15 minutes of inactivity
2. **CORS Configuration** - Backend not allowing Vercel domain
3. **Backend Not Deployed** - Service not running on Render

## Quick Fixes

### Fix 1: Wake Up Render Service

Render free tier services sleep after inactivity. To wake it up:

1. **Visit the backend URL directly**: https://game6multi-backend.onrender.com/
2. **Wait 30-60 seconds** for Render to spin up the service
3. **Refresh your Vercel frontend** - it should connect now

**Note**: First request after sleep takes longer (cold start).

### Fix 2: Verify Backend is Running

Test the backend directly:

```bash
# Test root endpoint
curl https://game6multi-backend.onrender.com/

# Should return JSON with API info
```

If you get a timeout or error, the backend isn't deployed correctly.

### Fix 3: Check Render Deployment

1. Go to Render Dashboard: https://dashboard.render.com
2. Click on your `game6multi-backend` service
3. Check **Logs** tab for errors
4. Verify service status is **Live** (not Sleeping or Error)

### Fix 4: Update CORS (Already Fixed)

The backend code has been updated to allow all origins by default. This makes deployment easier.

**To restrict CORS in production**, set environment variable in Render:
- `ALLOWED_ORIGINS` = `https://your-app.vercel.app,https://your-preview.vercel.app`

## Step-by-Step Verification

### 1. Check Backend Status

```bash
# Test backend
curl https://game6multi-backend.onrender.com/

# Expected response:
# {"message":"Game-Theoretic Platform API","version":"1.0.0",...}
```

### 2. Check Render Logs

1. Go to Render Dashboard
2. Select your service
3. Click **Logs** tab
4. Look for:
   - ✅ "Application startup complete"
   - ✅ "Uvicorn running on..."
   - ❌ Any error messages

### 3. Verify Environment Variables

In Render Dashboard → Your Service → Environment:
- ✅ `OPENAI_API_KEY` is set
- ✅ No typos in variable names

### 4. Check Vercel Environment Variable

In Vercel Dashboard → Your Project → Settings → Environment Variables:
- ✅ `VITE_API_BASE` = `https://game6multi-backend.onrender.com`
- ✅ No trailing slash
- ✅ All environments checked (Production, Preview, Development)

### 5. Test from Browser Console

Open your Vercel app, open browser console (F12), and run:

```javascript
// Check if environment variable is loaded
console.log('API_BASE:', import.meta.env.VITE_API_BASE)

// Test connection
fetch('https://game6multi-backend.onrender.com/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Common Issues & Solutions

### Issue: "Network Error" or "Failed to fetch"

**Causes:**
- Render service is sleeping (free tier)
- CORS blocking request
- Backend not deployed

**Solutions:**
1. Wake up Render by visiting backend URL
2. Check CORS configuration (already fixed to allow all)
3. Verify backend is deployed and running

### Issue: Backend returns 404

**Cause:** Backend not deployed or wrong URL

**Solution:**
1. Check Render dashboard - is service Live?
2. Verify URL is correct (no typos)
3. Check Render logs for deployment errors

### Issue: CORS Error in Browser Console

**Cause:** Backend CORS not allowing Vercel domain

**Solution:**
- Code already updated to allow all origins
- Redeploy backend after code update
- Or set `ALLOWED_ORIGINS` in Render environment variables

### Issue: Backend takes 30+ seconds to respond

**Cause:** Render free tier cold start

**Solution:**
- This is normal for free tier
- First request after sleep is slow
- Consider upgrading to paid tier for faster response

## Render Deployment Checklist

- [ ] Service is **Live** (not Sleeping/Error)
- [ ] Root Directory set to `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- [ ] Environment Variables set (`OPENAI_API_KEY`)
- [ ] Service URL copied correctly
- [ ] Tested backend URL directly (works)

## Vercel Configuration Checklist

- [ ] Root Directory set to `frontend`
- [ ] `VITE_API_BASE` environment variable set
- [ ] Value = Render backend URL (no trailing slash)
- [ ] All environments checked
- [ ] Redeployed after setting environment variable

## Testing After Fix

1. **Wake up Render**: Visit https://game6multi-backend.onrender.com/
2. **Wait 30 seconds** for cold start
3. **Open Vercel app** in browser
4. **Check browser console** (F12) for errors
5. **Try creating a game** - should work now!

## If Still Not Working

1. **Check Render Logs** for backend errors
2. **Check Vercel Logs** for frontend build/runtime errors
3. **Test backend directly** with curl or Postman
4. **Verify environment variables** are set correctly
5. **Try redeploying** both services

## Upgrade Options

If Render free tier is too slow:

1. **Render Paid Tier** - $7/month, no sleeping
2. **Railway** - $5/month, faster
3. **Fly.io** - Pay-as-you-go, very fast
4. **Heroku** - Classic option, reliable
