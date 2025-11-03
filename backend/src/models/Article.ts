import mongoose, { Schema, Document } from 'mongoose';
import { Article as IArticle, Topic } from '../types';

export interface ArticleDocument extends Omit<IArticle, 'id'>, Document {}

const ArticleSchema = new Schema<ArticleDocument>({
  title: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  url: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  imageUrl: {
    type: String
  },
  source: {
    type: String,
    required: true,
    index: true
  },
  author: {
    type: String
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  topic: {
    type: String,
    enum: Object.values(Topic),
    required: true,
    index: true
  },
  positivityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  keywords: [{
    type: String
  }],
  fetchedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ArticleSchema.index({ topic: 1, positivityScore: -1, publishedAt: -1 });
ArticleSchema.index({ publishedAt: -1, positivityScore: -1 });

// TTL index to automatically delete old articles after 30 days
ArticleSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ArticleModel = mongoose.model<ArticleDocument>('Article', ArticleSchema);

export default ArticleModel;
