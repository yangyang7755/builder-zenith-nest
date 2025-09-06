import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { MainTabParamList } from "../App";

const TEMPLATES = [
  { key: "cycling", label: "Cycling" },
  { key: "running", label: "Running" },
  { key: "climbing", label: "Climbing" },
  { key: "hiking", label: "Hiking" },
  { key: "tennis", label: "Tennis" },
  { key: "surfing", label: "Surfing" },
  { key: "skiing", label: "Skiing" },
  { key: "yoga", label: "Yoga" },
  { key: "football", label: "Football" },
];

export default function CreateTemplatesScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Activity</Text>
        <Text style={styles.subtitle}>Choose a template to start</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {TEMPLATES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={styles.card}
            onPress={() => {
              navigation.navigate(
                "CreateActivity" as never,
                { type: t.label } as never,
              );
            }}
          >
            <Text style={styles.cardEmoji}>🏷️</Text>
            <Text style={styles.cardLabel}>{t.label}</Text>
            <Text style={styles.cardHint}>
              Start a {t.label.toLowerCase()} activity
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 4, color: "#6B7280" },
  grid: { padding: 16, flexDirection: "row", flexWrap: "wrap" },
  card: {
    width: "47%",
    marginRight: "6%",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardEmoji: { fontSize: 24, marginBottom: 8 },
  cardLabel: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardHint: { marginTop: 2, color: "#6B7280", fontSize: 12 },
});
