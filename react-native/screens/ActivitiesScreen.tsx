import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { designTokens } from "../styles/designTokens";
import { useActivities } from "../contexts/ActivitiesContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date: string;
  time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  organizer_name: string;
  organizer_image?: string;
  skill_level: string;
  price?: number;
  status: "upcoming" | "completed" | "cancelled";
  user_status: "joined" | "organized" | "pending";
}

const ActivitiesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activities, userActivities, isLoading, fetchUserActivities } =
    useActivities();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [refreshing, setRefreshing] = useState(false);

  // Mock user activities - replace with actual data from context
  const [mockUserActivities] = useState<Activity[]>([
    {
      id: "1",
      title: "Westway Climbing Session",
      description: "Indoor climbing session for all levels",
      activity_type: "climbing",
      date: "2024-02-15",
      time: "18:00",
      location: "Westway Climbing Centre, London",
      max_participants: 8,
      current_participants: 5,
      organizer_name: "Holly Smith",
      organizer_image:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop",
      skill_level: "All levels",
      price: 15,
      status: "upcoming",
      user_status: "joined",
    },
    {
      id: "2",
      title: "Oxford Bouldering Meet",
      description: "Weekly bouldering session",
      activity_type: "climbing",
      date: "2024-02-10",
      time: "19:00",
      location: "Oxford Brookes Climbing Wall",
      max_participants: 12,
      current_participants: 8,
      organizer_name: "You",
      skill_level: "Intermediate",
      status: "completed",
      user_status: "organized",
    },
    {
      id: "3",
      title: "Richmond Park Cycling",
      description: "Scenic cycling route",
      activity_type: "cycling",
      date: "2024-01-28",
      time: "09:00",
      location: "Richmond Park, London",
      max_participants: 15,
      current_participants: 12,
      organizer_name: "Marcus Rodriguez",
      organizer_image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
      skill_level: "Intermediate",
      status: "completed",
      user_status: "joined",
    },
  ]);

  useEffect(() => {
    fetchUserActivities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserActivities();
    setRefreshing(false);
  };

  const getUpcomingActivities = () => {
    return mockUserActivities.filter(
      (activity) => activity.status === "upcoming",
    );
  };

  const getPastActivities = () => {
    return mockUserActivities.filter(
      (activity) => activity.status === "completed",
    );
  };

  const getSportEmoji = (sport: string) => {
    const emojis: { [key: string]: string } = {
      climbing: "🧗",
      cycling: "🚴",
      running: "👟",
      hiking: "🥾",
      skiing: "⛷️",
      surfing: "🌊",
      tennis: "🎾",
    };
    return emojis[sport.toLowerCase()] || "⚡";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (userStatus: string) => {
    switch (userStatus) {
      case "organized":
        return designTokens.colors.primary;
      case "joined":
        return designTokens.colors.success;
      case "pending":
        return designTokens.colors.warning;
      default:
        return designTokens.colors.gray[400];
    }
  };

  const getStatusText = (userStatus: string) => {
    switch (userStatus) {
      case "organized":
        return "Organizer";
      case "joined":
        return "Joined";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const renderActivityCard = ({ item: activity }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() =>
        navigation.navigate(
          "ActivityDetail" as never,
          { activityId: activity.id } as never,
        )
      }
    >
      <Card padding={0} style={styles.cardStyle}>
        <View style={styles.activityHeader}>
          <View style={styles.activityType}>
            <Text style={styles.activityEmoji}>
              {getSportEmoji(activity.activity_type)}
            </Text>
            <Text style={styles.activityTypeText}>
              {activity.activity_type}
            </Text>
          </View>
          <Badge
            variant={
              activity.user_status === "organized" ? "primary" : "success"
            }
            size="sm"
          >
            {getStatusText(activity.user_status)}
          </Badge>
        </View>

        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{activity.title}</Text>

          <View style={styles.activityMeta}>
            <View style={styles.metaRow}>
              <Icon
                name="calendar"
                size={16}
                color={designTokens.colors.text.secondary}
              />
              <Text style={styles.metaText}>
                {formatDate(activity.date)} at {activity.time}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Icon
                name="map-pin"
                size={16}
                color={designTokens.colors.text.secondary}
              />
              <Text style={styles.metaText}>{activity.location}</Text>
            </View>

            <View style={styles.metaRow}>
              <Icon
                name="users"
                size={16}
                color={designTokens.colors.text.secondary}
              />
              <Text style={styles.metaText}>
                {activity.current_participants}/{activity.max_participants}{" "}
                participants
              </Text>
            </View>
          </View>

          {activity.user_status !== "organized" && (
            <View style={styles.organizerInfo}>
              <Avatar
                uri={activity.organizer_image}
                name={activity.organizer_name}
                size="sm"
              />
              <Text style={styles.organizerText}>
                Organized by {activity.organizer_name}
              </Text>
            </View>
          )}

          {activity.price && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>£{activity.price}</Text>
            </View>
          )}
        </View>

        {activeTab === "upcoming" && (
          <View style={styles.activityActions}>
            {activity.user_status === "organized" ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editButton}>
                  <Icon
                    name="edit-2"
                    size={16}
                    color={designTokens.colors.primary}
                  />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.manageButton}>
                  <Icon name="users" size={16} color="#FFFFFF" />
                  <Text style={styles.manageButtonText}>Manage</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.detailsButton}>
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.leaveButton}>
                  <Text style={styles.leaveButtonText}>Leave</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === "past" && activity.user_status === "organized" && (
          <View style={styles.pastActivityStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {activity.current_participants}
              </Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.5</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Icon
          name={activeTab === "upcoming" ? "calendar" : "clock"}
          size={48}
          color={designTokens.colors.gray[400]}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === "upcoming"
          ? "No upcoming activities"
          : "No past activities"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === "upcoming"
          ? "Join activities from the explore page to see them here"
          : "Activities you've completed will appear here"}
      </Text>
      {activeTab === "upcoming" && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate("Explore" as never)}
        >
          <Icon name="search" size={16} color="#FFFFFF" />
          <Text style={styles.exploreButtonText}>Explore Activities</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Activities</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateActivity" as never)}
        >
          <Icon name="plus" size={24} color={designTokens.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Upcoming ({getUpcomingActivities().length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.activeTab]}
          onPress={() => setActiveTab("past")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "past" && styles.activeTabText,
            ]}
          >
            Past ({getPastActivities().length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Activities List */}
      <FlatList
        data={
          activeTab === "upcoming"
            ? getUpcomingActivities()
            : getPastActivities()
        }
        renderItem={renderActivityCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={designTokens.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: designTokens.colors.text.primary,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: designTokens.colors.gray[100],
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: designTokens.colors.white,
    ...designTokens.shadows.sm,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: designTokens.colors.text.secondary,
  },
  activeTabText: {
    color: designTokens.colors.primary,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  activityCard: {
    marginBottom: 16,
  },
  cardStyle: {
    overflow: "hidden",
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 0,
  },
  activityType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: designTokens.colors.text.secondary,
    textTransform: "capitalize",
  },
  activityContent: {
    padding: 16,
    paddingTop: 8,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: designTokens.colors.text.primary,
    marginBottom: 12,
  },
  activityMeta: {
    gap: 8,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
    flex: 1,
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  organizerText: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
  },
  priceContainer: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: designTokens.colors.primary,
  },
  activityActions: {
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.border.light,
    padding: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: designTokens.colors.primary,
    flex: 1,
    justifyContent: "center",
  },
  editButtonText: {
    color: designTokens.colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: designTokens.colors.primary,
    flex: 1,
    justifyContent: "center",
  },
  manageButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: designTokens.colors.border.medium,
    flex: 1,
    alignItems: "center",
  },
  detailsButtonText: {
    color: designTokens.colors.text.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  leaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: designTokens.colors.error,
    flex: 1,
    alignItems: "center",
  },
  leaveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  pastActivityStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.border.light,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: designTokens.colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: designTokens.colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: designTokens.colors.border.light,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: designTokens.colors.gray[100],
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: designTokens.colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: designTokens.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ActivitiesScreen;
