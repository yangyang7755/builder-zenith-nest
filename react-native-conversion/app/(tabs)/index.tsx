import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router } from "expo-router";

// Import shared logic
import {
  formatActivityDate,
  calculateDistance,
  getActivityEmoji,
} from "../../src/shared/utils";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../../src/shared/constants";
import type { Activity, FilterOptions } from "../../src/shared/types";

const { width: screenWidth } = Dimensions.get("window");

// Mock data matching your web version exactly
const LOCATION_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  "westway climbing centre": { lat: 51.52, lng: -0.2375 },
  "richmond park": { lat: 51.4545, lng: -0.2727 },
  "stanage edge": { lat: 53.3403, lng: -1.6286 },
  oxford: { lat: 51.752, lng: -1.2577 },
  london: { lat: 51.5074, lng: -0.1278 },
  "peak district": { lat: 53.3403, lng: -1.6286 },
  "hampstead heath": { lat: 51.5557, lng: -0.1657 },
  "regents park": { lat: 51.5268, lng: -0.1554 },
};

const partnerRequests = [
  {
    id: "1",
    title: "Looking for a belay partner...",
    name: "Sarah K.",
    age: 28,
    climbingLevel: "5.9-5.11",
    date: "📅 Friday evenings",
    location: "📍 Westway Climbing Centre",
    description:
      "Looking for a regular climbing partner for Friday evening sessions. I'm working on lead climbing and could use someone experienced.",
    availability: "Fridays 6-9pm",
    experience: "2 years indoor, 6 months outdoor",
    imageSrc:
      "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "2",
    title: "Climbing buddy needed!",
    name: "Alex M.",
    age: 35,
    climbingLevel: "V4-V6 Bouldering",
    date: "📅 Monday evenings",
    location: "📍 The Castle Climbing Centre",
    description:
      "Experienced boulderer looking for motivation and someone to work projects with. Happy to share beta and spot!",
    availability: "Monday & Wednesday 7-10pm",
    experience: "5 years climbing, love outdoor bouldering",
    imageSrc:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  },
];

const myClubs = [
  {
    id: "westway",
    name: "Westway climbing gym",
    src: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fcce50dcf455a49d6aa9a7694c8a58f26?format=webp&width=800",
    isMember: true,
  },
  {
    id: "oxford-cycling",
    name: "Oxford university cycling club",
    src: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c?format=webp&width=800",
    isMember: true,
  },
];

const discoverClubs = [
  {
    id: "rapha-cycling",
    name: "Rapha Cycling Club London",
    src: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F88bca9c7cd744a57bb7cf584dcc74c21?format=webp&width=800",
    isMember: false,
  },
  {
    id: "vauxwall-climbing",
    name: "VauxWall East Climbing Centre",
    src: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fce3624672f324cdbb888f18e32d8b72d?format=webp&width=800",
    isMember: false,
  },
];

const carShares = [
  {
    id: "peak-district",
    destination: "Peak District",
    date: "📅 10 August 2025",
    time: "7:00 AM",
    driver: "Mike Johnson",
    availableSeats: 3,
    cost: "£15 per person",
    imageSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "snowdonia",
    destination: "Snowdonia",
    date: "📅 17 August 2025",
    time: "6:00 AM",
    driver: "Sarah Chen",
    availableSeats: 2,
    cost: "£25 per person",
    imageSrc:
      "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
  },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(
    "Notting hill, London",
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [filters, setFilters] = useState<FilterOptions>({
    activityType: [
      "Cycling",
      "Climbing",
      "Running",
      "Hiking",
      "Skiing",
      "Surfing",
      "Tennis",
      "General",
    ],
    numberOfPeople: { min: 1, max: 50 },
    location: "",
    locationRange: 10,
    date: { start: "", end: "" },
    gender: [],
    age: { min: 16, max: 80 },
    gear: [],
    pace: { min: 0, max: 100 },
    distance: { min: 0, max: 200 },
    elevation: { min: 0, max: 5000 },
    clubOnly: false,
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.activityType.length < 8) count++; // Not showing all types
    if (filters.location) count++;
    if (filters.date.start || filters.date.end) count++;
    if (filters.gender.length > 0) count++;
    if (filters.gear.length > 0) count++;
    if (filters.clubOnly) count++;
    return count;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Status Bar Component (matching web exactly)
  const StatusBar = () => (
    <View style={styles.statusBar}>
      <Text style={styles.statusTime}>9:41</Text>
      <View style={styles.statusIcons}>
        <View style={styles.signalBars}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={[styles.signalBar, { height: 6 + i * 2 }]} />
          ))}
        </View>
        <View style={styles.batteryIcon}>
          <View style={styles.batteryBody} />
          <View style={styles.batteryTip} />
        </View>
      </View>
    </View>
  );

  // Header Component (matching web exactly)
  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Explore!</Text>

      {/* Backend Status Indicator (matching web) */}
      <View style={styles.statusIndicator}>
        {loading ? (
          <>
            <View style={[styles.statusDot, styles.statusLoading]} />
            <Text style={styles.statusText}>Loading activities...</Text>
          </>
        ) : error ? (
          <>
            <View style={[styles.statusDot, styles.statusError]} />
            <Text style={[styles.statusText, styles.statusErrorText]}>
              Backend connection failed
            </Text>
            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={[styles.statusDot, styles.statusConnected]} />
            <Text style={styles.statusText}>Connected to backend</Text>
          </>
        )}
      </View>
    </View>
  );

  // Location Selector (matching web exactly)
  const LocationSelector = () => (
    <TouchableOpacity
      onPress={() => setShowLocationModal(true)}
      style={styles.locationSelector}
    >
      <Text style={styles.locationIcon}>📍</Text>
      <View style={styles.locationInfo}>
        <Text style={styles.locationLabel}>Chosen location</Text>
        <Text style={styles.locationValue}>{currentLocation}</Text>
      </View>
      <Text style={styles.chevronDown}>⌄</Text>
    </TouchableOpacity>
  );

  // Filter Bar (matching web exactly)
  const FilterBar = () => (
    <View style={styles.filterBar}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#6B7280"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      <TouchableOpacity
        onPress={() => setShowFilterModal(true)}
        style={styles.filterButton}
      >
        <Text style={styles.filterIcon}>⚙️</Text>
        <Text style={styles.filterText}>Filter</Text>
        {getActiveFilterCount() > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Map Button */}
      <TouchableOpacity
        onPress={() => setShowMapView(true)}
        style={styles.mapButton}
      >
        <Text style={styles.mapIcon}>📍</Text>
        <Text style={styles.mapText}>Map</Text>
      </TouchableOpacity>
    </View>
  );

  // Activity Type Tags (matching web exactly)
  const ActivityTypeTags = () => (
    <View style={styles.activityTags}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
      >
        {["Cycling", "Climbing", "Running", "Hiking"].map((type) => (
          <View key={type} style={styles.tag}>
            <Text style={styles.tagText}>{type}</Text>
            <TouchableOpacity style={styles.tagClose}>
              <Text style={styles.tagCloseIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Partner Request Card (matching web exactly)
  const PartnerRequestCard = ({ partner }: { partner: any }) => (
    <View style={styles.partnerCard}>
      <Text style={styles.partnerTitle} numberOfLines={2}>
        {partner.title}
      </Text>
      <View style={styles.partnerInfo}>
        <Image source={{ uri: partner.imageSrc }} style={styles.partnerImage} />
        <View style={styles.partnerDetails}>
          <Text style={styles.partnerName}>{partner.name}</Text>
          <Text style={styles.partnerAge}>Age {partner.age}</Text>
          <Text style={styles.partnerLevel}>{partner.climbingLevel}</Text>
          <Text style={styles.partnerDate}>{partner.date}</Text>
          <Text style={styles.partnerLocation}>{partner.location}</Text>
        </View>
      </View>
      <Text style={styles.partnerDescription} numberOfLines={3}>
        {partner.description}
      </Text>
      <TouchableOpacity style={styles.partnerButton}>
        <Text style={styles.partnerButtonText}>Request to join</Text>
      </TouchableOpacity>
    </View>
  );

  // Club Logo Component (matching web exactly)
  const ClubLogo = ({ club }: { club: any }) => (
    <TouchableOpacity style={styles.clubLogo}>
      <Image source={{ uri: club.src }} style={styles.clubImage} />
    </TouchableOpacity>
  );

  // Car Share Card (matching web exactly)
  const CarShareCard = ({ carShare }: { carShare: any }) => (
    <View style={styles.carShareCard}>
      <Text style={styles.carShareDestination}>{carShare.destination}</Text>
      <Text style={styles.carShareDate}>{carShare.date}</Text>
      <Text style={styles.carShareTime}>{carShare.time}</Text>
      <View style={styles.carShareDriver}>
        <Image source={{ uri: carShare.imageSrc }} style={styles.driverImage} />
        <Text style={styles.driverName}>{carShare.driver}</Text>
      </View>
      <Text style={styles.carShareSeats}>
        {carShare.availableSeats} seats available
      </Text>
      <Text style={styles.carShareCost}>{carShare.cost}</Text>
      <TouchableOpacity style={styles.carShareButton}>
        <Text style={styles.carShareButtonText}>Request Seat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Header />
          <LocationSelector />
          <FilterBar />
          <ActivityTypeTags />

          {/* Recent Activities Section (matching web exactly) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent activities nearby</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Empty State (matching web exactly) */}
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Change filters to see more activities...
              </Text>
            </View>

            <View style={styles.createActivityContainer}>
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>Create Activity</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Partner Requests Section (matching web exactly) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Partner requests</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {partnerRequests.map((partner) => (
                <PartnerRequestCard key={partner.id} partner={partner} />
              ))}
            </ScrollView>
          </View>

          {/* My Clubs Section (matching web exactly) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your clubs & communities</Text>
            <View style={styles.clubsContainer}>
              {myClubs.map((club) => (
                <ClubLogo key={club.id} club={club} />
              ))}
            </View>
          </View>

          {/* Discover More Clubs Section (matching web exactly) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discover local clubs</Text>
            <View style={styles.clubsContainer}>
              {discoverClubs.map((club) => (
                <ClubLogo key={club.id} club={club} />
              ))}
            </View>
            <Text style={styles.clubsNote}>
              Request to join clubs to see their activities and events
            </Text>
          </View>

          {/* Car Sharing Section (matching web exactly) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Car sharing for trips</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {carShares.map((carShare) => (
                <CarShareCard key={carShare.id} carShare={carShare} />
              ))}
            </ScrollView>
            <Text style={styles.clubsNote}>
              Share transport costs and meet fellow adventurers
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModal}>
            <Text style={styles.modalTitle}>Choose Location</Text>
            <Text style={styles.modalSubtitle}>
              Select your preferred location for finding activities
            </Text>
            {/* Location options would go here */}
            <TouchableOpacity
              onPress={() => setShowLocationModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusBar: {
    height: 44,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  statusTime: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  signalBars: {
    flexDirection: "row",
    gap: 2,
  },
  signalBar: {
    width: 4,
    backgroundColor: COLORS.text,
    borderRadius: 1,
  },
  batteryIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryBody: {
    width: 22,
    height: 10,
    borderWidth: 1,
    borderColor: COLORS.text,
    borderRadius: 2,
  },
  batteryTip: {
    width: 2,
    height: 4,
    backgroundColor: COLORS.text,
    borderRadius: 1,
    marginLeft: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLoading: {
    backgroundColor: COLORS.warning,
  },
  statusError: {
    backgroundColor: COLORS.error,
  },
  statusConnected: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusErrorText: {
    color: COLORS.error,
  },
  retryButton: {
    marginLeft: 8,
  },
  retryText: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 24,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
  },
  locationIcon: {
    fontSize: 24,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.text,
  },
  locationValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  chevronDown: {
    fontSize: 20,
    color: COLORS.text,
  },
  filterBar: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.text,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  filterButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.text,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: "bold",
  },
  mapButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mapIcon: {
    fontSize: 16,
  },
  mapText: {
    fontSize: 14,
    color: COLORS.textInverse,
  },
  activityTags: {
    marginBottom: 24,
  },
  tagsContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  tag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: "500",
  },
  tagClose: {
    padding: 2,
  },
  tagCloseIcon: {
    color: COLORS.textInverse,
    fontSize: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.text,
    textDecorationLine: "underline",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  createActivityContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: "500",
  },
  horizontalScroll: {
    paddingRight: 16,
    gap: 8,
  },
  partnerCard: {
    width: 288,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  partnerInfo: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  partnerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  partnerAge: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  partnerLevel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  partnerDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  partnerLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  partnerDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
  },
  partnerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  partnerButtonText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: "500",
  },
  clubsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  clubLogo: {
    width: 70,
    height: 70,
  },
  clubImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  clubsNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  carShareCard: {
    width: 200,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
  },
  carShareDestination: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  carShareDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  carShareTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  carShareDriver: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  driverImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  driverName: {
    fontSize: 14,
    color: COLORS.text,
  },
  carShareSeats: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  carShareCost: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
    marginBottom: 12,
  },
  carShareButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  carShareButtonText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  locationModal: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
