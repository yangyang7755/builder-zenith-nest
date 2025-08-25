import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function AuthLanding() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Wildpals</Text>
      <Text style={styles.subtitle}>Connect with outdoor enthusiasts</Text>
      
      <Link href="/(auth)/signup" style={styles.button}>
        <Text style={styles.buttonText}>Sign up with Email</Text>
      </Link>
      
      <Link href="/(auth)/login" style={styles.button}>
        <Text style={styles.buttonText}>Continue with Apple</Text>
      </Link>
      
      <Link href="/(tabs)">
        <Text style={styles.skipText}>Skip</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1F381F',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  skipText: {
    color: '#666',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
