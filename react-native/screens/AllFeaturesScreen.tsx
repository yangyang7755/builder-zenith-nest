import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const items: {
  section: string;
  links: {
    label: string;
    route?: { stack?: string; screen?: string };
    note?: string;
  }[];
}[] = [
  {
    section: "Core",
    links: [
      {
        label: "Explore (Home)",
        route: { stack: "Explore", screen: "ExploreMain" },
      },
      {
        label: "Activities",
        route: { stack: "Activities", screen: "ActivitiesMain" },
      },
      {
        label: "Create (Templates)",
        route: { stack: "Create", screen: "CreateTemplates" },
      },
      { label: "Profile", route: { stack: "Profile", screen: "ProfileMain" } },
    ],
  },
  {
    section: "Maps",
    links: [
      {
        label: "Map Activities",
        route: { stack: "Activities", screen: "MapActivities" },
      },
      {
        label: "Category Activities",
        route: { stack: "Activities", screen: "CategoryActivities" },
      },
    ],
  },
  {
    section: "Social",
    links: [
      { label: "Chat", note: "Planned: Chat list & room" },
      { label: "Followers", route: { stack: "Profile", screen: "Followers" } },
      { label: "Following", route: { stack: "Profile", screen: "Following" } },
      { label: "Saved", route: { stack: "Activities", screen: "Saved" } },
    ],
  },
  {
    section: "Clubs",
    links: [
      { label: "Clubs List", route: { stack: "Profile", screen: "ClubsList" } },
      {
        label: "Club Details",
        route: { stack: "Profile", screen: "ClubDetails" },
      },
      { label: "Club Management", note: "Planned" },
    ],
  },
  {
    section: "Other",
    links: [
      { label: "Partner Details", note: "Planned" },
      { label: "Car Share Details", note: "Planned" },
      { label: "Settings", route: { stack: "Profile", screen: "Settings" } },
    ],
  },
];

export default function AllFeaturesScreen() {
  const navigation = useNavigation<any>();

  const go = (route?: { stack?: string; screen?: string }, note?: string) => {
    if (!route) {
      Alert.alert("Coming soon", note || "Not implemented yet");
      return;
    }
    const parent = navigation.getParent?.();
    if (route.stack === "Profile") {
      // We're already in Profile stack; navigate internally
      if (route.screen) navigation.navigate(route.screen as never);
      else parent?.navigate("Profile" as never);
      return;
    }
    // Switch to another tab and optionally a nested screen
    parent?.navigate(
      route.stack as never,
      route.screen ? ({ screen: route.screen } as never) : undefined,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Features</Text>
        <Text style={styles.subtitle}>Quick links and parity checklist</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {items.map((group) => (
          <View key={group.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.section}</Text>
            {group.links.map((link) => (
              <TouchableOpacity
                key={link.label}
                style={styles.item}
                onPress={() => go(link.route, link.note)}
              >
                <Text style={styles.itemLabel}>{link.label}</Text>
                {link.note ? (
                  <Text style={styles.itemNote}>{link.note}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
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
  content: { padding: 16 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  item: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  itemLabel: { fontSize: 15, color: "#111827" },
  itemNote: { marginTop: 4, color: "#6B7280", fontSize: 12 },
});
