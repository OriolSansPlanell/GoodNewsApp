import { INewsAdapter } from '../types';
import { NewsAPIAdapter } from './NewsAPIAdapter';
import { GuardianAdapter } from './GuardianAdapter';
import { RSSAdapter } from './RSSAdapter';
import { MultiAdapter } from './MultiAdapter';

/**
 * Factory for creating news adapters
 * Makes it easy to switch between different news sources
 */
export class AdapterFactory {
  static createNewsAdapter(type: string): INewsAdapter {
    switch (type.toLowerCase()) {
      case 'newsapi':
        return new NewsAPIAdapter();
      case 'guardian':
        return new GuardianAdapter();
      case 'rss':
        return new RSSAdapter();
      case 'multi':
      default:
        return new MultiAdapter();
    }
  }
}

export default AdapterFactory;
