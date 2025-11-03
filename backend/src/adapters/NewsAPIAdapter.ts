import axios from 'axios';
import { INewsAdapter, Article, NewsQuery, Topic } from '../types';
import { newsApiConfig } from '../config';
import { v4 as uuidv4 } from 'uuid';

/**
 * NewsAPI.org adapter (Free tier: 100 requests/day)
 *
 * Free tier limitations:
 * - 100 requests per day
 * - Only last 30 days of articles
 * - Limited to 100 articles per request
 *
 * Upgrade to premium for:
 * - Unlimited requests
 * - Full archive access
 * - More sources
 */
export class NewsAPIAdapter implements INewsAdapter {
  name = 'newsapi';
  private baseUrl = 'https://newsapi.org/v2';
  private apiKey: string;

  constructor() {
    this.apiKey = newsApiConfig.newsApiKey || '';
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async fetchNews(query: NewsQuery): Promise<Article[]> {
    if (!await this.isAvailable()) {
      throw new Error('NewsAPI key not configured');
    }

    const searchQuery = this.buildSearchQuery(query.topic);
    const fromDate = query.from || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24h

    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          apiKey: this.apiKey,
          q: searchQuery,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: query.limit || 20,
          page: query.page || 1,
          from: fromDate.toISOString()
        }
      });

      return response.data.articles
        .filter((article: any) => article.title && article.description)
        .map((article: any) => this.transformArticle(article, query.topic));
    } catch (error: any) {
      console.error('NewsAPI error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Build search query based on topic with positive keywords
   */
  private buildSearchQuery(topic?: Topic): string {
    const positiveTerms = [
      'success', 'breakthrough', 'innovation', 'achievement', 'progress',
      'cure', 'rescue', 'help', 'improve', 'discover', 'celebrate'
    ];

    const topicKeywords: Record<Topic, string[]> = {
      [Topic.TECHNOLOGY]: ['technology', 'innovation', 'AI', 'startup', 'invention'],
      [Topic.SCIENCE]: ['science', 'research', 'discovery', 'breakthrough', 'study'],
      [Topic.ENVIRONMENT]: ['environment', 'sustainability', 'renewable', 'conservation', 'green'],
      [Topic.HEALTH]: ['health', 'medical', 'cure', 'wellness', 'treatment'],
      [Topic.COMMUNITY]: ['community', 'volunteer', 'charity', 'help', 'support'],
      [Topic.EDUCATION]: ['education', 'learning', 'students', 'school', 'university'],
      [Topic.ARTS]: ['art', 'culture', 'music', 'film', 'creative'],
      [Topic.SOCIAL_PROGRESS]: ['rights', 'equality', 'justice', 'progress', 'reform'],
      [Topic.ALL]: []
    };

    const keywords = topic && topic !== Topic.ALL
      ? topicKeywords[topic]
      : positiveTerms;

    // Combine with positive terms
    const combined = [...keywords, ...positiveTerms.slice(0, 3)];
    return combined.join(' OR ');
  }

  /**
   * Transform NewsAPI article to our Article type
   */
  private transformArticle(article: any, topic?: Topic): Article {
    return {
      id: uuidv4(),
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source?.name || 'Unknown',
      author: article.author,
      publishedAt: new Date(article.publishedAt),
      topic: topic || this.detectTopic(article.title + ' ' + article.description),
      positivityScore: 0, // Will be calculated by analyzer
      keywords: [],
      fetchedAt: new Date()
    };
  }

  /**
   * Detect topic from article content
   */
  private detectTopic(text: string): Topic {
    const lowerText = text.toLowerCase();

    if (/(tech|ai|robot|software|digital|internet|cyber)/i.test(lowerText)) return Topic.TECHNOLOGY;
    if (/(science|research|study|discover|scientist)/i.test(lowerText)) return Topic.SCIENCE;
    if (/(environment|climate|sustain|green|renew|conservation)/i.test(lowerText)) return Topic.ENVIRONMENT;
    if (/(health|medical|hospital|doctor|patient|cure)/i.test(lowerText)) return Topic.HEALTH;
    if (/(community|volunteer|charity|local|neighbor)/i.test(lowerText)) return Topic.COMMUNITY;
    if (/(education|school|student|university|learn)/i.test(lowerText)) return Topic.EDUCATION;
    if (/(art|music|culture|film|creative|artist)/i.test(lowerText)) return Topic.ARTS;
    if (/(rights|equality|justice|progress|social)/i.test(lowerText)) return Topic.SOCIAL_PROGRESS;

    return Topic.ALL;
  }
}

export default NewsAPIAdapter;
