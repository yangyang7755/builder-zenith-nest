import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const CLUB_META: Record<string, { name: string; cover: string; about: string }> = {
  oxford: {
    name: "Oxford University Cycling Club",
    cover: "https://images.unsplash.com/photo-1520975922284-8b456906c813?w=1200",
    about: "Weekly training rides, social spins, and race squad.",
  },
  westway: {
    name: "Westway Climbing Centre",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200",
    about: "Routes, bouldering, coaching and community events.",
  },
  richmond: {
    name: "Richmond Runners",
    cover: "https://images.unsplash.com/photo-1542718610-a1d656d1884a?w=1200",
    about: "All paces welcome; sessions throughout the week.",
  },
};

export default function ClubDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const clubId: string = route.params?.clubId || 'oxford';
  const meta = CLUB_META[clubId] || CLUB_META.oxford;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>{meta.name}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <Image source={{ uri: meta.cover }} style={styles.cover} />
        <View style={{ padding: 16 }}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.about}>{meta.about}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.primary} onPress={() => navigation.getParent()?.navigate('Chat' as never)}>
              <Text style={styles.primaryText}>Open Club Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondary}>
              <Text style={styles.secondaryText}>Join Club</Text>
            </TouchableOpacity>
          </View>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  about: { color: '#6B7280', marginBottom: 12 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primary: { backgroundColor: '#1F381F', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { borderColor: '#1F381F', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  secondaryText: { color: '#1F381F', fontWeight: '700' },
});
