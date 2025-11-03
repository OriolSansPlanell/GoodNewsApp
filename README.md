# GoodNews App 📰✨

A positive news aggregator app for web and mobile that scouts the web for uplifting news and presents it with a fresh, dynamic UI.

## 🌟 Features

- **Positive News Only**: AI-powered filtering for uplifting content
- **Topic-Based Navigation**: Browse by Technology, Science, Health, Environment, Community, and more
- **Positivity Ratings**: Each article rated 0-100 on positivity
- **Cross-Platform**: Single codebase for iOS, Android, and Web
- **Fresh Content**: Automatic news updates and refresh mechanisms
- **Dynamic UI**: Modern, card-based design with smooth animations

## 🏗️ Architecture

### Modular Design for Easy Upgrades

The app is built with a **plugin architecture** that makes it easy to upgrade from free to premium services:

```
Frontend (React Native + Expo)
    ↓
Backend API (Node.js + Express)
    ↓
News Adapters (Pluggable) ← Start with free APIs, upgrade to premium
    ↓
Positivity Analyzer (Pluggable) ← Start with OSS, upgrade to AI
    ↓
Database Cache (MongoDB)
```

### Current Stack (Free Tier)

**Frontend:**
- React Native + Expo (Web + iOS + Android)
- TypeScript
- React Navigation
- NativeWind (Tailwind CSS for React Native)

**Backend:**
- Node.js + Express + TypeScript
- MongoDB (free tier MongoDB Atlas)
- News Sources:
  - NewsAPI (free tier: 100 requests/day)
  - The Guardian API (free, unlimited)
  - RSS feeds (fallback)
- Positivity Analysis:
  - `sentiment` library (AFINN-based)
  - `natural` library (NLP)
  - Custom scoring algorithm

### Upgrade Path

**Premium News Sources** (Future):
- NewsAPI Pro ($449+/month)
- Aylien News API
- Webhose.io
- Custom web scraping

**Premium AI Analysis** (Future):
- OpenAI GPT-4 for nuanced positivity analysis
- Anthropic Claude for content understanding
- Custom fine-tuned models

Simply swap the adapter in `/backend/src/adapters/` and update environment variables!

## 📁 Project Structure

```
GoodNewsApp/
├── frontend/          # React Native + Expo app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── screens/      # App screens
│   │   ├── navigation/   # Navigation setup
│   │   ├── services/     # API calls
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── adapters/     # News source adapters (pluggable)
│   │   ├── analyzers/    # Positivity analyzers (pluggable)
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── config/       # Configuration
│   └── package.json
│
└── docs/              # Documentation
    └── UPGRADE_GUIDE.md  # How to upgrade to premium services
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB (local or MongoDB Atlas free tier)
- Expo CLI: `npm install -g expo-cli`

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/OriolSansPlanell/GoodNewsApp.git
cd GoodNewsApp
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys (free tiers)
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm start
```

4. **Access the app**
   - Web: Open http://localhost:8081 in your browser
   - Mobile: Scan QR code with Expo Go app

## 🔑 API Keys (Free Tier)

Get your free API keys:

1. **NewsAPI** (100 requests/day)
   - Sign up: https://newsapi.org/register
   - Add to `.env`: `NEWSAPI_KEY=your_key`

2. **The Guardian** (Unlimited, free)
   - Sign up: https://open-platform.theguardian.com/access/
   - Add to `.env`: `GUARDIAN_API_KEY=your_key`

3. **MongoDB Atlas** (512MB free)
   - Sign up: https://www.mongodb.com/cloud/atlas/register
   - Add to `.env`: `MONGODB_URI=your_connection_string`

## 📊 Positivity Rating System

Articles are scored 0-100 based on:
- Sentiment analysis (40%)
- Positive keyword matching (30%)
- Topic classification (20%)
- Content structure analysis (10%)

**Rating Scale:**
- 80-100: Very Positive 🌟
- 60-79: Positive 😊
- 40-59: Neutral/Mixed 😐
- 0-39: Less Positive (filtered out)

## 🎨 Topics

- 🚀 Technology & Innovation
- 🔬 Science & Discovery
- 🌍 Environment & Sustainability
- ❤️ Health & Wellness
- 🤝 Community & Human Interest
- 🎓 Education
- 🎨 Arts & Culture
- ⚖️ Social Progress

## 🛠️ Development

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests

# Frontend
cd frontend
npm start            # Start Expo dev server
npm run web          # Start web version
npm run android      # Start Android version
npm run ios          # Start iOS version
```

## 📈 Roadmap

- [x] Project setup
- [ ] Backend API with adapter pattern
- [ ] Free tier news aggregation
- [ ] Open-source positivity analysis
- [ ] Frontend app with dynamic UI
- [ ] Topic-based filtering
- [ ] Refresh mechanisms
- [ ] User preferences
- [ ] Push notifications (for very positive news)
- [ ] Share functionality
- [ ] Offline mode
- [ ] Premium tier upgrade options

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

See LICENSE file for details.

## 🌈 Philosophy

In a world filled with negative news, GoodNews aims to highlight the positive stories that inspire, uplift, and remind us of the good happening around the world. Every day, countless acts of kindness, breakthroughs, and achievements deserve our attention too!
