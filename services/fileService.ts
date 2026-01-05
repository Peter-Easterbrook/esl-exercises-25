import { db, storage } from '@/config/firebase';
import { DownloadableFile } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import {
  cacheDirectory,
  deleteAsync,
  downloadAsync,
  EncodingType,
  readAsStringAsync,
  StorageAccessFramework,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { Alert, Platform } from 'react-native';

// Key for storing the user's chosen download directory URI
const DOWNLOADS_URI_KEY = 'user_downloads_directory_uri';

// Upload file to Firebase Storage
export const uploadFile = async (
  file: DocumentPicker.DocumentPickerAsset,
  categoryId: string,
  exerciseId: string | null,
  userId: string,
  level?: 'beginner' | 'intermediate' | 'advanced'
): Promise<string> => {
  try {
    // Create a unique file name
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `documents/${categoryId}/${fileName}`);

    // Read file as blob for upload
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Upload file
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);

    // Determine file type
    const fileType = file.name.toLowerCase().endsWith('.pdf')
      ? 'pdf'
      : file.name.toLowerCase().endsWith('.docx')
      ? 'docx'
      : 'doc';

    // Save metadata to Firestore
    const fileMetadata: Omit<DownloadableFile, 'id'> = {
      name: file.name,
      fileUrl: downloadUrl,
      fileType,
      size: file.size || 0,
      categoryId,
      ...(exerciseId && { exerciseId }),
      ...(level && { level }),
      uploadedAt: new Date(),
      uploadedBy: userId,
    };

    const docRef = await addDoc(
      collection(db, 'downloadableFiles'),
      fileMetadata
    );

    return docRef.id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get files by category
export const getFilesByCategory = async (
  categoryId: string
): Promise<DownloadableFile[]> => {
  try {
    const filesRef = collection(db, 'downloadableFiles');
    const q = query(filesRef, where('categoryId', '==', categoryId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
    })) as DownloadableFile[];
  } catch (error) {
    console.error('Error fetching files by category:', error);
    throw error;
  }
};

// Get files by exercise
export const getFilesByExercise = async (
  exerciseId: string
): Promise<DownloadableFile[]> => {
  try {
    console.log('getFilesByExercise called with exerciseId:', exerciseId);
    const filesRef = collection(db, 'downloadableFiles');
    const q = query(filesRef, where('exerciseId', '==', exerciseId));
    const snapshot = await getDocs(q);

    console.log(
      'Found',
      snapshot.docs.length,
      'files for exercise',
      exerciseId
    );

    const files = snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log('File document:', doc.id, data);
      return {
        id: doc.id,
        ...data,
        uploadedAt: data.uploadedAt?.toDate() || new Date(),
      } as DownloadableFile;
    });

    return files;
  } catch (error) {
    console.error('Error fetching files by exercise:', error);
    throw error;
  }
};

// Helper function to get MIME type
const getMimeType = (fileType: string): string => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
};

// Get or request the downloads directory permission (Android SAF)
const getOrRequestDownloadsDirectory = async (): Promise<string | null> => {
  // Check if we already have a saved directory URI
  const savedUri = await AsyncStorage.getItem(DOWNLOADS_URI_KEY);
  if (savedUri) {
    return savedUri;
  }

  // Request permission to a directory (user picks Downloads folder)
  const permissions =
    await StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (permissions.granted) {
    // Save the URI for future use
    await AsyncStorage.setItem(DOWNLOADS_URI_KEY, permissions.directoryUri);
    return permissions.directoryUri;
  }

  return null;
};

// Download file directly to user's chosen folder (Android) or share (iOS)
export const downloadFile = async (file: DownloadableFile): Promise<void> => {
  try {
    console.log('Starting download for file:', file.name);
    console.log('Download URL:', file.fileUrl);

    // Sanitize filename to remove special characters
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Download to cache first
    const cacheUri = cacheDirectory + sanitizedName;

    console.log('Cache directory:', cacheDirectory);
    console.log('Downloading to cache:', cacheUri);

    // Download file to cache
    const downloadResult = await downloadAsync(file.fileUrl, cacheUri);

    console.log('Download complete:', downloadResult);

    if (downloadResult.status !== 200) {
      throw new Error(
        `Failed to download file. Status: ${downloadResult.status}`
      );
    }

    // Platform-specific handling
    if (Platform.OS === 'android') {
      // Use Storage Access Framework to save to user's chosen directory
      const directoryUri = await getOrRequestDownloadsDirectory();

      if (!directoryUri) {
        Alert.alert(
          'Permission Required',
          'Please grant folder access permission to save files directly to your Downloads folder.'
        );
        throw new Error('Folder access permission not granted');
      }

      try {
        // Read the downloaded file as base64
        const fileContent = await readAsStringAsync(downloadResult.uri, {
          encoding: EncodingType.Base64,
        });

        // Create file in user-selected directory
        const mimeType = getMimeType(file.fileType);
        const fileUri = await StorageAccessFramework.createFileAsync(
          directoryUri,
          sanitizedName,
          mimeType
        );

        // Write the content to the new file
        await writeAsStringAsync(fileUri, fileContent, {
          encoding: EncodingType.Base64,
        });

        console.log('File saved to:', fileUri);

        // Clean up cache file
        await deleteAsync(downloadResult.uri, { idempotent: true });

        Alert.alert(
          'Success',
          `${file.name} has been saved to your Downloads folder.`
        );
      } catch (safError) {
        console.error('SAF Error:', safError);

        // If SAF fails (e.g., permission expired), clear saved URI and retry
        await AsyncStorage.removeItem(DOWNLOADS_URI_KEY);

        // Fall back to sharing
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: getMimeType(file.fileType),
            dialogTitle: `Save ${file.name}`,
          });
        } else {
          throw safError;
        }
      }
    } else {
      // iOS: Use share sheet
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: getMimeType(file.fileType),
          dialogTitle: `Save ${file.name}`,
        });
        console.log('File shared successfully');
      } else {
        Alert.alert(
          'Download Complete',
          `${file.name} has been downloaded. The file is available in the app's cache.`
        );
      }
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

// Clear saved downloads directory (useful if user wants to change folder)
export const clearDownloadsDirectoryPermission = async (): Promise<void> => {
  await AsyncStorage.removeItem(DOWNLOADS_URI_KEY);
};

// Delete file (admin only)
export const deleteFile = async (
  fileId: string,
  fileUrl: string
): Promise<void> => {
  try {
    // Delete from Storage
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);

    // Delete metadata from Firestore
    await deleteDoc(doc(db, 'downloadableFiles', fileId));
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Link file to exercise
export const linkFileToExercise = async (
  fileId: string,
  exerciseId: string
): Promise<void> => {
  try {
    const fileRef = doc(db, 'downloadableFiles', fileId);
    await updateDoc(fileRef, { exerciseId });
  } catch (error) {
    console.error('Error linking file to exercise:', error);
    throw error;
  }
};
