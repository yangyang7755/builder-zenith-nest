import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import apiService from "../services/apiService";

export default function CreateActivityScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const type: string = route.params?.type || "General";

  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (!title.trim() || !location.trim()) {
      Alert.alert("Missing info", "Please fill title and location");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        location,
        date,
        time,
        type,
      };
      const res = await apiService.createActivity(payload);
      if ((res as any).error) throw new Error((res as any).error);
      Alert.alert("Created", "Your activity has been created", [
        {
          text: "OK",
          onPress: () => navigation.getParent()?.navigate("Activities"),
        },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create {type}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder={`e.g. ${type} session`}
          placeholderTextColor="#6B7280"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Richmond Park"
          placeholderTextColor="#6B7280"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.rowLabel}>Date & time (optional)</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#6B7280"
            value={date}
            onChangeText={setDate}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="HH:MM"
            placeholderTextColor="#6B7280"
            value={time}
            onChangeText={setTime}
          />
        </View>

        <TouchableOpacity
          style={[styles.primary, loading && { opacity: 0.6 }]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.primaryText}>
            {loading ? "Creating..." : "Create activity"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  back: { fontSize: 20, marginRight: 8 },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    color: "#111827",
    fontWeight: "600",
  },
  rowLabel: {
    marginTop: 12,
    marginBottom: 6,
    color: "#111827",
    fontWeight: "600",
  },
  input: {
    borderWidth: 2,
    borderColor: "#1F381F",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: "#1F381F",
  },
  row: { flexDirection: "row", gap: 8 },
  rowInput: { flex: 1 },
  primary: {
    backgroundColor: "#1F381F",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  primaryText: { color: "#fff", fontWeight: "700" },
});
