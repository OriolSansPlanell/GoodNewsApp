import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text
} from 'react-native';
import { Topic, Article } from '../types';
import { fetchNews, refreshNews } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { TopicSelector } from '../components/TopicSelector';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';

export const HomeScreen: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic>(Topic.ALL);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load articles
  const loadArticles = useCallback(async (topic: Topic, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await fetchNews({
        topic: topic === Topic.ALL ? undefined : topic,
        limit: 20
      });

      setArticles(response.articles);
    } catch (err: any) {
      console.error('Error loading articles:', err);
      setError(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadArticles(selectedTopic);
  }, [selectedTopic]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshNews(selectedTopic === Topic.ALL ? undefined : selectedTopic);
      await loadArticles(selectedTopic, false);
    } catch (err) {
      console.error('Error refreshing:', err);
      setRefreshing(false);
    }
  }, [selectedTopic, loadArticles]);

  // Handle topic change
  const handleTopicChange = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  // Render article item
  const renderArticle = ({ item }: { item: Article }) => (
    <ArticleCard article={item} />
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>GoodNews</Text>
        <Text style={styles.headerSubtitle}>
          Only positive, uplifting news
        </Text>
      </LinearGradient>

      <TopicSelector
        selectedTopic={selectedTopic}
        onSelectTopic={handleTopicChange}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        {renderHeader()}
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={
          <EmptyState
            message={error || 'No positive news found'}
            onRetry={() => loadArticles(selectedTopic)}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        contentContainerStyle={articles.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    backgroundColor: '#FFFFFF'
  },
  headerGradient: {
    padding: 20,
    paddingTop: 16
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9
  },
  list: {
    paddingBottom: 16
  },
  emptyList: {
    flex: 1
  }
});

export default HomeScreen;
