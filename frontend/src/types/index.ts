export enum Topic {
  ALL = 'all',
  TECHNOLOGY = 'technology',
  SCIENCE = 'science',
  ENVIRONMENT = 'environment',
  HEALTH = 'health',
  COMMUNITY = 'community',
  EDUCATION = 'education',
  ARTS = 'arts',
  SOCIAL_PROGRESS = 'social_progress'
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  imageUrl?: string;
  source: string;
  author?: string;
  publishedAt: string;
  topic: Topic;
  positivityScore: number;
  keywords: string[];
  fetchedAt: string;
}

export interface NewsResponse {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TopicInfo {
  id: Topic;
  name: string;
  icon: string;
  color: string;
  count?: number;
}
