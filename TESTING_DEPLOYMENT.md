# Testing Your Deployment

## ✅ Backend is Working!

You're seeing the API response from Render, which means:
- ✅ Backend is deployed correctly
- ✅ Backend is running and responding
- ✅ API endpoints are accessible

## Next Steps: Test Frontend Connection

### 1. Verify Vercel Environment Variable

In Vercel Dashboard:
1. Go to your project
2. **Settings** → **Environment Variables**
3. Verify `VITE_API_BASE` is set to: `https://game6multi-backend.onrender.com`
4. **Important**: No trailing slash!
5. Make sure all environments are checked (Production, Preview, Development)

### 2. Redeploy Vercel (If Needed)

If you just updated the environment variable:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

Or push a new commit to trigger auto-deploy.

### 3. Test Your Vercel App

1. **Open your Vercel URL** (e.g., `https://your-app.vercel.app`)
2. **Open Browser Console** (F12 → Console tab)
3. **Check for errors**:
   - ✅ Should see: "✓ Backend connected"
   - ❌ If you see CORS errors, backend needs redeploy
   - ❌ If you see "Network Error", check environment variable

### 4. Test Creating a Game

1. Enter your name (e.g., "Alice")
2. Leave Game ID empty (creates new game)
3. Click "Join Game"
4. Should see game board and UI

### 5. Test Multiparticipant Features

1. **Open two browser tabs** with your Vercel URL
2. **Tab 1**: Create game as "Alice"
3. **Copy the Game ID** from Tab 1
4. **Tab 2**: Enter name "Bob" and paste Game ID
5. **Should see**:
   - Active Participants panel showing both users
   - Event Feed showing join events
   - Real-time updates when either person makes moves

## Troubleshooting

### Still Getting "Network Error"?

**Check 1: Environment Variable**
```bash
# In browser console on Vercel app:
console.log('API_BASE:', import.meta.env.VITE_API_BASE)
# Should show: https://game6multi-backend.onrender.com
```

**Check 2: Backend CORS**
- Backend code allows all origins now
- If still having issues, redeploy backend on Render

**Check 3: Render Service Status**
- Go to Render Dashboard
- Check service is **Live** (not Sleeping)
- If Sleeping, visit backend URL to wake it up

### CORS Errors in Browser Console?

1. **Redeploy Backend** on Render (to get latest CORS fix)
2. **Wait for deployment** to complete
3. **Refresh Vercel app**

### Backend Takes 30+ Seconds to Respond?

This is normal for Render free tier:
- First request after sleep = cold start (30-60 seconds)
- Subsequent requests = fast (< 1 second)
- Consider upgrading to paid tier for faster response

## Quick Test Commands

### Test Backend Directly
```bash
# Test root endpoint
curl https://game6multi-backend.onrender.com/

# Test game creation (should work)
curl -X POST https://game6multi-backend.onrender.com/game/create?game_type=prisoner_dilemma \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json"
```

### Test from Browser Console
Open your Vercel app, press F12, and run:
```javascript
// Check environment variable
console.log('API:', import.meta.env.VITE_API_BASE)

// Test backend connection
fetch('https://game6multi-backend.onrender.com/')
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.error('❌ Error:', err))
```

## Success Checklist

- [ ] Backend responds at Render URL ✅ (You have this!)
- [ ] Vercel environment variable set correctly
- [ ] Vercel app loads without errors
- [ ] Can create a game
- [ ] Can join game with Game ID
- [ ] Multiparticipant features work (two tabs)
- [ ] Event Feed shows updates
- [ ] Active Participants panel shows users

## If Everything Works

🎉 **Congratulations!** Your multiparticipant game platform is deployed!

**Share with friends:**
1. Share your Vercel URL
2. They can join your games using Game IDs
3. Test real-time collaboration!

## Performance Notes

**Render Free Tier:**
- Services sleep after 15 min inactivity
- Cold start: 30-60 seconds
- Subsequent requests: Fast

**To avoid sleeping:**
- Upgrade Render to paid tier ($7/month)
- Or use a service like Railway ($5/month)
- Or set up a cron job to ping backend every 10 minutes
