import Sentiment from 'sentiment';
import natural from 'natural';
import { IPositivityAnalyzer, PositivityAnalysis } from '../types';

/**
 * Free tier positivity analyzer using open-source sentiment analysis
 * This analyzer uses the AFINN-based sentiment library and natural NLP
 *
 * Upgrade path: Replace with PremiumAIAnalyzer for more nuanced analysis
 */
export class SentimentAnalyzer implements IPositivityAnalyzer {
  name = 'sentiment-analyzer';
  isPremium = false;

  private sentiment: Sentiment;
  private tokenizer: any;

  // Positive keywords that indicate uplifting news
  private positiveKeywords = [
    'breakthrough', 'success', 'achievement', 'innovation', 'cure', 'save',
    'rescue', 'help', 'support', 'growth', 'improve', 'discover', 'celebrate',
    'win', 'victory', 'progress', 'advance', 'launch', 'develop', 'create',
    'inspire', 'hope', 'heal', 'protect', 'unite', 'peace', 'recovery',
    'milestone', 'accomplish', 'thrive', 'flourish', 'triumph', 'benefit',
    'positive', 'uplift', 'empower', 'volunteer', 'donate', 'charity',
    'community', 'together', 'collaborate', 'sustainable', 'renewable',
    'green', 'clean', 'solution', 'award', 'honor', 'recognize'
  ];

  // Negative keywords that indicate potentially upsetting news
  private negativeKeywords = [
    'death', 'kill', 'murder', 'war', 'attack', 'terror', 'crash', 'disaster',
    'tragedy', 'crisis', 'conflict', 'violence', 'threat', 'danger', 'fear',
    'collapse', 'fail', 'loss', 'damage', 'destroy', 'victim', 'crime',
    'scandal', 'corrupt', 'fraud', 'abuse', 'harm', 'injure', 'suffer'
  ];

  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
  }

  async analyze(text: string, title: string): Promise<PositivityAnalysis> {
    // Combine title and text, giving more weight to title
    const combinedText = `${title} ${title} ${text}`.toLowerCase();

    // 1. Sentiment Analysis (40% weight)
    const sentimentResult = this.sentiment.analyze(combinedText);
    const sentimentScore = this.normalizeSentimentScore(sentimentResult.score);

    // 2. Keyword Analysis (30% weight)
    const keywordScore = this.analyzeKeywords(combinedText);

    // 3. Topic Positivity (20% weight)
    const topicScore = this.analyzeTopicContext(combinedText);

    // 4. Structure Analysis (10% weight)
    const structureScore = this.analyzeStructure(text, title);

    // Calculate weighted final score
    const finalScore = Math.round(
      sentimentScore * 0.4 +
      keywordScore * 0.3 +
      topicScore * 0.2 +
      structureScore * 0.1
    );

    // Determine sentiment category
    let sentiment: 'positive' | 'neutral' | 'negative';
    if (finalScore >= 60) sentiment = 'positive';
    else if (finalScore >= 40) sentiment = 'neutral';
    else sentiment = 'negative';

    // Extract positive keywords found
    const tokens = this.tokenizer.tokenize(combinedText);
    const foundPositiveKeywords = this.positiveKeywords.filter(
      keyword => tokens.includes(keyword)
    );

    // Confidence based on text length and clarity
    const confidence = this.calculateConfidence(text, sentimentResult);

    return {
      score: finalScore,
      sentiment,
      confidence,
      positiveKeywords: foundPositiveKeywords
    };
  }

  /**
   * Normalize sentiment score from AFINN scale to 0-100
   */
  private normalizeSentimentScore(score: number): number {
    // AFINN scores typically range from -5 to +5 per word
    // For a typical article, scores might range from -50 to +50
    // Normalize to 0-100 scale
    const normalized = ((score + 50) / 100) * 100;
    return Math.max(0, Math.min(100, normalized));
  }

  /**
   * Analyze positive vs negative keywords
   */
  private analyzeKeywords(text: string): number {
    let positiveCount = 0;
    let negativeCount = 0;

    this.positiveKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) positiveCount += matches.length;
    });

    this.negativeKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) negativeCount += matches.length;
    });

    // Calculate ratio
    const total = positiveCount + negativeCount;
    if (total === 0) return 50; // Neutral if no keywords found

    const ratio = positiveCount / total;
    return ratio * 100;
  }

  /**
   * Analyze based on topic context
   */
  private analyzeTopicContext(text: string): number {
    // Positive topic indicators
    const positiveTopics = [
      'innovation', 'technology', 'science', 'research', 'education',
      'health', 'environment', 'sustainability', 'community', 'art',
      'culture', 'progress', 'development'
    ];

    let score = 50; // Start neutral

    positiveTopics.forEach(topic => {
      if (text.includes(topic)) {
        score += 5;
      }
    });

    return Math.min(100, score);
  }

  /**
   * Analyze article structure for positivity indicators
   */
  private analyzeStructure(text: string, title: string): number {
    let score = 50;

    // Question mark in title often indicates positive curiosity
    if (title.includes('?')) score += 10;

    // Exclamation points can indicate excitement (in moderation)
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations > 0 && exclamations <= 3) score += 10;
    if (exclamations > 5) score -= 10; // Too many might indicate alarm

    // Quotes from people often indicate human interest stories
    if (text.includes('"') || text.includes('"')) score += 10;

    // Numbers and statistics can indicate progress
    if (/\d+%/.test(text) || /increase|grow|rise/.test(text)) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(text: string, sentimentResult: any): number {
    let confidence = 0.5;

    // More text = more confidence
    if (text.length > 500) confidence += 0.2;
    if (text.length > 1000) confidence += 0.1;

    // Higher absolute sentiment score = more confidence
    if (Math.abs(sentimentResult.score) > 5) confidence += 0.1;
    if (Math.abs(sentimentResult.score) > 10) confidence += 0.1;

    return Math.min(1, confidence);
  }
}

export default SentimentAnalyzer;
