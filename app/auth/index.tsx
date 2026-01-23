import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
} from "react-native";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle, sendPasswordReset, user } =
    useAuth();

  // Auto-navigate when user becomes authenticated
  useEffect(() => {
    if (user) {
      console.log("🚀 User authenticated, navigating to app...");
      setLoading(false);
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      console.log(`${isLogin ? "Signing in" : "Signing up"} user:`, email);

      if (isLogin) {
        await signIn(email, password);
        console.log("✅ Sign in successful");
      } else {
        await signUp(email, password, displayName);
        console.log("✅ Sign up successful");
      }

      // Don't manually navigate - let the auth state change handle it
      console.log("Waiting for auth state change...");

      // Set a timeout to reset loading state if navigation doesn't happen
      setTimeout(() => {
        console.log("⚠️ Auth completed, resetting loading state");
        setLoading(false);
      }, 3000);
    } catch (error: any) {
      console.error("❌ Auth error:", error);

      // Provide user-friendly error messages
      let errorMessage = error.message;
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }

      Alert.alert("Error", errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("❌ Google sign-in error:", error);
      Alert.alert("Error", "Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailToUse = resetEmail.trim() || email.trim();

    if (!emailToUse) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordReset(emailToUse);
      Alert.alert(
        "Success",
        "Password reset email sent! Check your inbox (and spam folder) for instructions.",
      );
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("❌ Password reset error:", error);

      let errorMessage = error.message;
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account exists with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many reset attempts. Please wait a few minutes and try again.";
      } else {
        errorMessage = "Unable to send reset email. Please try again.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      <View style={styles.contentWrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleContainer}>
            <View style={styles.titleText}>
              <Image
                source={require("@/assets/images/LL2020.png")}
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />

              <ThemedText type="title" style={styles.title}>
                ESL Exercises
              </ThemedText>
            </View>
            <ThemedText type="default" style={styles.subtitle}>
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(102, 102, 102, 0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="rgba(102, 102, 102, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete={isLogin ? "current-password" : "new-password"}
                textContentType={isLogin ? "password" : "newPassword"}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <IconSymbol
                  name={showPassword ? "eye" : "eye.slash"}
                  size={20}
                  color="#464655"
                />
              </TouchableOpacity>
            </View>

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={() => setShowForgotPassword(!showForgotPassword)}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {isLogin && showForgotPassword && (
              <View style={styles.forgotPasswordForm}>
                <Text style={styles.forgotPasswordInfo}>
                  Enter your email and we&apos;ll send you a password reset link
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(102, 102, 102, 0.5)"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                <View style={styles.forgotPasswordButtons}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleForgotPassword}
                    disabled={resetLoading}
                  >
                    <Text style={styles.resetButtonText}>
                      {resetLoading ? "Sending..." : "Send Reset Link"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                    }}
                    disabled={resetLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Display Name (optional)"
                placeholderTextColor="rgba(102, 102, 102, 0.5)"
                value={displayName}
                onChangeText={setDisplayName}
                autoComplete="name"
                textContentType="name"
              />
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Image
                source={require("@/assets/images/google.png")}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.linkText}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafbfc",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fafbfc",
  },
  titleContainer: {
    marginBottom: 40,
  },
  titleText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    textAlign: "center",
    paddingBottom: 10,
    marginRight: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    gap: 16,
    marginTop: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "rgba(105, 150, 179, 0.2)",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
    boxShadow: "inset 0px 1px 3px rgba(0, 76, 109, 0.04)",
  },
  passwordContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "rgba(105, 150, 179, 0.2)",
    padding: 16,
    paddingRight: 50,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
    boxShadow: "inset 0px 1px 3px rgba(0, 76, 109, 0.04)",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  button: {
    backgroundColor: "#6996b3",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    boxShadow:
      "0px 2px 8px rgba(83, 131, 161, 0.3), 0px 8px 16px rgba(83, 131, 161, 0.15)",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#666",
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(105, 150, 179, 0.2)",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    boxShadow: "0px 1px 3px rgba(0, 76, 109, 0.08)",
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "400",
  },
  linkButton: {
    alignItems: "center",
    padding: 12,
  },
  linkText: {
    color: "#6996b3",
    fontSize: 16,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    padding: 12,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: "#6996b3",
    fontSize: 14,
    fontWeight: "400",
  },
  forgotPasswordForm: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(105, 150, 179, 0.2)",
  },
  forgotPasswordInfo: {
    fontSize: 14,
    color: "#464655",
    lineHeight: 20,
  },
  forgotPasswordButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#6996b3",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    boxShadow: "0px 2px 8px rgba(83, 131, 161, 0.3)",
  },
  resetButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "400",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(105, 150, 179, 0.3)",
  },
  cancelButtonText: {
    color: "#6996b3",
    fontSize: 15,
    fontWeight: "400",
  },
});
