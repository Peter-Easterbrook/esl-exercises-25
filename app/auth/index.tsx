import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp, user } = useAuth();

  // Auto-navigate when user becomes authenticated
  useEffect(() => {
    if (user) {
      console.log('🚀 User authenticated, navigating to app...');
      setLoading(false);
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log(`${isLogin ? 'Signing in' : 'Signing up'} user:`, email);

      if (isLogin) {
        await signIn(email, password);
        console.log('✅ Sign in successful');
      } else {
        await signUp(email, password, displayName);
        console.log('✅ Sign up successful');
      }

      // Don't manually navigate - let the auth state change handle it
      console.log('Waiting for auth state change...');

      // Set a timeout to reset loading state if navigation doesn't happen
      setTimeout(() => {
        console.log('⚠️ Auth completed, resetting loading state');
        setLoading(false);
      }, 3000);
    } catch (error: any) {
      console.error('❌ Auth error:', error);

      // Provide user-friendly error messages
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }

      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior='padding'
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <View style={styles.titleText}>
            <Image
              source={require('@/assets/images/LL2020.png')}
              style={{ width: 80, height: 80 }}
              resizeMode='contain'
            />

            <ThemedText type='title' style={styles.title}>
              ESL Exercises
            </ThemedText>
          </View>
          <ThemedText type='default' style={styles.subtitle}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder='Email'
            placeholderTextColor='rgba(102, 102, 102, 0.5)'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
            textContentType='emailAddress'
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder='Password'
              placeholderTextColor='rgba(102, 102, 102, 0.5)'
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              textContentType={isLogin ? 'password' : 'newPassword'}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <IconSymbol
                name={showPassword ? 'eye' : 'eye.slash'}
                size={20}
                color='#666'
              />
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder='Display Name (optional)'
              placeholderTextColor='rgba(102, 102, 102, 0.5)'
              value={displayName}
              onChangeText={setDisplayName}
              autoComplete='name'
              textContentType='name'
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.linkText}>
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 100, // Increased padding to ensure button is visible above keyboard
    backgroundColor: '#fff',
  },
  titleContainer: {
    marginBottom: 40,
  },
  titleText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    textAlign: 'center',
    paddingBottom: 10,
    marginRight: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginTop: 20,
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 16,
    paddingRight: 50,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  button: {
    backgroundColor: '#0078ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  linkButton: {
    alignItems: 'center',
    padding: 16,
  },
  linkText: {
    color: '#0078ff',
    fontSize: 16,
  },
});
