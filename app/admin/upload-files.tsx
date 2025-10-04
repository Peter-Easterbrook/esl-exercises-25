import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteFile,
  getFilesByCategory,
  uploadFile,
} from '@/services/fileService';
import { getCategories } from '@/services/firebaseService';
import { Category, DownloadableFile } from '@/types';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function UploadFilesScreen() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [files, setFiles] = useState<DownloadableFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadFiles();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const filesData = await getFilesByCategory(selectedCategory);
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading files:', error);
      Alert.alert('Error', 'Failed to load files');
    }
  };

  const handlePickDocument = async () => {
    try {
      if (!selectedCategory) {
        Alert.alert('Error', 'Please select a category first');
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size && file.size > maxSize) {
        Alert.alert('Error', 'File size must be less than 10MB');
        return;
      }

      setUploading(true);

      await uploadFile(file, selectedCategory, null, user!.uid);

      Alert.alert('Success', 'File uploaded successfully');
      await loadFiles();
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = (file: DownloadableFile) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFile(file.id, file.fileUrl);
              Alert.alert('Success', 'File deleted successfully');
              await loadFiles();
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/admin')}
        >
          <IconSymbol name='chevron.left' size={24} color='#2196F3' />
          <ThemedText style={styles.backText}>Back to Admin</ThemedText>
        </TouchableOpacity>

        <ThemedText type='title' style={styles.title}>
          Upload Files
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Select Category
          </ThemedText>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <ThemedText
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id &&
                      styles.selectedCategoryText,
                  ]}
                >
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upload Button */}
        {selectedCategory && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadingButton]}
              onPress={handlePickDocument}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <>
                  <IconSymbol name='doc.badge.plus' size={24} color='#fff' />
                  <ThemedText style={styles.uploadButtonText}>
                    Upload Document
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
            <ThemedText style={styles.helpText}>
              Supported formats: PDF, DOC, DOCX (max 10MB)
            </ThemedText>
          </View>
        )}

        {/* Files List */}
        {selectedCategory && files.length > 0 && (
          <View style={styles.section}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Uploaded Files
            </ThemedText>
            {files.map((file) => (
              <View key={file.id} style={styles.fileCard}>
                <View style={styles.fileIcon}>
                  <IconSymbol
                    name={file.fileType === 'pdf' ? 'doc.text' : 'doc'}
                    size={24}
                    color='#2196F3'
                  />
                </View>
                <View style={styles.fileInfo}>
                  <ThemedText style={styles.fileName}>{file.name}</ThemedText>
                  <ThemedText style={styles.fileDetails}>
                    {formatFileSize(file.size)} • {file.fileType.toUpperCase()}
                  </ThemedText>
                  <ThemedText style={styles.fileDate}>
                    {file.uploadedAt.toLocaleDateString()}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFile(file)}
                >
                  <IconSymbol name='trash' size={20} color='#F44336' />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
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
    color: '#2196F3',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  uploadingButton: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  fileDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
});
