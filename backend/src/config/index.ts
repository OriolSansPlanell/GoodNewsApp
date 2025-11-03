import dotenv from 'dotenv';
import { AppConfig } from '../types';

dotenv.config();

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/goodnews',
  newsAdapter: process.env.NEWS_ADAPTER || 'multi',
  positivityAnalyzer: process.env.POSITIVITY_ANALYZER || 'sentiment',
  minPositivityScore: parseInt(process.env.MIN_POSITIVITY_SCORE || '40', 10),
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    checkPeriod: 600 // Check every 10 minutes
  }
};

export const newsApiConfig = {
  newsApiKey: process.env.NEWSAPI_KEY,
  guardianApiKey: process.env.GUARDIAN_API_KEY,
};

export const premiumConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  newsApiPremiumKey: process.env.NEWSAPI_PREMIUM_KEY,
};

export default config;
