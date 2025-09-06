import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";

const USERS = [
  { id: '1', name: 'Maggie Chang', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face', following: true },
  { id: '2', name: 'Dan Smith', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face', following: false },
];

export default function FollowersScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}><Text style={styles.title}>Followers</Text></View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {USERS.map(u => (
          <View key={u.id} style={styles.item}>
            <Image source={{ uri: u.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{u.name}</Text>
            <TouchableOpacity style={[styles.btn, u.following ? styles.btnSecondary : styles.btnPrimary]}>
              <Text style={u.following ? styles.btnSecondaryText : styles.btnPrimaryText}>{u.following ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
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
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  btnPrimary: { backgroundColor: '#1F381F' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnSecondary: { borderWidth: 1, borderColor: '#1F381F' },
  btnSecondaryText: { color: '#1F381F', fontWeight: '700' },
});
