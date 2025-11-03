import { Router, Request, Response } from 'express';
import { NewsService } from '../services/NewsService';
import { Topic } from '../types';

const router = Router();
const newsService = new NewsService();

/**
 * GET /api/news
 * Get news articles with optional filtering
 *
 * Query parameters:
 * - topic: Topic enum value (optional)
 * - minPositivity: Minimum positivity score 0-100 (optional)
 * - limit: Number of articles to return (default: 20)
 * - page: Page number (default: 1)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      minPositivity,
      limit = '20',
      page = '1'
    } = req.query;

    const query = {
      topic: topic as Topic || Topic.ALL,
      minPositivity: minPositivity ? parseInt(minPositivity as string) : undefined,
      limit: parseInt(limit as string),
      page: parseInt(page as string)
    };

    const response = await newsService.getNews(query);
    res.json(response);
  } catch (error: any) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      error: 'Failed to fetch news',
      message: error.message
    });
  }
});

/**
 * GET /api/news/topics
 * Get available topics with article counts
 */
router.get('/topics', async (req: Request, res: Response) => {
  try {
    const stats = await newsService.getTopicStats();

    const topics = Object.values(Topic)
      .filter(t => t !== Topic.ALL)
      .map(topic => ({
        id: topic,
        name: topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: stats[topic] || 0
      }));

    res.json({ topics });
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      error: 'Failed to fetch topics',
      message: error.message
    });
  }
});

/**
 * POST /api/news/refresh
 * Force refresh of news articles
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;

    await newsService.fetchAndStoreNews({
      topic: topic || Topic.ALL,
      limit: 50
    });

    res.json({
      success: true,
      message: 'News refresh completed'
    });
  } catch (error: any) {
    console.error('Error refreshing news:', error);
    res.status(500).json({
      error: 'Failed to refresh news',
      message: error.message
    });
  }
});

/**
 * GET /api/news/:id
 * Get a single article by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implement get article by ID
    res.status(501).json({
      error: 'Not implemented yet'
    });
  } catch (error: any) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      error: 'Failed to fetch article',
      message: error.message
    });
  }
});

export default router;
