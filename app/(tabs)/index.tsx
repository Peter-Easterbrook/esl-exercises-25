import { CategoryCard } from '@/components/CategoryCard';
import ThemedLoader from '@/components/themed-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Category } from '@/types';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const loadCategories = async () => {
    try {
      const { getCategories, initializeDefaultData } = await import(
        '@/services/firebaseService'
      );

      // Try to get categories, if none exist, initialize default data
      let categoriesData = await getCategories();

      if (categoriesData.length === 0) {
        await initializeDefaultData();
        categoriesData = await getCategories();
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to mock data if Firebase fails
      const mockCategories: Category[] = [
        {
          id: '5',
          name: 'Find the Mistake',
          description: 'Identify and correct common English errors',
          icon: 'exclamationmark.circle',
          exercises: [],
        },
        {
          id: '2',
          name: 'Grammar',
          description: 'Master English grammar rules and structures',
          icon: 'book',
          exercises: [],
        },
        {
          id: '6',
          name: 'Listening Skills',
          description: 'Enhance your English listening abilities',
          icon: 'ear',
          exercises: [],
        },
        {
          id: '4',
          name: 'Reading Comprehension',
          description: 'Improve reading skills and understanding',
          icon: 'doc.text',
          exercises: [],
        },
        {
          id: '1',
          name: 'Tenses',
          description: 'Learn and practice different English tenses',
          icon: 'clock',
          exercises: [],
        },
        {
          id: '3',
          name: 'Vocabulary',
          description: 'Expand your English vocabulary',
          icon: 'text.bubble',
          exercises: [],
        },
      ];
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedLoader />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <Image
            source={require('@/assets/images/favicon.png')}
            style={{ width: 40, height: 40 }}
          />
          <ThemedText type='title'>ESL Exercises</ThemedText>
        </View>
        <View style={{ height: 10 }} />
        <ThemedText type='subtitle'>
          Choose a category to start learning
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 10,
  },
});
