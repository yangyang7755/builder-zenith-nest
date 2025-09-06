import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

const FILTERS = ["All", "Unread", "Clubs", "Requests", "Following"] as const;

const CLUBS = [
  { id: "oxford-cycling", name: "Oxford University Cycling Club", last: "Training ride tomorrow! Meet at Radcliffe Camera 7am", unread: false },
  { id: "westway-climbing", name: "Westway Climbing Centre", last: "New routes set this week! Come check them out 🧗‍♀️", unread: true },
];

const DMS = [
  { id: "coach-holly", name: "Coach Holly Peristiani", last: "Great progress this week!", unread: false },
  { id: "dan-smith", name: "Dan Smith", last: "Let’s climb Sat?", unread: true },
];

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const [active, setActive] = React.useState<(typeof FILTERS)[number]>("All");

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
        <Text style={styles.title}>Chat!</Text>
        <Text style={styles.subtitle}>● Real-time connected</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[styles.chip, active === f && styles.chipActive]} onPress={() => setActive(f)}>
            <Text style={[styles.chipText, active === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.sectionTitle}>Club Chats</Text>
        {CLUBS.map(c => (
          <TouchableOpacity key={c.id} style={styles.item} onPress={() => navigation.navigate("ChatRoom", { clubId: c.id })}>
            <Text style={styles.itemTitle}>{c.name}</Text>
            <Text style={styles.itemLast} numberOfLines={1}>{c.last}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Direct Messages</Text>
        {DMS.map(m => (
          <TouchableOpacity key={m.id} style={styles.item} onPress={() => navigation.navigate("ChatRoom", { userId: m.id })}>
            <Text style={styles.itemTitle}>{m.name}</Text>
            <Text style={styles.itemLast} numberOfLines={1}>{m.last}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  title: { fontSize: 28, fontWeight: "700", color: "#1F381F" },
  subtitle: { marginTop: 4, fontSize: 12, color: "#10B981" },
  filters: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff", marginRight: 8 },
  chipActive: { backgroundColor: "#1F381F", borderColor: "#1F381F" },
  chipText: { color: "#111827" },
  chipTextActive: { color: "#fff" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginBottom: 8 },
  item: { padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, marginBottom: 10, backgroundColor: "#fff" },
  itemTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  itemLast: { marginTop: 4, fontSize: 13, color: "#6B7280" },
});
