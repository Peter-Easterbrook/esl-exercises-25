import { ThemedLoader } from '@/components/themed-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Category } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ManageCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'folder',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { getCategories } = await import('@/services/firebaseService');
      const allCategories = await getCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'folder',
    });
    setModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
    });
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a category description');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const { updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/config/firebase');
        await updateDoc(doc(db, 'categories', editingCategory.id), {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        });
        Alert.alert('Success', 'Category updated successfully');
      } else {
        // Create new category
        const { createCategory } = await import('@/services/firebaseService');
        await createCategory({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        });
        Alert.alert('Success', 'Category created successfully');
      }
      setModalVisible(false);
      loadCategories(); // Reload the list
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    console.log('🗑️ Delete button clicked for category:', category.name);

    // Android-compatible confirmation
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?\n\nThis will permanently remove the category. Any exercises in this category will no longer be associated with it.\n\nThis action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Delete cancelled'),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('🔥 Delete confirmed, executing deletion...');
            performDelete(category);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const performDelete = async (category: Category) => {
    try {
      console.log(`🔄 Attempting to delete category ID: ${category.id}`);
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/config/firebase');

      await deleteDoc(doc(db, 'categories', category.id));
      console.log('✅ Category deleted from Firebase successfully');

      Alert.alert('Success', 'Category deleted successfully');
      await loadCategories(); // Reload the list
      console.log('✅ Category list reloaded');
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      Alert.alert(
        'Error',
        `Failed to delete category.\n\nError: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableIcons = [
    'house.fill',
    'paperplane.fill',
    'list.bullet',
    'chart.bar.fill',
    'person.fill',
    'plus',
    'plus.circle',
    'plus.circle.fill',
    'pencil',
    'trash',
    'gear',
    'checkmark',
    'checkmark.circle.fill',
    'xmark',
    'clock',
    'book',
    'text.bubble',
    'doc.text',
    'doc.badge.plus',
    'ear',
    'folder',
    'magnifyingglass',
    'questionmark.circle',
    'info.circle',
    'bell',
    'person.circle',
    'person.2',
    'person.2.circle',
    'calendar',
    'exclamationmark.circle',
    'eye',
    'eye.slash',
    'camera.fill',
    'circle.fill',
    'flame.fill',
    'square.and.arrow.down',
    'square.and.arrow.up',
    'arrow.right.square',
    'arrow.clockwise',
    'chart.pie',


  ];

  if (loading) {
    return <ThemedLoader />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name='chevron.left' size={24} color='#6996b3' />
            <ThemedText style={styles.backText}>Back to Admin</ThemedText>
          </TouchableOpacity>

          <ThemedText type='title' style={styles.title}>
            Manage Categories
          </ThemedText>
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <IconSymbol name='magnifyingglass' size={20} color='#464655' />
            <TextInput
              style={styles.searchInput}
              placeholder='Search categories...'
              placeholderTextColor='rgba(102, 102, 102, 0.5)'
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Add New Category Button */}
          <Pressable
            onPress={handleAddCategory}
            android_ripple={{
              color: 'rgba(149, 194, 151, 0.3)',
              foreground: true,
            }}
            style={styles.addButton}
          >
            <IconSymbol name='plus.circle.fill' size={24} color='#fff' />
            <ThemedText style={styles.addButtonText}>
              Add New Category
            </ThemedText>
          </Pressable>

          {/* Category List */}
          <ScrollView
            style={styles.categoryList}
            showsVerticalScrollIndicator={false}
          >
            {filteredCategories.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name='folder' size={48} color='#ccc' />
                <ThemedText style={styles.emptyText}>
                  {searchQuery
                    ? 'No categories match your search'
                    : 'No categories found'}
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  {!searchQuery && 'Start by adding your first category'}
                </ThemedText>
              </View>
            ) : (
              filteredCategories.map((category) => (
                <View key={category.id} style={styles.categoryCard}>
                  <View style={styles.categoryIconContainer}>
                    <IconSymbol
                      name={category.icon as any}
                      size={32}
                      color='#6996b3'
                    />
                  </View>

                  <View style={styles.categoryInfo}>
                    <ThemedText style={styles.categoryName}>
                      {category.name}
                    </ThemedText>
                    <ThemedText style={styles.categoryDescription}>
                      {category.description}
                    </ThemedText>

                    <View style={styles.categoryMetadata}>
                      <IconSymbol
                        name='questionmark.circle'
                        size={14}
                        color='#464655'
                      />
                      <ThemedText style={styles.metadataText}>
                        {category.exercises?.length || 0} exercises
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditCategory(category)}
                    >
                      <IconSymbol name='pencil' size={16} color='#6996b3' />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteCategory(category)}
                    >
                      <IconSymbol name='trash' size={16} color='#6f0202' />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      {/* Add/Edit Category Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name='xmark' size={24} color='#464655' />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* Category Name Input */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Category Name</ThemedText>
                <TextInput
                  style={styles.textInput}
                  placeholder='Enter category name'
                  placeholderTextColor='rgba(102, 102, 102, 0.5)'
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />
              </View>

              {/* Category Description Input */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Description</ThemedText>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder='Enter category description'
                  placeholderTextColor='rgba(102, 102, 102, 0.5)'
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              {/* Icon Selector */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Select Icon</ThemedText>
                <View style={styles.iconGrid}>
                  {availableIcons.map((iconName) => (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconOption,
                        formData.icon === iconName && styles.iconOptionSelected,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, icon: iconName })
                      }
                    >
                      <IconSymbol
                        name={iconName as any}
                        size={28}
                        color={
                          formData.icon === iconName ? '#6996b3' : '#464655'
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Form Actions */}
              <View style={styles.formActions}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <ThemedText style={styles.cancelButtonText}>
                    Cancel
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveCategory}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {editingCategory ? 'Update' : 'Create'} Category
                  </ThemedText>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    color: '#6996b3',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
    outlineWidth: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07b524',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  categoryList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#444',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  categoryMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#202029',
    fontWeight: 'normal',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#e3f2fd',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
  },
  formContainer: {
    paddingBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  textAreaInput: {
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: '22%',
    height: 80,
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    verticalAlign: 'middle',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#6996b3',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#202029',
    fontWeight: 'normal',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#07b524',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
