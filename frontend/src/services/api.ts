import axios from 'axios';
import { Article, NewsResponse, Topic } from '../types';

// API configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface FetchNewsParams {
  topic?: Topic;
  minPositivity?: number;
  limit?: number;
  page?: number;
}

/**
 * Fetch news articles
 */
export async function fetchNews(params: FetchNewsParams = {}): Promise<NewsResponse> {
  const response = await api.get<NewsResponse>('/news', { params });
  return response.data;
}

/**
 * Fetch topics with article counts
 */
export async function fetchTopics(): Promise<any> {
  const response = await api.get('/news/topics');
  return response.data;
}

/**
 * Refresh news articles
 */
export async function refreshNews(topic?: Topic): Promise<void> {
  await api.post('/news/refresh', { topic });
}

/**
 * Health check
 */
export async function checkHealth(): Promise<any> {
  const response = await api.get('/health');
  return response.data;
}

export default {
  fetchNews,
  fetchTopics,
  refreshNews,
  checkHealth
};
