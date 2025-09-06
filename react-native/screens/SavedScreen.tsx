import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SAVED: { id: string; title: string; meta: string }[] = [];

export default function SavedScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Saved</Text></View>
      {SAVED.length === 0 ? (
        <View style={styles.empty}> 
          <Text style={styles.emptyText}>No activities yet</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => navigation.getParent()?.navigate('Create')}>
            <Text style={styles.createBtnText}>Create Activity</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {SAVED.map((a) => (
            <View key={a.id} style={styles.card}>
              <Text style={styles.cardTitle}>{a.title}</Text>
              <Text style={styles.cardMeta}>{a.meta}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#6B7280', marginBottom: 12 },
  createBtn: { backgroundColor: '#1F381F', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  createBtnText: { color: '#fff', fontWeight: '700' },
  card: { padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta: { marginTop: 4, color: '#6B7280' },
});
