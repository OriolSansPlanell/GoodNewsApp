import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Article } from '../types';
import { getPositivityColor, getPositivityLabel } from '../constants/topics';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const handlePress = () => {
    Linking.openURL(article.url);
  };

  const positivityColor = getPositivityColor(article.positivityScore);
  const positivityLabel = getPositivityLabel(article.positivityScore);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      {article.imageUrl && (
        <Image source={{ uri: article.imageUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        {/* Positivity Badge */}
        <View style={[styles.badge, { backgroundColor: positivityColor }]}>
          <Text style={styles.badgeText}>{article.positivityScore}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {article.description}
        </Text>

        {/* Meta Info */}
        <View style={styles.meta}>
          <Text style={styles.source}>{article.source}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.date}>
            {new Date(article.publishedAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Positivity Label */}
        <View style={[styles.positivityLabel, { backgroundColor: positivityColor + '20' }]}>
          <Text style={[styles.positivityText, { color: positivityColor }]}>
            {positivityLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0'
  },
  content: {
    padding: 16
  },
  badge: {
    position: 'absolute',
    top: -100,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    lineHeight: 24
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
    lineHeight: 20
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  source: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '600'
  },
  separator: {
    marginHorizontal: 6,
    color: '#BDBDBD'
  },
  date: {
    fontSize: 12,
    color: '#9E9E9E'
  },
  positivityLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  positivityText: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export default ArticleCard;
