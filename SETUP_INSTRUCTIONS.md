# Setup Instructions - GoodNews App

## Current Status

✅ **Backend is working!** (even without MongoDB)
❓ **MongoDB connection needs to be fixed** (optional but recommended)
⏳ **Frontend setup needed**

---

## Quick Start (Backend)

Your backend is NOW running successfully! Even though MongoDB isn't connected, the app will work with memory-only caching.

### Start the Backend

```bash
cd /home/user/GoodNewsApp/backend
npm run dev
```

You should see:
```
⚠ MongoDB connection failed: connect ECONNREFUSED
⚠ Server will start without MongoDB - caching will be memory-only

╔═══════════════════════════════════════════╗
║       GoodNews API Server Started         ║
║  Port: 3000                              ║
╚═══════════════════════════════════════════╝
```

**Test it:**
```bash
curl http://localhost:3000/api/health
```

---

## Fix MongoDB Connection (Recommended)

Your MongoDB password appears incomplete. Here's how to fix it:

### Step 1: Get Your Complete Password

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account
3. Click "Database Access" (left sidebar)
4. Find user: `oriolsansplanell_db_user`
5. Click "**Edit**"
6. Click "**Edit Password**"
7. Either:
   - **View** the current password (if visible)
   - Or **Generate New Password** and copy it
8. **Copy the FULL password** (not just `RPHfkgx2d_`)

### Step 2: Whitelist Your IP

1. In MongoDB Atlas, click "**Network Access**" (left sidebar)
2. Click "+ ADD IP ADDRESS"
3. For testing, click "**ALLOW ACCESS FROM ANYWHERE**" (0.0.0.0/0)
4. Click "**Confirm**"
5. ⏰ **Wait 2-3 minutes** for it to activate

### Step 3: Update Your .env File

Edit: `/home/user/GoodNewsApp/backend/.env`

Replace `YOUR_ACTUAL_PASSWORD` with your real password:

```bash
MONGODB_URI=mongodb+srv://oriolsansplanell_db_user:YOUR_REAL_PASSWORD@goodnews.29kvhhg.mongodb.net/goodnews?retryWrites=true&w=majority
```

### Step 4: Restart Backend

```bash
# Stop the current server (Ctrl+C)
# Then start again:
npm run dev
```

You should see:
```
✓ Connected to MongoDB
```

---

## Start the Frontend

### Step 1: Install Dependencies

```bash
cd /home/user/GoodNewsApp/frontend
npm install
```

### Step 2: Start Expo

```bash
npm start
```

### Step 3: Open the App

**For Web (Easiest):**
- Press `w` in the terminal
- Or open http://localhost:8081 in your browser

**For Mobile:**
1. Install "Expo Go" app on your phone
2. Scan the QR code that appears
3. App will open

---

## Testing the API

### Check Health
```bash
curl http://localhost:3000/api/health
```

### Get News Articles
```bash
curl http://localhost:3000/api/news?topic=technology&limit=5
```

### Get Topics
```bash
curl http://localhost:3000/api/news/topics
```

---

## Common Issues & Solutions

### Issue: "Can't connect to backend" (Frontend)

**For Web:** Should work automatically

**For Mobile Device:**
1. Find your computer's IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Edit `frontend/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = __DEV__
     ? 'http://YOUR_COMPUTER_IP:3000/api'  // e.g., http://192.168.1.100:3000/api
     : 'https://your-production-api.com/api';
   ```

3. Restart frontend: `npm start`

### Issue: "No articles showing"

This is normal on first start! The app needs to:
1. Fetch news from APIs
2. Analyze positivity
3. Filter results

**Solution:**
- Wait 10-20 seconds for first fetch
- Pull down to refresh in the app
- Check backend logs for errors

### Issue: MongoDB "authentication failed"

**Your password is wrong.** Follow "Fix MongoDB Connection" steps above.

### Issue: API keys not working

Double-check your `.env` file:
```bash
cat backend/.env | grep API_KEY
```

Should show:
```
NEWSAPI_KEY=8a7e765098a4470cb2ed5aae12ba4a90
GUARDIAN_API_KEY=f25796ab-be62-4838-ae93-130da7b0ef7a
```

---

## Security Note ⚠️

You shared your API keys publicly in chat. For security:

1. **Regenerate your API keys:**
   - NewsAPI: https://newsapi.org/account
   - Guardian API: https://bonobo.capi.gutools.co.uk/

2. **Update your `.env` file** with new keys

3. **Never commit `.env` to git** (it's already in .gitignore)

---

## What Works Now

✅ Backend API server
✅ News fetching from multiple sources
✅ Positivity analysis
✅ Memory caching
✅ All API endpoints
✅ CORS enabled for frontend

With MongoDB connected, you also get:
- Persistent article storage
- Better caching
- Topic statistics

---

## Next Steps

1. ✅ **Backend is running** - You can use it now!
2. 🔄 **Fix MongoDB** - For better caching (optional)
3. 📱 **Start frontend** - Run `npm start` in frontend folder
4. 🔑 **Regenerate API keys** - For security
5. 🎨 **Customize** - Edit topics, colors, scoring thresholds

---

## Need Help?

- Check the logs in both backend and frontend terminals
- MongoDB issues: Usually password or IP whitelist
- Frontend connection: Usually IP address mismatch
- API errors: Check if keys are valid

**The app is working!** MongoDB is optional for initial testing.
