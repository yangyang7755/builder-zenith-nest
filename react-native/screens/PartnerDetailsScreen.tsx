import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function PartnerDetailsScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Partner</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1557169448-81bbe2b9741d?w=1200' }} style={styles.cover} />
        <View style={{ padding: 16 }}>
          <Text style={styles.h1}>Outdoor Partner</Text>
          <Text style={styles.subtitle}>Exclusive offers and events for Wildpals</Text>
          <TouchableOpacity style={styles.primary}><Text style={styles.primaryText}>Visit website</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  back: { fontSize: 20, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center' },
  cover: { width: '100%', height: 180 },
  h1: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { color: '#6B7280', marginBottom: 12 },
  primary: { backgroundColor: '#1F381F', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  primaryText: { color: '#fff', fontWeight: '700' },
});
