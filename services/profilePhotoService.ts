import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

const PROFILE_PHOTO_PREFIX = '@profile_photo_';

/**
 * Request camera permissions from the user
 */
export async function requestCameraPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true; // Web doesn't need explicit permissions
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Camera permission is required to take photos. Please enable it in your device settings.'
    );
    return false;
  }
  return true;
}

/**
 * Request media library permissions from the user
 */
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true; // Web doesn't need explicit permissions
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Photo library permission is required to select photos. Please enable it in your device settings.'
    );
    return false;
  }
  return true;
}

/**
 * Launch camera to take a photo
 */
export async function takePhoto(): Promise<string | null> {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Compress to save storage space
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo');
    return null;
  }
}

/**
 * Launch photo library to select a photo
 */
export async function pickPhoto(): Promise<string | null> {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Compress to save storage space
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error picking photo:', error);
    Alert.alert('Error', 'Failed to select photo');
    return null;
  }
}

/**
 * Save profile photo URI to local storage
 */
export async function saveProfilePhoto(
  userId: string,
  photoUri: string
): Promise<void> {
  try {
    const key = `${PROFILE_PHOTO_PREFIX}${userId}`;
    await AsyncStorage.setItem(key, photoUri);
  } catch (error) {
    console.error('Error saving profile photo:', error);
    throw new Error('Failed to save profile photo');
  }
}

/**
 * Load profile photo URI from local storage
 */
export async function loadProfilePhoto(userId: string): Promise<string | null> {
  try {
    const key = `${PROFILE_PHOTO_PREFIX}${userId}`;
    const photoUri = await AsyncStorage.getItem(key);
    return photoUri;
  } catch (error) {
    console.error('Error loading profile photo:', error);
    return null;
  }
}

/**
 * Delete profile photo from local storage
 */
export async function deleteProfilePhoto(userId: string): Promise<void> {
  try {
    const key = `${PROFILE_PHOTO_PREFIX}${userId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    throw new Error('Failed to delete profile photo');
  }
}
