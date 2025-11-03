import axios from 'axios';
import { INewsAdapter, Article, NewsQuery, Topic } from '../types';
import { newsApiConfig } from '../config';
import { v4 as uuidv4 } from 'uuid';

/**
 * The Guardian API adapter (Free and unlimited!)
 *
 * Advantages:
 * - Completely free
 * - No rate limits
 * - High-quality journalism
 * - Full article content available
 *
 * Perfect for the free tier!
 */
export class GuardianAdapter implements INewsAdapter {
  name = 'guardian';
  private baseUrl = 'https://content.guardianapis.com';
  private apiKey: string;

  constructor() {
    this.apiKey = newsApiConfig.guardianApiKey || '';
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async fetchNews(query: NewsQuery): Promise<Article[]> {
    if (!await this.isAvailable()) {
      throw new Error('Guardian API key not configured');
    }

    const section = this.topicToSection(query.topic);
    const fromDate = query.from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          'api-key': this.apiKey,
          'section': section !== 'all' ? section : undefined,
          'from-date': fromDate.toISOString().split('T')[0],
          'order-by': 'newest',
          'page-size': query.limit || 20,
          'page': query.page || 1,
          'show-fields': 'headline,trailText,body,thumbnail,byline',
          'show-tags': 'keyword',
          'q': this.buildSearchQuery()
        }
      });

      return response.data.response.results
        .filter((article: any) => article.fields?.headline && article.fields?.trailText)
        .map((article: any) => this.transformArticle(article, query.topic));
    } catch (error: any) {
      console.error('Guardian API error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Build search query with positive keywords
   */
  private buildSearchQuery(): string {
    const positiveTerms = [
      'success', 'breakthrough', 'innovation', 'achievement', 'progress',
      'improvement', 'solution', 'win', 'victory', 'hope'
    ];
    return positiveTerms.join(' OR ');
  }

  /**
   * Map our topics to Guardian sections
   */
  private topicToSection(topic?: Topic): string {
    const mapping: Record<Topic, string> = {
      [Topic.TECHNOLOGY]: 'technology',
      [Topic.SCIENCE]: 'science',
      [Topic.ENVIRONMENT]: 'environment',
      [Topic.HEALTH]: 'society', // Guardian groups health under society
      [Topic.COMMUNITY]: 'society',
      [Topic.EDUCATION]: 'education',
      [Topic.ARTS]: 'culture',
      [Topic.SOCIAL_PROGRESS]: 'society',
      [Topic.ALL]: 'all'
    };

    return topic ? mapping[topic] : 'all';
  }

  /**
   * Transform Guardian article to our Article type
   */
  private transformArticle(article: any, topic?: Topic): Article {
    const fields = article.fields || {};

    return {
      id: uuidv4(),
      title: fields.headline || article.webTitle,
      description: fields.trailText || '',
      content: fields.body,
      url: article.webUrl,
      imageUrl: fields.thumbnail,
      source: 'The Guardian',
      author: fields.byline,
      publishedAt: new Date(article.webPublicationDate),
      topic: topic || this.detectTopic(article.sectionName, fields.headline),
      positivityScore: 0, // Will be calculated by analyzer
      keywords: article.tags?.map((tag: any) => tag.webTitle) || [],
      fetchedAt: new Date()
    };
  }

  /**
   * Detect topic from Guardian section and content
   */
  private detectTopic(section: string, title: string): Topic {
    const lowerSection = section.toLowerCase();
    const lowerTitle = (title || '').toLowerCase();

    if (lowerSection.includes('tech')) return Topic.TECHNOLOGY;
    if (lowerSection.includes('science')) return Topic.SCIENCE;
    if (lowerSection.includes('environment')) return Topic.ENVIRONMENT;
    if (lowerSection.includes('education')) return Topic.EDUCATION;
    if (lowerSection.includes('culture') || lowerSection.includes('art')) return Topic.ARTS;

    // Check title for health-related content
    if (/(health|medical|wellness)/i.test(lowerTitle)) return Topic.HEALTH;
    if (/(community|local|volunteer)/i.test(lowerTitle)) return Topic.COMMUNITY;
    if (/(rights|equality|justice)/i.test(lowerTitle)) return Topic.SOCIAL_PROGRESS;

    return Topic.ALL;
  }
}

export default GuardianAdapter;
