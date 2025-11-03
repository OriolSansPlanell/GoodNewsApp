import { INewsAdapter, Article, NewsQuery } from '../types';
import { NewsAPIAdapter } from './NewsAPIAdapter';
import { GuardianAdapter } from './GuardianAdapter';
import { RSSAdapter } from './RSSAdapter';

/**
 * Multi-source adapter that combines multiple news sources
 *
 * This adapter fetches from all available sources and combines results,
 * providing the best coverage with free tier APIs
 *
 * Priority order:
 * 1. The Guardian (free, unlimited, high quality)
 * 2. RSS feeds (free, always available)
 * 3. NewsAPI (free tier, 100 requests/day limit)
 */
export class MultiAdapter implements INewsAdapter {
  name = 'multi';

  private adapters: INewsAdapter[];
  private guardianAdapter: GuardianAdapter;
  private rssAdapter: RSSAdapter;
  private newsApiAdapter: NewsAPIAdapter;

  constructor() {
    this.guardianAdapter = new GuardianAdapter();
    this.rssAdapter = new RSSAdapter();
    this.newsApiAdapter = new NewsAPIAdapter();

    this.adapters = [
      this.guardianAdapter,
      this.rssAdapter,
      this.newsApiAdapter
    ];
  }

  async isAvailable(): Promise<boolean> {
    // Multi adapter is available if at least one source is available
    const availabilities = await Promise.all(
      this.adapters.map(adapter => adapter.isAvailable())
    );
    return availabilities.some(available => available);
  }

  async fetchNews(query: NewsQuery): Promise<Article[]> {
    const limit = query.limit || 20;
    const perSourceLimit = Math.ceil(limit / 3); // Distribute across sources

    // Fetch from all available sources in parallel
    const sourceQuery = { ...query, limit: perSourceLimit };

    const results = await Promise.allSettled([
      this.fetchFromGuardian(sourceQuery),
      this.fetchFromRSS(sourceQuery),
      this.fetchFromNewsAPI(sourceQuery)
    ]);

    const articles: Article[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
        console.log(`${this.adapters[index].name}: ${result.value.length} articles`);
      } else {
        console.error(`${this.adapters[index].name} failed:`, result.reason);
      }
    });

    // Remove duplicates based on title similarity
    const uniqueArticles = this.deduplicateArticles(articles);

    // Sort by publication date (newest first)
    uniqueArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Return up to the requested limit
    return uniqueArticles.slice(0, limit);
  }

  /**
   * Fetch from Guardian API
   */
  private async fetchFromGuardian(query: NewsQuery): Promise<Article[]> {
    if (!await this.guardianAdapter.isAvailable()) {
      console.log('Guardian API not available');
      return [];
    }

    try {
      return await this.guardianAdapter.fetchNews(query);
    } catch (error: any) {
      console.error('Guardian fetch error:', error.message);
      return [];
    }
  }

  /**
   * Fetch from RSS feeds
   */
  private async fetchFromRSS(query: NewsQuery): Promise<Article[]> {
    try {
      return await this.rssAdapter.fetchNews(query);
    } catch (error: any) {
      console.error('RSS fetch error:', error.message);
      return [];
    }
  }

  /**
   * Fetch from NewsAPI (use sparingly due to rate limits)
   */
  private async fetchFromNewsAPI(query: NewsQuery): Promise<Article[]> {
    if (!await this.newsApiAdapter.isAvailable()) {
      console.log('NewsAPI not available');
      return [];
    }

    try {
      return await this.newsApiAdapter.fetchNews(query);
    } catch (error: any) {
      console.error('NewsAPI fetch error:', error.message);
      return [];
    }
  }

  /**
   * Remove duplicate articles based on title similarity
   */
  private deduplicateArticles(articles: Article[]): Article[] {
    const seen = new Map<string, Article>();

    for (const article of articles) {
      const normalizedTitle = this.normalizeTitle(article.title);

      if (!seen.has(normalizedTitle)) {
        seen.set(normalizedTitle, article);
      } else {
        // Keep the one with more content
        const existing = seen.get(normalizedTitle)!;
        if ((article.content?.length || 0) > (existing.content?.length || 0)) {
          seen.set(normalizedTitle, article);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Normalize title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50); // Compare first 50 chars
  }
}

export default MultiAdapter;
