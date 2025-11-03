import Parser from 'rss-parser';
import { INewsAdapter, Article, NewsQuery, Topic } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * RSS Feed adapter - Always free!
 *
 * Fetches from curated RSS feeds of positive news sources
 * No API keys needed, completely free
 *
 * Great sources for positive news:
 * - Positive News (positivenews.org.uk)
 * - Good News Network
 * - Happy News
 */
export class RSSAdapter implements INewsAdapter {
  name = 'rss';
  private parser: Parser;

  // Curated list of positive news RSS feeds
  private feeds: Record<Topic, string[]> = {
    [Topic.ALL]: [
      'https://www.goodnewsnetwork.org/feed/',
      'https://www.positive.news/feed/',
      'https://www.happynews.com/rss/headlines.htm'
    ],
    [Topic.TECHNOLOGY]: [
      'https://www.technologyreview.com/feed/',
      'https://techcrunch.com/feed/'
    ],
    [Topic.SCIENCE]: [
      'https://www.sciencedaily.com/rss/top/science.xml',
      'https://www.scientificamerican.com/feed/'
    ],
    [Topic.ENVIRONMENT]: [
      'https://www.treehugger.com/feeds/latest',
      'https://www.positive.news/environment/feed/'
    ],
    [Topic.HEALTH]: [
      'https://www.medicalnewstoday.com/rss/news.xml',
      'https://www.positive.news/health/feed/'
    ],
    [Topic.COMMUNITY]: [
      'https://www.goodnewsnetwork.org/category/news/inspiring/feed/'
    ],
    [Topic.EDUCATION]: [
      'https://www.positive.news/education/feed/'
    ],
    [Topic.ARTS]: [
      'https://www.positive.news/arts/feed/'
    ],
    [Topic.SOCIAL_PROGRESS]: [
      'https://www.positive.news/society/feed/'
    ]
  };

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'GoodNewsApp/1.0'
      }
    });
  }

  async isAvailable(): Promise<boolean> {
    return true; // RSS is always available
  }

  async fetchNews(query: NewsQuery): Promise<Article[]> {
    const topic = query.topic || Topic.ALL;
    const feedUrls = this.feeds[topic] || this.feeds[Topic.ALL];
    const limit = query.limit || 20;

    const articles: Article[] = [];

    // Fetch from multiple feeds in parallel
    const feedPromises = feedUrls.map(url => this.fetchFeed(url, topic));
    const results = await Promise.allSettled(feedPromises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
      }
    });

    // Sort by date and limit
    return articles
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Fetch a single RSS feed
   */
  private async fetchFeed(url: string, topic: Topic): Promise<Article[]> {
    try {
      const feed = await this.parser.parseURL(url);

      return feed.items
        .filter(item => item.title && item.contentSnippet)
        .map(item => this.transformArticle(item, feed.title || 'RSS Feed', topic));
    } catch (error: any) {
      console.error(`RSS feed error for ${url}:`, error.message);
      return [];
    }
  }

  /**
   * Transform RSS item to our Article type
   */
  private transformArticle(item: any, feedTitle: string, topic: Topic): Article {
    // Extract image from content or enclosure
    let imageUrl: string | undefined;
    if (item.enclosure?.url) {
      imageUrl = item.enclosure.url;
    } else if (item.content) {
      const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) imageUrl = imgMatch[1];
    }

    // Clean HTML from description
    const description = this.stripHtml(item.contentSnippet || item.description || '');

    return {
      id: uuidv4(),
      title: item.title || '',
      description,
      content: item.content ? this.stripHtml(item.content) : undefined,
      url: item.link || '',
      imageUrl,
      source: feedTitle,
      author: item.creator || item.author,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      topic,
      positivityScore: 0, // Will be calculated by analyzer
      keywords: item.categories || [],
      fetchedAt: new Date()
    };
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}

export default RSSAdapter;
