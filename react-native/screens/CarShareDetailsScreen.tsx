import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CarShareDetailsScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Car sharing for trips</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h1}>Trip to Peak District</Text>
        <Text style={styles.meta}>Leaving Sat 7am · 3 seats available</Text>
        <View style={styles.card}>
          <Text style={styles.item}>Pickup: Notting Hill Gate</Text>
          <Text style={styles.item}>Return: Sun evening</Text>
          <Text style={styles.item}>Cost share: £20 per person</Text>
        </View>
        <TouchableOpacity style={styles.primary}><Text style={styles.primaryText}>Request a seat</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  back: { fontSize: 20, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center' },
  h1: { fontSize: 22, fontWeight: '700', color: '#111827' },
  meta: { color: '#6B7280', marginTop: 4, marginBottom: 12 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12 },
  item: { color: '#111827', marginBottom: 6 },
  primary: { backgroundColor: '#1F381F', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  primaryText: { color: '#fff', fontWeight: '700' },
});
