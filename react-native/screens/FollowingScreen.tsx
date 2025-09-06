import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";

const USERS = [
  { id: '1', name: 'Coach Holly Peristiani', avatar: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=60&h=60&fit=crop&crop=face' },
  { id: '2', name: 'Maddie Wei', avatar: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=60&h=60&fit=crop&crop=face' },
];

export default function FollowingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}><Text style={styles.title}>Following</Text></View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {USERS.map(u => (
          <View key={u.id} style={styles.item}>
            <Image source={{ uri: u.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{u.name}</Text>
            <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>Unfollow</Text></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  item: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 10, marginBottom: 10, backgroundColor: '#fff' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  name: { flex: 1, fontSize: 15, color: '#111827' },
  btn: { backgroundColor: '#ef4444', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});
