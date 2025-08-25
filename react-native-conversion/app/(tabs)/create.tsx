import { View, Text, StyleSheet } from 'react-native';

export default function Create() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Activity</Text>
      <Text style={styles.subtitle}>Coming Soon!</Text>
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
    textAlign: 'center',
  },
});
