import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const PRIMARY = "#1F381F";

type Prefs = {
  darkMode: boolean;
  highContrast: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  activityReminders: boolean;
  showLocation: boolean;
  dataSharing: boolean;
  analyticsOptOut: boolean;
  hapticFeedback: boolean;
  soundEffects: boolean;
};

const DEFAULT_PREFS: Prefs = {
  darkMode: false,
  highContrast: false,
  pushNotifications: true,
  emailNotifications: true,
  activityReminders: true,
  showLocation: true,
  dataSharing: false,
  analyticsOptOut: false,
  hapticFeedback: true,
  soundEffects: true,
};

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { signOut } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("userPreferences");
        if (saved) setPrefs((p) => ({ ...p, ...JSON.parse(saved) }));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const update = async (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      await AsyncStorage.setItem("userPreferences", JSON.stringify(next));
      // mimic toast
    } catch (e) {
      Alert.alert("Error", "Failed to save setting");
    }
  };

  const clearCache = async () => {
    try {
      const saved = await AsyncStorage.getItem("userPreferences");
      await AsyncStorage.clear();
      if (saved) await AsyncStorage.setItem("userPreferences", saved);
      Alert.alert("Cache Cleared", "App cache has been cleared successfully.");
    } catch {
      Alert.alert("Error", "Failed to clear cache");
    }
  };

  const resetDefaults = async () => {
    try {
      setPrefs(DEFAULT_PREFS);
      await AsyncStorage.setItem(
        "userPreferences",
        JSON.stringify(DEFAULT_PREFS),
      );
      Alert.alert("Settings Reset", "All settings reset to default values.");
    } catch {
      Alert.alert("Error", "Failed to reset settings");
    }
  };

  const exportData = async () => {
    try {
      const profile = await AsyncStorage.getItem("userProfile");
      const payload = {
        preferences: prefs,
        profile: profile ? JSON.parse(profile) : {},
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };
      Alert.alert(
        "Data Export",
        JSON.stringify(payload, null, 2).slice(0, 400) +
          "...\n(Copy from logs)",
      );
      console.log("Data export:", payload);
    } catch {
      Alert.alert("Export Failed", "Unable to export data");
    }
  };

  const importData = async () => {
    Alert.alert("Import", "Import via file picker not available in demo");
  };

  const deleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This will sign you out and clear local data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await signOut();
              navigation.navigate("AuthLanding");
            } catch {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Theme & Display */}
        <Text style={styles.sectionTitle}>Theme & Display</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Dark Mode</Text>
          <Switch
            value={prefs.darkMode}
            onValueChange={(v) => update("darkMode", v)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>High Contrast</Text>
          <Switch
            value={prefs.highContrast}
            onValueChange={(v) => update("highContrast", v)}
          />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Push notifications</Text>
          <Switch
            value={prefs.pushNotifications}
            onValueChange={(v) => update("pushNotifications", v)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email notifications</Text>
          <Switch
            value={prefs.emailNotifications}
            onValueChange={(v) => update("emailNotifications", v)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Activity reminders</Text>
          <Switch
            value={prefs.activityReminders}
            onValueChange={(v) => update("activityReminders", v)}
          />
        </View>

        {/* Privacy */}
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Show location</Text>
          <Switch
            value={prefs.showLocation}
            onValueChange={(v) => update("showLocation", v)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Data sharing</Text>
          <Switch
            value={prefs.dataSharing}
            onValueChange={(v) => update("dataSharing", v)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Analytics opt-out</Text>
          <Switch
            value={prefs.analyticsOptOut}
            onValueChange={(v) => update("analyticsOptOut", v)}
          />
        </View>

        {/* App Behavior */}
        <Text style={styles.sectionTitle}>App Behavior</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Haptic feedback</Text>
          <Switch
            value={prefs.hapticFeedback}
            onValueChange={(v) => update("hapticFeedback", v)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sound effects</Text>
          <Switch
            value={prefs.soundEffects}
            onValueChange={(v) => update("soundEffects", v)}
          />
        </View>

        {/* Data Management */}
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.primary} onPress={exportData}>
          <Text style={styles.primaryText}>Export data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={importData}>
          <Text style={styles.secondaryText}>Import data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={clearCache}>
          <Text style={styles.secondaryText}>Clear cache</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={resetDefaults}>
          <Text style={styles.secondaryText}>Reset to default</Text>
        </TouchableOpacity>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={[styles.primary, { backgroundColor: "#ef4444" }]}
          onPress={deleteAccount}
        >
          <Text style={styles.primaryText}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => navigation.navigate("AllFeatures")}
        >
          <Text style={styles.link}>All Features</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => signOut()}>
          <Text style={styles.link}>Sign out</Text>
        </TouchableOpacity>
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
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  rowLabel: { color: "#111827" },
  primary: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondary: {
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryText: { color: PRIMARY, fontWeight: "700" },
  linkBtn: { paddingVertical: 12, alignItems: "center" },
  link: { color: "#111827", textDecorationLine: "underline" },
});
