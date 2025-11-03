# Upgrade Guide: Free Tier → Premium Services

This guide explains how to upgrade from free/open-source services to premium paid services for better performance, more features, and higher quality news and analysis.

## Current Free Tier Setup

**News Sources:**
- NewsAPI Free (100 requests/day)
- The Guardian API (unlimited, free)
- RSS Feeds (unlimited, free)

**Positivity Analysis:**
- Sentiment library (AFINN-based)
- Natural NLP library
- Custom algorithm

**Limitations:**
- Limited news sources
- Basic sentiment analysis
- No reasoning/explanation for scores
- Limited customization

## Upgrading News Sources

### Option 1: NewsAPI Pro ($449+/month)

**Benefits:**
- Unlimited requests
- Full archive access (back to 2016)
- More sources (150,000+)
- Better filtering options

**How to Upgrade:**

1. Sign up for NewsAPI Pro at https://newsapi.org/pricing

2. Update your `.env`:
```bash
NEWSAPI_PREMIUM_KEY=your_premium_key_here
NEWS_ADAPTER=newsapi  # Use only NewsAPI
```

3. No code changes needed! The adapter automatically handles both free and premium tiers.

### Option 2: Create Premium NewsAPI Adapter

For advanced features, create a new adapter:

```typescript
// backend/src/adapters/NewsAPIPremiumAdapter.ts
import { NewsAPIAdapter } from './NewsAPIAdapter';

export class NewsAPIPremiumAdapter extends NewsAPIAdapter {
  // Override with premium features
  protected baseUrl = 'https://api.newsapi.org/v2/premium';

  // Add premium-only methods
  async searchArchive(query: NewsQuery) {
    // Access full archive
  }

  async getAdvancedFilters(query: NewsQuery) {
    // Use advanced filtering
  }
}
```

Update factory:
```typescript
// backend/src/adapters/AdapterFactory.ts
case 'newsapi-premium':
  return new NewsAPIPremiumAdapter();
```

### Option 3: Add More Premium Sources

**Aylien News API** - Advanced NLP and filtering
- Pricing: Custom
- Website: https://aylien.com/news-api

**Webhose.io** - Real-time web data
- Pricing: From $299/month
- Website: https://webhose.io/

**Implementation:**
Create new adapters following the pattern:

```typescript
// backend/src/adapters/AylienAdapter.ts
import { INewsAdapter } from '../types';

export class AylienAdapter implements INewsAdapter {
  name = 'aylien';

  async fetchNews(query: NewsQuery): Promise<Article[]> {
    // Implement Aylien API calls
  }
}
```

## Upgrading Positivity Analysis

### Option 1: OpenAI GPT-4 (Recommended)

**Benefits:**
- Nuanced understanding of positivity
- Detailed reasoning for scores
- Context-aware analysis
- Can detect subtle positive themes

**Cost:** ~$0.03 per article (1000 tokens input + 200 output)

**How to Upgrade:**

1. Get OpenAI API key: https://platform.openai.com/api-keys

2. Update your `.env`:
```bash
OPENAI_API_KEY=your_key_here
POSITIVITY_ANALYZER=openai
```

3. Create the OpenAI analyzer:

```typescript
// backend/src/analyzers/OpenAIAnalyzer.ts
import OpenAI from 'openai';
import { IPositivityAnalyzer, PositivityAnalysis } from '../types';

export class OpenAIAnalyzer implements IPositivityAnalyzer {
  name = 'openai-analyzer';
  isPremium = true;

  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyze(text: string, title: string): Promise<PositivityAnalysis> {
    const prompt = `Analyze this news article for positivity. Rate it 0-100 where:
- 80-100: Very positive, uplifting, inspiring
- 60-79: Positive, constructive
- 40-59: Neutral or mixed
- 0-39: Negative or distressing

Article Title: ${title}
Article Text: ${text.substring(0, 2000)}

Respond in JSON format:
{
  "score": <number 0-100>,
  "sentiment": "<positive|neutral|negative>",
  "confidence": <number 0-1>,
  "positiveKeywords": ["keyword1", "keyword2"],
  "reasoning": "Brief explanation of the score"
}`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      score: result.score,
      sentiment: result.sentiment,
      confidence: result.confidence,
      positiveKeywords: result.positiveKeywords,
      reasoning: result.reasoning
    };
  }
}
```

4. Update the factory:
```typescript
// backend/src/analyzers/AnalyzerFactory.ts
import { OpenAIAnalyzer } from './OpenAIAnalyzer';

case 'openai':
  return new OpenAIAnalyzer();
```

### Option 2: Anthropic Claude

**Benefits:**
- Excellent at nuanced analysis
- Strong reasoning capabilities
- Lower cost than GPT-4

**Cost:** ~$0.015 per article

**Implementation:**

```typescript
// backend/src/analyzers/AnthropicAnalyzer.ts
import Anthropic from '@anthropic-ai/sdk';
import { IPositivityAnalyzer, PositivityAnalysis } from '../types';

export class AnthropicAnalyzer implements IPositivityAnalyzer {
  name = 'anthropic-analyzer';
  isPremium = true;

  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async analyze(text: string, title: string): Promise<PositivityAnalysis> {
    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Analyze this news article for positivity (0-100 score)...
Title: ${title}
Text: ${text.substring(0, 2000)}`
      }]
    });

    // Parse and return analysis
    // Similar to OpenAI implementation
  }
}
```

## Cost Comparison

### Current (Free Tier)
- **Monthly Cost:** $0
- **Article Capacity:** ~3,000/day (with rate limits)
- **Analysis Quality:** Good
- **Customization:** Limited

### Premium Option A (OpenAI + NewsAPI Pro)
- **Monthly Cost:** ~$449 + ~$900 = ~$1,349
- **Article Capacity:** Unlimited
- **Analysis Quality:** Excellent
- **Customization:** Extensive

### Premium Option B (Anthropic + Mixed Sources)
- **Monthly Cost:** ~$450
- **Article Capacity:** ~30,000/month
- **Analysis Quality:** Excellent
- **Customization:** Good

### Recommended Upgrade Path

**Stage 1: Stay Free (0-100 users)**
- Use current setup
- No costs
- Adequate for testing and early users

**Stage 2: Add Premium Analysis ($100-500/month for 1,000-10,000 users)**
- Keep free news sources
- Add Anthropic Claude for analysis
- Much better positivity scoring
- Costs scale with usage

**Stage 3: Full Premium ($500+ for 10,000+ users)**
- Add NewsAPI Pro or custom sources
- Use OpenAI/Anthropic for analysis
- Maximum quality and capacity
- Best user experience

## Testing Premium Features

Before committing to paid services, test with free tiers:

1. **OpenAI:** $5 free credit for new accounts
2. **Anthropic:** $5 free credit
3. **NewsAPI:** 100 requests/day free forever

Update `.env` to switch between analyzers:
```bash
# Test OpenAI
POSITIVITY_ANALYZER=openai

# Test Anthropic
POSITIVITY_ANALYZER=anthropic

# Back to free
POSITIVITY_ANALYZER=sentiment
```

No code changes needed! The factory pattern handles everything.

## Monitoring Costs

Add cost tracking to your analyzers:

```typescript
async analyze(text: string, title: string): Promise<PositivityAnalysis> {
  const startTime = Date.now();
  const result = await this.analyzeInternal(text, title);
  const duration = Date.now() - startTime;

  // Log for cost tracking
  console.log({
    analyzer: this.name,
    duration,
    estimatedCost: this.estimateCost(text)
  });

  return result;
}
```

## Questions?

For more help:
- Check GitHub issues
- Read the API documentation
- Contact support

Happy upgrading! 🚀
