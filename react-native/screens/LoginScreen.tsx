import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const { width: screenWidth } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { user, error } = await signIn(email, password);

      if (error) {
        Alert.alert("Login Failed", error.message || "Invalid credentials");
        return;
      }

      if (user) {
        // Navigate to main app
        navigation.navigate("MainTabs" as never);
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "Password reset functionality coming soon!");
  };

  const handleAppleSignIn = () => {
    Alert.alert("Apple Sign In", "Apple Sign In functionality coming soon!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F9e47fe83fd834e79a57361f8a278d9a9?format=webp&width=800",
              }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandText}>Wildpals</Text>
        </View>

        {/* Welcome Back Title */}
        <Text style={styles.welcomeTitle}>Welcome Back</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="#1F381F"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor="#1F381F"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>Show</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Logging in..." : "Log in"}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <Text style={styles.dividerText}>or</Text>
          </View>

          {/* Continue with Apple */}
          <TouchableOpacity
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          >
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    maxWidth: 428, // Mobile width constraint like web
    alignSelf: "center",
    width: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 64,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 128,
    height: 128,
    marginBottom: 24,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  brandText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 40,
    color: "#000000",
    textAlign: "center",
    marginBottom: 48,
  },
  formContainer: {
    width: "100%",
    maxWidth: 320,
    gap: 16,
  },
  inputContainer: {
    position: "relative",
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#1F381F", // explore-green color
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 16,
    color: "#1F381F", // explore-green color
  },
  passwordInput: {
    paddingRight: 64, // Make room for show button
  },
  showPasswordButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }], // Half of text height for centering
  },
  showPasswordText: {
    color: "#000000",
    opacity: 0.55,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#1F381F", // explore-green color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
  },
  forgotPasswordContainer: {
    alignItems: "center",
    paddingTop: 16,
  },
  forgotPasswordText: {
    color: "#000000",
    fontSize: 16,
  },
  dividerContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  dividerText: {
    color: "#9CA3AF", // gray-400
    fontSize: 16,
  },
  appleButton: {
    borderWidth: 2,
    borderColor: "#1F381F", // explore-green color
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  appleButtonText: {
    color: "#1F381F", // explore-green color
    fontSize: 16,
    fontWeight: "400",
  },
});

export default LoginScreen;
