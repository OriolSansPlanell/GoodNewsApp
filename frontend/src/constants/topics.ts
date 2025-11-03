import { Topic, TopicInfo } from '../types';

export const TOPICS: TopicInfo[] = [
  {
    id: Topic.ALL,
    name: 'All News',
    icon: '📰',
    color: '#2196F3'
  },
  {
    id: Topic.TECHNOLOGY,
    name: 'Technology',
    icon: '🚀',
    color: '#9C27B0'
  },
  {
    id: Topic.SCIENCE,
    name: 'Science',
    icon: '🔬',
    color: '#3F51B5'
  },
  {
    id: Topic.ENVIRONMENT,
    name: 'Environment',
    icon: '🌍',
    color: '#4CAF50'
  },
  {
    id: Topic.HEALTH,
    name: 'Health',
    icon: '❤️',
    color: '#F44336'
  },
  {
    id: Topic.COMMUNITY,
    name: 'Community',
    icon: '🤝',
    color: '#FF9800'
  },
  {
    id: Topic.EDUCATION,
    name: 'Education',
    icon: '🎓',
    color: '#00BCD4'
  },
  {
    id: Topic.ARTS,
    name: 'Arts & Culture',
    icon: '🎨',
    color: '#E91E63'
  },
  {
    id: Topic.SOCIAL_PROGRESS,
    name: 'Social Progress',
    icon: '⚖️',
    color: '#795548'
  }
];

export const getTopicInfo = (topic: Topic): TopicInfo => {
  return TOPICS.find(t => t.id === topic) || TOPICS[0];
};

export const getPositivityColor = (score: number): string => {
  if (score >= 80) return '#4CAF50'; // Green - Very Positive
  if (score >= 60) return '#8BC34A'; // Light Green - Positive
  if (score >= 40) return '#FFC107'; // Amber - Neutral
  return '#FF9800'; // Orange - Less Positive
};

export const getPositivityLabel = (score: number): string => {
  if (score >= 80) return 'Very Positive 🌟';
  if (score >= 60) return 'Positive 😊';
  if (score >= 40) return 'Neutral 😐';
  return 'Mixed';
};
