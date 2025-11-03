import { IPositivityAnalyzer } from '../types';
import { SentimentAnalyzer } from './SentimentAnalyzer';
// Future: import { PremiumAIAnalyzer } from './PremiumAIAnalyzer';

/**
 * Factory for creating positivity analyzers
 * Makes it easy to switch between free and premium analyzers
 */
export class AnalyzerFactory {
  static createAnalyzer(type: string): IPositivityAnalyzer {
    switch (type.toLowerCase()) {
      case 'sentiment':
      default:
        return new SentimentAnalyzer();
      // Future premium options:
      // case 'openai':
      //   return new OpenAIAnalyzer();
      // case 'anthropic':
      //   return new AnthropicAnalyzer();
    }
  }
}

export default AnalyzerFactory;
