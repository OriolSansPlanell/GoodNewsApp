// Core types for the GoodNews app

export enum Topic {
  TECHNOLOGY = 'technology',
  SCIENCE = 'science',
  ENVIRONMENT = 'environment',
  HEALTH = 'health',
  COMMUNITY = 'community',
  EDUCATION = 'education',
  ARTS = 'arts',
  SOCIAL_PROGRESS = 'social_progress',
  ALL = 'all'
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  imageUrl?: string;
  source: string;
  author?: string;
  publishedAt: Date;
  topic: Topic;
  positivityScore: number;
  keywords: string[];
  fetchedAt: Date;
}

export interface PositivityAnalysis {
  score: number; // 0-100
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number; // 0-1
  positiveKeywords: string[];
  reasoning?: string; // Available in premium analyzers
}

export interface NewsQuery {
  topic?: Topic;
  minPositivity?: number;
  limit?: number;
  page?: number;
  from?: Date;
  to?: Date;
}

export interface NewsResponse {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
}

// Adapter Interfaces for pluggable architecture

export interface INewsAdapter {
  name: string;
  fetchNews(query: NewsQuery): Promise<Article[]>;
  isAvailable(): Promise<boolean>;
}

export interface IPositivityAnalyzer {
  name: string;
  analyze(text: string, title: string): Promise<PositivityAnalysis>;
  isPremium: boolean;
}

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  checkPeriod: number;
}

export interface AppConfig {
  port: number;
  mongoUri: string;
  newsAdapter: string;
  positivityAnalyzer: string;
  minPositivityScore: number;
  cache: CacheConfig;
}
