import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get("window");

const AuthLandingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleSkip = () => {
    // Navigate to explore screen
    navigation.navigate("Explore" as never);
  };

  const handleSignUp = () => {
    // Navigate to sign up screen
    navigation.navigate("SignUp" as never);
  };

  const handleLogin = () => {
    // Navigate to login screen
    navigation.navigate("Login" as never);
  };

  const handleAppleSignIn = () => {
    // Match web behavior: route to Login for now
    navigation.navigate("Login" as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

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
        </View>

        {/* Get Started Text */}
        <Text style={styles.getStartedText}>Get started...</Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Sign up with Email Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign up with Email</Text>
          </TouchableOpacity>

          {/* Continue with Apple Button */}
          <TouchableOpacity
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          >
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLinkButton}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Logo */}
        <View style={styles.bottomLogoContainer}>
          <Text style={styles.bottomLogoText}>Wildpals</Text>
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
  skipContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  skipText: {
    fontSize: 14,
    color: "#6B7280",
    textDecorationLine: "underline",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
    paddingVertical: 64,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 48,
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
  getStartedText: {
    fontSize: 24,
    color: "#000000",
    textAlign: "center",
    marginBottom: 48,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 320,
    gap: 16,
  },
  signUpButton: {
    backgroundColor: "#1F381F", // explore-green color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
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
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
  },
  loginLinkText: {
    color: "#000000",
    fontSize: 16,
  },
  loginLinkButton: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  bottomLogoContainer: {
    marginTop: 64,
  },
  bottomLogoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
});

export default AuthLandingScreen;
