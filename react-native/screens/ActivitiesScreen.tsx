import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Import your exact design tokens
import { designTokens } from "../styles/designTokens";

// Placeholder for your exact contexts - will need to be converted
// import { useSavedActivities } from "../contexts/SavedActivitiesContext";
// import { Activity, useActivities } from "../contexts/ActivitiesContext";
// import { useActivityParticipation } from "../contexts/ActivityParticipationContext";
// import { useUserProfile } from "../contexts/UserProfileContext";

const ActivitiesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("Saved");

  // Mock data matching your exact structure - will be replaced with real contexts
  const savedActivities = [
    {
      id: "1",
      title: "Westway Climbing Session",
      type: "climbing",
      date: "2024-02-20",
      time: "18:00",
      location: "Westway Climbing Centre, London",
      organizerName: "Holly Smith",
      maxParticipants: "8",
      current_participants: 5,
      status: "upcoming",
    },
  ];

  const participatedActivities = [];
  const organizedActivities = [];

  // Sort activities by date (future vs past) - EXACT same logic as web
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const upcomingSavedActivities = savedActivities.filter((activity) => {
    const activityDate = new Date(activity.date);
    const activityDateString = activityDate.toISOString().split("T")[0];
    return activityDateString >= today;
  });

  const pastSavedActivities = savedActivities.filter((activity) => {
    const activityDate = new Date(activity.date);
    const activityDateString = activityDate.toISOString().split("T")[0];
    return activityDateString < today;
  });

  // Combine participated and organized activities, removing duplicates - EXACT same logic
  const allJoinedActivities = [
    ...participatedActivities,
    ...organizedActivities.filter(
      (org) => !participatedActivities.some((part) => part.id === org.id),
    ),
  ];

  const handleActivityClick = (activity) => {
    // EXACT same navigation logic as web
    if (activity.type === "cycling") {
      navigation.navigate("ActivityDetail", { id: "sunday-morning-ride" });
    } else if (activity.type === "climbing") {
      navigation.navigate("ActivityDetail", { id: "westway-womens-climb" });
    } else if (activity.type === "running") {
      navigation.navigate("ActivityDetail", { id: "westway-womens-climb" });
    } else {
      navigation.navigate("ActivityDetail", { id: "westway-womens-climb" });
    }
  };

  // EXACT same icon mapping as web
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "cycling":
        return "🚴";
      case "climbing":
        return "🧗";
      case "running":
        return "👟";
      case "hiking":
        return "🥾";
      case "skiing":
        return "🎿";
      case "surfing":
        return "🌊";
      case "tennis":
        return "🎾";
      default:
        return "⚡";
    }
  };

  const ActivityCard = ({ activity }) => {
    // EXACT same data extraction logic as web
    const organizerName =
      activity.organizer?.full_name || activity.organizerName || "Unknown";

    const activityDate = activity.date_time
      ? new Date(activity.date_time)
      : activity.date
        ? new Date(activity.date + "T" + (activity.time || "00:00") + ":00")
        : new Date();

    const activityType = activity.activity_type || activity.type || "general";
    const maxParticipants =
      activity.max_participants || parseInt(activity.maxParticipants || "0");

    return (
      <TouchableOpacity
        onPress={() => handleActivityClick(activity)}
        style={styles.activityCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardContent}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.organizerText}>By {organizerName}</Text>
          </View>
          <Text style={styles.activityIcon}>
            {getActivityIcon(activityType)}
          </Text>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.clockIcon}>🕐</Text>
            <Text style={styles.detailText}>
              {activityDate.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              at {activityDate.toTimeString().slice(0, 5)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.detailText}>{activity.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.usersIcon}>👥</Text>
            <Text style={styles.detailText}>
              {activity.current_participants || 0}/{maxParticipants} people
            </Text>
          </View>
        </View>

        {activity.status && (
          <View style={styles.statusContainer}>
            <Text style={styles.checkIcon}>✅</Text>
            <Text style={styles.statusText}>{activity.status}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar - EXACT same as web */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusIcons}>
          <View style={styles.signalBars}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={styles.signalBar} />
            ))}
          </View>
          <View style={styles.battery}>
            <View style={styles.batteryBody} />
            <View style={styles.batteryTip} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title - EXACT same styling */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>All Activities</Text>
        </View>

        {/* Tab Navigation - EXACT same design and logic */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setSelectedTab("Saved")}
            style={[styles.tab, selectedTab === "Saved" && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "Saved" && styles.activeTabText,
              ]}
            >
              Saved Activities
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab("Joined")}
            style={[styles.tab, selectedTab === "Joined" && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "Joined" && styles.activeTabText,
              ]}
            >
              Joined Activities
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content - EXACT same structure and logic */}
        {selectedTab === "Saved" && (
          <View>
            <Text style={styles.sectionTitle}>
              Upcoming Activities ({upcomingSavedActivities.length})
            </Text>
            {upcomingSavedActivities.length > 0 ? (
              upcomingSavedActivities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.bookmarkIcon}>🔖</Text>
                <Text style={styles.emptyText}>
                  No upcoming saved activities
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Explore")}
                >
                  <Text style={styles.exploreLink}>
                    Explore activities to save
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {pastSavedActivities.length > 0 && (
              <View style={styles.pastSection}>
                <Text style={styles.sectionTitle}>
                  Past Activities ({pastSavedActivities.length})
                </Text>
                {pastSavedActivities.map((activity, index) => (
                  <ActivityCard key={index} activity={activity} />
                ))}
              </View>
            )}
          </View>
        )}

        {selectedTab === "Joined" && (
          <View>
            {/* Organized Activities Section - EXACT same structure */}
            {organizedActivities.length > 0 && (
              <View style={styles.organizedSection}>
                <Text style={styles.sectionTitle}>
                  Your Organized Activities ({organizedActivities.length})
                </Text>
                {organizedActivities.map((activity, index) => (
                  <ActivityCard
                    key={`organized-${activity.id}-${index}`}
                    activity={activity}
                  />
                ))}
              </View>
            )}

            {/* Participated Activities Section - EXACT same structure */}
            <Text style={styles.sectionTitle}>
              Joined Activities ({participatedActivities.length})
            </Text>
            {participatedActivities.length > 0 ? (
              participatedActivities.map((activity, index) => (
                <ActivityCard
                  key={`participated-${activity.id}-${index}`}
                  activity={activity}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.checkIcon}>✅</Text>
                <Text style={styles.emptyText}>No joined activities yet</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Explore")}
                >
                  <Text style={styles.exploreLink}>
                    Find activities to join
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Development Tools Placeholder - will be converted later */}
        <View style={styles.devTools}>
          <Text style={styles.devText}>Backend Test Component</Text>
          <Text style={styles.devText}>Demo Auth Component</Text>
          <Text style={styles.devText}>User Nav Component</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles using EXACT same design tokens and matching web styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.white,
  },
  statusBar: {
    height: 44,
    backgroundColor: designTokens.colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  statusTime: {
    color: designTokens.colors.black,
    fontWeight: "500",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  signalBars: {
    flexDirection: "row",
    gap: 2,
  },
  signalBar: {
    width: 4,
    height: 12,
    backgroundColor: designTokens.colors.black,
    borderRadius: 2,
  },
  battery: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryBody: {
    width: 22,
    height: 10,
    borderWidth: 1,
    borderColor: designTokens.colors.black,
    borderRadius: 2,
  },
  batteryTip: {
    width: 2,
    height: 4,
    backgroundColor: designTokens.colors.black,
    borderRadius: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 96, // Account for bottom navigation
  },
  titleContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: designTokens.colors.primary, // text-explore-green
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: designTokens.colors.gray[100],
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: designTokens.colors.white,
    shadowColor: designTokens.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: designTokens.colors.gray[600],
  },
  activeTabText: {
    color: designTokens.colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: designTokens.colors.black,
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: designTokens.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: designTokens.colors.gray[200],
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: designTokens.colors.black,
    marginBottom: 4,
  },
  organizerText: {
    fontSize: 14,
    color: designTokens.colors.gray[600],
  },
  activityIcon: {
    fontSize: 32,
    marginLeft: 8,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clockIcon: {
    fontSize: 16,
  },
  locationIcon: {
    fontSize: 16,
  },
  usersIcon: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 14,
    color: designTokens.colors.gray[600],
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  checkIcon: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: designTokens.colors.success,
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  bookmarkIcon: {
    fontSize: 48,
    opacity: 0.3,
    marginBottom: 16,
  },
  checkIcon: {
    fontSize: 48,
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: designTokens.colors.gray[500],
    marginBottom: 8,
  },
  exploreLink: {
    fontSize: 16,
    color: designTokens.colors.primary,
    fontWeight: "500",
  },
  pastSection: {
    marginTop: 32,
  },
  organizedSection: {
    marginBottom: 32,
  },
  devTools: {
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.gray[200],
    marginTop: 24,
  },
  devText: {
    fontSize: 14,
    color: designTokens.colors.gray[500],
    textAlign: "center",
    marginBottom: 8,
  },
});

export default ActivitiesScreen;
