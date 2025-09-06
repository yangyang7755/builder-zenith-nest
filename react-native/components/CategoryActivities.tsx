import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import {
  designTokens,
  commonStyles,
  getColor,
  getShadow,
} from "../styles/designTokens";

const { width } = Dimensions.get("window");

interface Activity {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  organizer: string | { full_name: string };
  description?: string;
  participants?: number;
  maxParticipants?: number;
  difficulty?: string;
  distance?: string;
  image?: string;
}

interface Props {
  activities: Activity[];
}

export default function CategoryActivities({ activities = [] }: Props) {
  const navigation = useNavigation();
  const route = useRoute();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "date" | "popularity" | "distance" | "difficulty"
  >("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced activity data for demo
  const enhancedActivities = useMemo(
    () => [
      ...activities,
      {
        id: "demo-morning-run-1",
        title: "Richmond Park 5K Morning Run",
        type: "running",
        date: "2024-12-27",
        time: "07:00",
        location: "Richmond Park, London",
        organizer: "Richmond Running Club",
        description:
          "Join us for an energizing morning run through the beautiful Richmond Park. Perfect for all fitness levels!",
        participants: 12,
        maxParticipants: 20,
        difficulty: "Beginner",
        distance: "5km",
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      },
      {
        id: "demo-cycling-3",
        title: "Thames Path Leisure Ride",
        type: "cycling",
        date: "2024-12-29",
        time: "10:00",
        location: "Thames Path, London",
        organizer: "Thames Cyclists",
        description:
          "Scenic riverside cycling with photography stops. Family-friendly pace through historic London.",
        participants: 15,
        maxParticipants: 25,
        difficulty: "Beginner",
        distance: "20km",
        image:
          "https://images.unsplash.com/photo-1517654443271-11c621d19e60?w=400&h=300&fit=crop",
      },
      {
        id: "demo-tennis-5",
        title: "Doubles Tournament Prep",
        type: "tennis",
        date: "2024-12-31",
        time: "16:00",
        location: "Queen's Club, London",
        organizer: "London Tennis Academy",
        description:
          "Practice doubles strategies and techniques. Coaching included with professional instructor.",
        participants: 6,
        maxParticipants: 8,
        difficulty: "Intermediate",
        image:
          "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop",
      },
    ],
    [activities],
  );

  const [filteredActivities, setFilteredActivities] =
    useState(enhancedActivities);

  // Filter and sort logic
  useEffect(() => {
    let filtered = enhancedActivities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((activity) => {
        const organizerName =
          typeof activity.organizer === "string"
            ? activity.organizer
            : activity.organizer?.full_name || "";

        return (
          activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Time filter
    if (selectedFilter !== "all") {
      const now = new Date();
      const today = new Date().toISOString().split("T")[0];

      switch (selectedFilter) {
        case "today":
          filtered = filtered.filter((activity) =>
            activity.date.startsWith(today),
          );
          break;
        case "week":
          const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(
            (activity) =>
              new Date(activity.date) <= nextWeek &&
              new Date(activity.date) >= now,
          );
          break;
      }
    }

    // Sort
    switch (sortBy) {
      case "date":
        filtered = filtered.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        break;
      case "popularity":
        filtered = filtered.sort(
          (a, b) => (b.participants || 0) - (a.participants || 0),
        );
        break;
    }

    setFilteredActivities(filtered);
  }, [enhancedActivities, searchTerm, selectedFilter, sortBy]);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Beginner":
        return styles.difficultyBeginner;
      case "Intermediate":
        return styles.difficultyIntermediate;
      case "Advanced":
        return styles.difficultyAdvanced;
      default:
        return styles.difficultyDefault;
    }
  };

  const renderActivityCard = (activity: Activity) => {
    const organizerName =
      typeof activity.organizer === "string"
        ? activity.organizer
        : activity.organizer?.full_name || "Unknown Organizer";

    return (
      <TouchableOpacity
        key={activity.id}
        style={styles.activityCard}
        onPress={() =>
          navigation.navigate(
            "ActivityDetails" as never,
            { activityId: activity.id } as never,
          )
        }
      >
        <View style={styles.cardContent}>
          {activity.image && (
            <Image
              source={{ uri: activity.image }}
              style={styles.activityImage}
            />
          )}

          <View style={styles.activityInfo}>
            {/* Header */}
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle} numberOfLines={2}>
                {activity.title}
              </Text>
              {activity.difficulty && (
                <View
                  style={[
                    styles.difficultyBadge,
                    getDifficultyColor(activity.difficulty),
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {activity.difficulty}
                  </Text>
                </View>
              )}
            </View>

            {/* Organizer */}
            <Text style={styles.organizer}>{organizerName}</Text>

            {/* Description */}
            {activity.description && (
              <Text style={styles.description} numberOfLines={2}>
                {activity.description}
              </Text>
            )}

            {/* Meta Info */}
            <View style={styles.metaInfo}>
              <View style={styles.metaRow}>
                <Icon name="calendar" size={12} color="#666" />
                <Text style={styles.metaText}>
                  {new Date(activity.date).toLocaleDateString()} at{" "}
                  {activity.time}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="map-pin" size={12} color="#666" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {activity.location}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="users" size={12} color="#666" />
                <Text style={styles.metaText}>
                  {activity.participants || 0}/{activity.maxParticipants || 20}{" "}
                  joined
                </Text>
              </View>

              {activity.distance && (
                <View style={styles.metaRow}>
                  <Icon name="clock" size={12} color="#666" />
                  <Text style={styles.metaText}>{activity.distance}</Text>
                </View>
              )}
            </View>

            {/* Progress and Join Button */}
            <View style={styles.actionRow}>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          activity.participants && activity.maxParticipants
                            ? Math.min(
                                (activity.participants /
                                  activity.maxParticipants) *
                                  100,
                                100,
                              )
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.spotsText}>
                  {activity.maxParticipants && activity.participants
                    ? Math.max(
                        0,
                        activity.maxParticipants - activity.participants,
                      )
                    : "~"}{" "}
                  spots left
                </Text>
              </View>

              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Recent activities nearby</Text>
              <Text style={styles.headerSubtitle}>
                {filteredActivities.length} activities found
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              <Icon
                name={viewMode === "grid" ? "list" : "grid"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                showFilters && styles.actionButtonActive,
              ]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Icon
                name="sliders"
                size={20}
                color={showFilters ? "#fff" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities, organizers, locations..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#10B981" }]}>
            {filteredActivities.length}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#3B82F6" }]}>
            {
              filteredActivities.filter((a) => {
                const activityDate = new Date(a.date);
                const weekFromNow = new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000,
                );
                return (
                  activityDate <= weekFromNow && activityDate >= new Date()
                );
              }).length
            }
          </Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
            {filteredActivities.reduce(
              (sum, a) =>
                sum + ((a.maxParticipants || 20) - (a.participants || 0)),
              0,
            )}
          </Text>
          <Text style={styles.statLabel}>Spots Left</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#8B5CF6" }]}>
            {Math.round(
              (filteredActivities.filter((a) => a.difficulty).length /
                filteredActivities.length) *
                100,
            )}
            %
          </Text>
          <Text style={styles.statLabel}>Have Info</Text>
        </View>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortOptions}
        >
          {[
            { value: "date", label: "Date", icon: "calendar" },
            { value: "popularity", label: "Popularity", icon: "trending-up" },
            { value: "distance", label: "Distance", icon: "map-pin" },
            { value: "difficulty", label: "Difficulty", icon: "star" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortButton,
                sortBy === option.value && styles.sortButtonActive,
              ]}
              onPress={() => setSortBy(option.value as any)}
            >
              <Icon
                name={option.icon}
                size={16}
                color={sortBy === option.value ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === option.value && styles.sortButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Activities List */}
      <ScrollView
        style={styles.activitiesList}
        showsVerticalScrollIndicator={false}
      >
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="map-pin" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No activities found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filters or check back later
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() =>
                (navigation as any).getParent()?.navigate("Create")
              }
            >
              <Text style={styles.createButtonText}>Create Activity</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activitiesContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                Showing {filteredActivities.length} activities
              </Text>
              <Text style={styles.sortedText}>Sorted by Date</Text>
            </View>

            {filteredActivities.map(renderActivityCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  header: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    backgroundColor: designTokens.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.border.light,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  actionButtonActive: {
    backgroundColor: designTokens.colors.primary,
  },
  searchContainer: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 44,
    paddingRight: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  sortContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: "row",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sortButtonActive: {
    backgroundColor: designTokens.colors.primary,
    borderColor: designTokens.colors.primary,
  },
  sortButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  sortButtonTextActive: {
    color: "#ffffff",
  },
  activitiesList: {
    flex: 1,
  },
  activitiesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "#6b7280",
  },
  sortedText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  activityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: "row",
    gap: 16,
  },
  activityImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBeginner: {
    backgroundColor: "#dcfce7",
  },
  difficultyIntermediate: {
    backgroundColor: "#fef3c7",
  },
  difficultyAdvanced: {
    backgroundColor: "#fee2e2",
  },
  difficultyDefault: {
    backgroundColor: "#f3f4f6",
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  organizer: {
    fontSize: 14,
    fontWeight: "500",
    color: designTokens.colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  metaInfo: {
    gap: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  progressBar: {
    width: 64,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: designTokens.colors.primary,
    borderRadius: 4,
  },
  spotsText: {
    fontSize: 12,
    color: "#6b7280",
  },
  joinButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: designTokens.colors.primary,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ffffff",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: designTokens.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 16,
  },
});
