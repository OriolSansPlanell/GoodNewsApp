import { INewsAdapter, IPositivityAnalyzer, Article, NewsQuery, NewsResponse } from '../types';
import { ArticleModel } from '../models/Article';
import { AdapterFactory } from '../adapters/AdapterFactory';
import { AnalyzerFactory } from '../analyzers/AnalyzerFactory';
import { config } from '../config';
import NodeCache from 'node-cache';

/**
 * Main news service that orchestrates fetching, analyzing, and caching news
 */
export class NewsService {
  private newsAdapter: INewsAdapter;
  private positivityAnalyzer: IPositivityAnalyzer;
  private cache: NodeCache;

  constructor() {
    this.newsAdapter = AdapterFactory.createNewsAdapter(config.newsAdapter);
    this.positivityAnalyzer = AnalyzerFactory.createAnalyzer(config.positivityAnalyzer);
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: config.cache.checkPeriod
    });
  }

  /**
   * Get news articles with filtering and caching
   */
  async getNews(query: NewsQuery): Promise<NewsResponse> {
    const cacheKey = this.getCacheKey(query);

    // Check cache first
    const cached = this.cache.get<NewsResponse>(cacheKey);
    if (cached) {
      console.log('Returning cached results');
      return cached;
    }

    // Check database for recent articles (if MongoDB is available)
    let dbArticles: Article[] = [];
    try {
      dbArticles = await this.getFromDatabase(query);

      if (dbArticles.length >= (query.limit || 20)) {
        console.log(`Returning ${dbArticles.length} articles from database`);
        const response = this.buildResponse(dbArticles, query);
        this.cache.set(cacheKey, response);
        return response;
      }
    } catch (error) {
      console.log('Database unavailable, fetching fresh articles...');
    }

    // Fetch fresh articles from news sources
    console.log('Fetching fresh articles from news sources');
    const freshArticles = await this.fetchAndStoreNews(query);

    // Try to get updated results from database, or use fresh articles
    let articles: Article[] = [];
    try {
      articles = await this.getFromDatabase(query);
    } catch (error) {
      console.log('Using fresh articles (database unavailable)');
      articles = freshArticles;
    }

    const response = this.buildResponse(articles, query);
    this.cache.set(cacheKey, response);
    return response;
  }

  /**
   * Fetch fresh news and store in database
   */
  async fetchAndStoreNews(query: NewsQuery): Promise<Article[]> {
    try {
      // Fetch raw articles from news sources
      const rawArticles = await this.newsAdapter.fetchNews(query);
      console.log(`Fetched ${rawArticles.length} articles from ${this.newsAdapter.name}`);

      // Analyze positivity for each article
      const analyzedArticles = await this.analyzeArticles(rawArticles);

      // Filter by minimum positivity score
      const positiveArticles = analyzedArticles.filter(
        article => article.positivityScore >= config.minPositivityScore
      );

      console.log(`${positiveArticles.length} articles passed positivity filter (>=${config.minPositivityScore})`);

      // Store in database if available (upsert to avoid duplicates)
      try {
        await this.storeArticles(positiveArticles);
      } catch (dbError) {
        console.log('Could not store in database (using memory cache only)');
      }

      return positiveArticles;
    } catch (error) {
      console.error('Error fetching and storing news:', error);
      throw error;
    }
  }

  /**
   * Analyze positivity for multiple articles
   */
  private async analyzeArticles(articles: Article[]): Promise<Article[]> {
    const analyzed: Article[] = [];

    for (const article of articles) {
      try {
        const text = `${article.description} ${article.content || ''}`.substring(0, 5000);
        const analysis = await this.positivityAnalyzer.analyze(text, article.title);

        analyzed.push({
          ...article,
          positivityScore: analysis.score,
          keywords: [...article.keywords, ...analysis.positiveKeywords]
        });
      } catch (error) {
        console.error(`Error analyzing article: ${article.title}`, error);
        // Skip articles that fail analysis
      }
    }

    return analyzed;
  }

  /**
   * Store articles in database
   */
  private async storeArticles(articles: Article[]): Promise<void> {
    const operations = articles.map(article => ({
      updateOne: {
        filter: { url: article.url },
        update: { $set: article },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await ArticleModel.bulkWrite(operations);
      console.log(`Stored ${operations.length} articles in database`);
    }
  }

  /**
   * Get articles from database with filtering
   */
  private async getFromDatabase(query: NewsQuery): Promise<Article[]> {
    const filter: any = {
      positivityScore: { $gte: query.minPositivity || config.minPositivityScore }
    };

    if (query.topic && query.topic !== 'all') {
      filter.topic = query.topic;
    }

    if (query.from) {
      filter.publishedAt = { $gte: query.from };
    }

    if (query.to) {
      filter.publishedAt = { ...filter.publishedAt, $lte: query.to };
    }

    const limit = query.limit || 20;
    const skip = ((query.page || 1) - 1) * limit;

    const articles = await ArticleModel
      .find(filter)
      .sort({ publishedAt: -1, positivityScore: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return articles.map(doc => ({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      content: doc.content,
      url: doc.url,
      imageUrl: doc.imageUrl,
      source: doc.source,
      author: doc.author,
      publishedAt: doc.publishedAt,
      topic: doc.topic,
      positivityScore: doc.positivityScore,
      keywords: doc.keywords,
      fetchedAt: doc.fetchedAt
    }));
  }

  /**
   * Get topic statistics
   */
  async getTopicStats(): Promise<Record<string, number>> {
    try {
      const stats = await ArticleModel.aggregate([
        {
          $match: {
            positivityScore: { $gte: config.minPositivityScore }
          }
        },
        {
          $group: {
            _id: '$topic',
            count: { $sum: 1 },
            avgPositivity: { $avg: '$positivityScore' }
          }
        }
      ]);

      const result: Record<string, number> = {};
      stats.forEach(stat => {
        result[stat._id] = stat.count;
      });

      return result;
    } catch (error) {
      console.log('Database unavailable for topic stats');
      return {}; // Return empty stats if database unavailable
    }
  }

  /**
   * Generate cache key from query
   */
  private getCacheKey(query: NewsQuery): string {
    return JSON.stringify({
      topic: query.topic || 'all',
      minPositivity: query.minPositivity || config.minPositivityScore,
      limit: query.limit || 20,
      page: query.page || 1
    });
  }

  /**
   * Build response object
   */
  private buildResponse(articles: Article[], query: NewsQuery): NewsResponse {
    return {
      articles,
      total: articles.length,
      page: query.page || 1,
      pageSize: query.limit || 20
    };
  }
}

export default NewsService;
