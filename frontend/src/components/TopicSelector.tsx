import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Topic } from '../types';
import { TOPICS } from '../constants/topics';

interface TopicSelectorProps {
  selectedTopic: Topic;
  onSelectTopic: (topic: Topic) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  selectedTopic,
  onSelectTopic
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {TOPICS.map((topic) => {
        const isSelected = topic.id === selectedTopic;

        return (
          <TouchableOpacity
            key={topic.id}
            style={[
              styles.chip,
              isSelected && { backgroundColor: topic.color }
            ]}
            onPress={() => onSelectTopic(topic.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{topic.icon}</Text>
            <Text
              style={[
                styles.label,
                isSelected && styles.labelSelected
              ]}
            >
              {topic.name}
            </Text>
            {topic.count !== undefined && topic.count > 0 && (
              <View style={[
                styles.countBadge,
                isSelected && styles.countBadgeSelected
              ]}>
                <Text style={[
                  styles.countText,
                  isSelected && styles.countTextSelected
                ]}>
                  {topic.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  icon: {
    fontSize: 18,
    marginRight: 6
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242'
  },
  labelSelected: {
    color: '#FFFFFF'
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center'
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#424242'
  },
  countTextSelected: {
    color: '#FFFFFF'
  }
});

export default TopicSelector;
