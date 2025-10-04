import { db, storage } from '@/config/firebase';
import { DownloadableFile } from '@/types';
import * as DocumentPicker from 'expo-document-picker';
import { downloadAsync, cacheDirectory } from 'expo-file-system/legacy';
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

// Upload file to Firebase Storage
export const uploadFile = async (
  file: DocumentPicker.DocumentPickerAsset,
  categoryId: string,
  exerciseId: string | null,
  userId: string
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
      exerciseId: exerciseId || undefined,
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

    console.log('Found', snapshot.docs.length, 'files for exercise', exerciseId);

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

// Download and share file
export const downloadFile = async (file: DownloadableFile): Promise<void> => {
  try {
    console.log('Starting download for file:', file.name);
    console.log('Download URL:', file.fileUrl);

    // Sanitize filename to remove special characters
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Use legacy API which is more stable
    const fileUri = cacheDirectory + sanitizedName;

    console.log('Cache directory:', cacheDirectory);
    console.log('Downloading to:', fileUri);

    // Download file using legacy API
    const downloadResult = await downloadAsync(file.fileUrl, fileUri);

    console.log('Download complete:', downloadResult);

    if (downloadResult.status === 200) {
      // Share the file using the downloaded file's URI
      const sharingAvailable = await Sharing.isAvailableAsync();
      console.log('Sharing available:', sharingAvailable);

      if (sharingAvailable) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: file.fileType === 'pdf' ? 'application/pdf' :
                    file.fileType === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                    'application/msword',
          UTI: file.fileType === 'pdf' ? 'com.adobe.pdf' : 'com.microsoft.word.doc',
          dialogTitle: `Download ${file.name}`
        });
        console.log('File shared successfully');
      } else {
        throw new Error('Sharing is not available on this platform');
      }
    } else {
      throw new Error(`Failed to download file. Status: ${downloadResult.status}`);
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
