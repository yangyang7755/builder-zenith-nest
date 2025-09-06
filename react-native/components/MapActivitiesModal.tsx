import React, { useEffect, useMemo, useRef, useState } from "react";
import React, { useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";

interface Activity {
  id: string;
  title: string;
  type?: string;
  activity_type?: string;
  location: string;
  date?: string;
  time?: string;
  organizerName?: string;
  organizer?: { id?: string; full_name?: string } | null;
  coordinates?: { lat: number; lng: number };
}

interface Props {
  activities: Activity[];
  onClose: () => void;
  onSelect?: (activity: Activity) => void;
}

const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 }; // London

const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "westway climbing centre": { lat: 51.52, lng: -0.2375 },
  "richmond park": { lat: 51.4545, lng: -0.2727 },
  "stanage edge": { lat: 53.3403, lng: -1.6286 },
  oxford: { lat: 51.752, lng: -1.2577 },
  london: { lat: 51.5074, lng: -0.1278 },
  "peak district": { lat: 53.3403, lng: -1.6286 },
  "hampstead heath": { lat: 51.5557, lng: -0.1657 },
  "regents park": { lat: 51.5268, lng: -0.1554 },
};

const { height: screenH } = Dimensions.get("window");

export default function MapActivitiesModal({ activities, onClose, onSelect }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<View>(null);
  const mapHeight = Math.min(screenH * 0.6, 520);

  // Add coordinates to activities if not present
  const activitiesWithCoords = useMemo(() => {
    return activities.map((a, i) => {
      if (a.coordinates) return a;
      const key = Object.keys(LOCATION_COORDINATES).find((k) => a.location?.toLowerCase().includes(k));
      const jitter = (n: number) => (Math.random() - 0.5) * n;
      const coords = key
        ? LOCATION_COORDINATES[key]
        : { lat: DEFAULT_CENTER.lat + jitter(0.08), lng: DEFAULT_CENTER.lng + jitter(0.12) };
      return { ...a, coordinates: coords };
    });
  }, [activities]);

  // Compute map bounds
  const bounds = useMemo(() => {
    const coords = activitiesWithCoords.map((a) => a.coordinates!).filter(Boolean);
    if (!coords.length) {
      return {
        north: DEFAULT_CENTER.lat + 0.05,
        south: DEFAULT_CENTER.lat - 0.05,
        east: DEFAULT_CENTER.lng + 0.08,
        west: DEFAULT_CENTER.lng - 0.08,
      };
    }
    const lats = coords.map((c) => c.lat);
    const lngs = coords.map((c) => c.lng);
    const padLat = 0.02;
    const padLng = 0.03;
    return {
      north: Math.max(...lats) + padLat,
      south: Math.min(...lats) - padLat,
      east: Math.max(...lngs) + padLng,
      west: Math.min(...lngs) - padLng,
    };
  }, [activitiesWithCoords]);

  // Convert lat/lng to pixel inside the map
  const latLngToPixel = (lat: number, lng: number, w: number, h: number) => {
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * w;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * h;
    return { x, y };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Map</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Map area */}
      <View style={[styles.map, { height: mapHeight }]} ref={mapRef}>
        {/* Simple map background */}
        <View style={styles.gridRow} />
        <View style={[styles.gridRow, { top: "25%" }]} />
        <View style={[styles.gridRow, { top: "50%" }]} />
        <View style={[styles.gridRow, { top: "75%" }]} />
        <View style={[styles.gridCol, { left: "25%" }]} />
        <View style={[styles.gridCol, { left: "50%" }]} />
        <View style={[styles.gridCol, { left: "75%" }]} />

        {/* Markers overlay */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {activitiesWithCoords.map((a) => {
            const w = Dimensions.get("window").width;
            const h = mapHeight;
            const { x, y } = latLngToPixel(a.coordinates!.lat, a.coordinates!.lng, w, h);
            const selected = selectedId === a.id;
            const type = (a.type || a.activity_type || "").toLowerCase();
            const emoji =
              type === "cycling" ? "🚴" :
              type === "running" ? "👟" :
              type === "climbing" ? "🧗" :
              type === "hiking" ? "🥾" :
              type === "tennis" ? "🎾" :
              type === "skiing" ? "⛷️" :
              type === "surfing" ? "🏄" : "📍";
            return (
              <TouchableOpacity
                key={a.id + "-btn"}
                onPress={() => {
                  setSelectedId(a.id);
                  onSelect?.(a);
                }}
                style={[
                  styles.point,
                  {
                    left: Math.max(12, Math.min(w - 12, x)),
                    top: Math.max(12, Math.min(h - 12, y)),
                    transform: [{ translateX: -10 }, { translateY: -10 }, { scale: selected ? 1.25 : 1 }],
                    backgroundColor: selected ? "#1F381F" : "#222",
                  },
                ]}
              >
                <Text style={styles.pointText}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Swipeable cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
        {activities.map((a) => (
          <TouchableOpacity key={a.id} style={styles.card} onPress={() => setSelectedId(a.id)}>
            <Text style={styles.cardTitle} numberOfLines={1}>{a.title}</Text>
            {!!a.date && <Text style={styles.cardMeta}>📅 {a.date}</Text>}
            <Text style={styles.cardMeta}>📍 {a.location}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {a.organizer?.full_name || a.organizerName || "Community"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerBtnText: { fontSize: 18 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  map: { width: "100%", backgroundColor: "#E8F3EA", overflow: "hidden" },
  gridRow: { position: "absolute", left: 0, right: 0, top: 0, height: 1, backgroundColor: "#cfe3d3" },
  gridCol: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "#cfe3d3" },
  markerWrapper: { position: "absolute" },
  markerPositioner: { position: "absolute" },
  point: { position: "absolute", width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pointText: { fontSize: 12, color: "#fff" },
  cards: { paddingVertical: 10, paddingHorizontal: 8 },
  card: { width: 240, marginRight: 10, backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 4 },
  cardMeta: { fontSize: 12, color: "#6B7280" },
});
