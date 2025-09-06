import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const CLUBS = [
  {
    id: "oxford",
    name: "Oxford University Cycling Club",
    avatar:
      "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c?format=webp&width=200",
    blurb: "Rides, training, and events in Oxford.",
  },
  {
    id: "westway",
    name: "Westway Climbing Centre",
    avatar:
      "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fcce50dcf455a49d6aa9a7694c8a58f26?format=webp&width=200",
    blurb: "Bouldering and routes, all levels.",
  },
  {
    id: "richmond",
    name: "Richmond Runners",
    avatar:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
    blurb: "Community runs in Richmond Park.",
  },
];

export default function ClubsListScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your clubs & communities</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {CLUBS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.card}
            onPress={() => navigation.navigate("ClubDetails", { clubId: c.id })}
          >
            <Image source={{ uri: c.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{c.name}</Text>
              <Text style={styles.cardBlurb} numberOfLines={2}>
                {c.blurb}
              </Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.primary}>
                  <Text style={styles.primaryText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondary}>
                  <Text style={styles.secondaryText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  avatar: { width: 56, height: 56, borderRadius: 12, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardBlurb: { marginTop: 4, color: "#6B7280" },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  primary: {
    backgroundColor: "#1F381F",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondary: {
    borderColor: "#1F381F",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  secondaryText: { color: "#1F381F", fontWeight: "700" },
});
