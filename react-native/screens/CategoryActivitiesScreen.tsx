import React from "react";
import { View, StyleSheet } from "react-native";
import CategoryActivities from "../components/CategoryActivities";
import { useActivities } from "../contexts/ActivitiesContext";

export default function CategoryActivitiesScreen() {
  const { activities } = useActivities();
  return (
    <View style={styles.container}>
      <CategoryActivities activities={activities} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
