# Quick Start Guide

Get your GoodNews app up and running in 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas account)
- Expo CLI: `npm install -g expo-cli`

## Step 1: Clone and Setup

```bash
git clone https://github.com/OriolSansPlanell/GoodNewsApp.git
cd GoodNewsApp
```

## Step 2: Get Free API Keys

### 2.1 NewsAPI (Optional but recommended)
1. Go to https://newsapi.org/register
2. Sign up for a free account
3. Copy your API key

### 2.2 The Guardian API (Recommended)
1. Go to https://open-platform.theguardian.com/access/
2. Register for free
3. Copy your API key

### 2.3 MongoDB Atlas (Recommended for easy setup)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster (512MB)
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for testing)
5. Get your connection string

## Step 3: Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your keys:
```bash
PORT=3000
MONGODB_URI=your_mongodb_connection_string
NEWSAPI_KEY=your_newsapi_key
GUARDIAN_API_KEY=your_guardian_key
NEWS_ADAPTER=multi
POSITIVITY_ANALYZER=sentiment
MIN_POSITIVITY_SCORE=40
```

**Local MongoDB Option:**
If you prefer local MongoDB:
```bash
# Install MongoDB locally first, then use:
MONGODB_URI=mongodb://localhost:27017/goodnews
```

Start the backend:
```bash
npm run dev
```

You should see:
```
✓ Connected to MongoDB
╔═══════════════════════════════════════════╗
║       GoodNews API Server Started         ║
║  Port: 3000                              ║
╚═══════════════════════════════════════════╝
```

## Step 4: Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Start the app:
```bash
npm start
```

## Step 5: Run the App

You'll see a QR code in the terminal. Choose your platform:

### For Web (Fastest)
Press `w` in the terminal, or open http://localhost:8081 in your browser

### For iOS
1. Install "Expo Go" app from the App Store
2. Scan the QR code with your iPhone camera
3. App will open in Expo Go

### For Android
1. Install "Expo Go" app from Google Play Store
2. Scan the QR code with the Expo Go app
3. App will open automatically

## Step 6: Test It Out!

The app should now:
1. Show a beautiful header with "GoodNews"
2. Display topic chips (Technology, Science, etc.)
3. Load positive news articles with positivity ratings
4. Allow you to pull down to refresh

## Troubleshooting

### Backend won't start

**MongoDB connection failed:**
```bash
# Check if MongoDB is running (local)
mongod --version

# Or verify your Atlas connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/goodnews
```

**API keys not working:**
- Make sure there are no quotes around values in .env
- Verify keys are correct (test on the provider's website)
- NewsAPI free tier works but has limits

### Frontend won't connect to backend

**For web:** The API is configured for `localhost:3000` by default, should work out of the box

**For mobile device:**
1. Find your computer's local IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

2. Update `frontend/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = __DEV__
     ? 'http://YOUR_LOCAL_IP:3000/api'  // e.g., http://192.168.1.5:3000/api
     : 'https://your-production-api.com/api';
   ```

3. Restart the frontend: `npm start`

### No articles showing up

1. Check backend logs for errors
2. Verify API keys in `.env`
3. Try refreshing (pull down on the app)
4. Check if backend is fetching news:
   ```bash
   # Test the API directly
   curl http://localhost:3000/api/news
   ```

### "Cannot find module 'uuid'" error
```bash
cd backend
npm install uuid
```

## What's Next?

### Customize Topics
Edit `frontend/src/constants/topics.ts` to add or modify topics

### Adjust Positivity Threshold
In `backend/.env`, change:
```bash
MIN_POSITIVITY_SCORE=60  # Only show very positive news (60+)
```

### Add More News Sources
Edit `backend/src/adapters/RSSAdapter.ts` to add RSS feeds

### Upgrade to Premium
See `docs/UPGRADE_GUIDE.md` for premium features

## Need Help?

- Check the main README.md for detailed documentation
- Review the UPGRADE_GUIDE.md for premium features
- Open an issue on GitHub

## Success!

You now have a working positive news app! 🎉

The app will:
- Fetch news from multiple free sources
- Analyze positivity automatically
- Filter out negative content
- Display beautiful, uplifting news
- Work on web, iOS, and Android

Enjoy spreading positivity! 🌟
