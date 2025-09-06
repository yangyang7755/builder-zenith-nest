import React from "react";
import { View, StyleSheet } from "react-native";
import MapActivitiesModal from "../components/MapActivitiesModal";
import { useActivities } from "../contexts/ActivitiesContext";
import { useNavigation } from "@react-navigation/native";

export default function MapActivitiesScreen() {
  const { activities } = useActivities();
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <MapActivitiesModal activities={activities} onClose={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
