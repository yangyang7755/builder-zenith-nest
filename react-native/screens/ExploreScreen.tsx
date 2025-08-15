import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from "react-native";

const ExploreScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All", emoji: "🎯" },
    { id: "climbing", name: "Climbing", emoji: "🧗" },
    { id: "cycling", name: "Cycling", emoji: "🚴" },
    { id: "running", name: "Running", emoji: "👟" },
    { id: "hiking", name: "Hiking", emoji: "🥾" },
    { id: "skiing", name: "Skiing", emoji: "⛷️" },
    { id: "surfing", name: "Surfing", emoji: "🌊" },
    { id: "tennis", name: "Tennis", emoji: "🎾" },
  ];

  const activities = [
    {
      id: "1",
      title: "Westway Climbing Session",
      type: "climbing",
      date: "Feb 15",
      time: "6:00 PM",
      location: "Westway Climbing Centre",
      organizer: "Holly Smith",
      participants: "5/8",
      price: "£15",
    },
    {
      id: "2",
      title: "Richmond Park Cycling",
      type: "cycling",
      date: "Feb 16",
      time: "9:00 AM",
      location: "Richmond Park",
      organizer: "Marcus Rodriguez",
      participants: "8/12",
      price: "Free",
    },
    {
      id: "3",
      title: "Hyde Park Running Club",
      type: "running",
      date: "Feb 17",
      time: "7:00 AM",
      location: "Hyde Park",
      organizer: "Sarah Johnson",
      participants: "12/15",
      price: "Free",
    },
  ];

  const getFilteredActivities = () => {
    let filtered = activities;

    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (activity) => activity.type === activeCategory,
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.location.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  };

  const getSportEmoji = (type: string) => {
    const category = categories.find((c) => c.id === type);
    return category ? category.emoji : "⚡";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities, locations..."
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
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  activeCategory === category.id && styles.activeCategoryCard,
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    activeCategory === category.id && styles.activeCategoryName,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Today</Text>
          <View style={styles.featuredCard}>
            <Text style={styles.featuredEmoji}>🧗</Text>
            <Text style={styles.featuredTitle}>Westway Climbing Session</Text>
            <Text style={styles.featuredDetails}>
              Today • 6:00 PM • Westway Centre
            </Text>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join Activity</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === "all"
                ? "All Activities"
                : `${categories.find((c) => c.id === activeCategory)?.name} Activities`}
            </Text>
            <Text style={styles.sectionCount}>
              {getFilteredActivities().length} found
            </Text>
          </View>

          {getFilteredActivities().length > 0 ? (
            getFilteredActivities().map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityEmoji}>
                    {getSportEmoji(activity.type)}
                  </Text>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityMeta}>
                      📅 {activity.date} • {activity.time}
                    </Text>
                    <Text style={styles.activityMeta}>
                      📍 {activity.location}
                    </Text>
                    <Text style={styles.activityMeta}>
                      👥 {activity.participants} • Organized by{" "}
                      {activity.organizer}
                    </Text>
                  </View>
                  <View style={styles.activityPrice}>
                    <Text style={styles.priceText}>{activity.price}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No activities found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No activities match "${searchQuery}"`
                  : `No ${activeCategory === "all" ? "" : activeCategory} activities available`}
              </Text>
            </View>
          )}
        </View>

        {/* Clubs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Clubs</Text>

          <View style={styles.clubCard}>
            <Text style={styles.clubEmoji}>🧗</Text>
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>
                Oxford University Climbing Club
              </Text>
              <Text style={styles.clubMembers}>245 members</Text>
            </View>
          </View>

          <View style={styles.clubCard}>
            <Text style={styles.clubEmoji}>🚴</Text>
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>London Cycling Network</Text>
              <Text style={styles.clubMembers}>432 members</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  clearIcon: {
    fontSize: 16,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    minWidth: 80,
  },
  activeCategoryCard: {
    backgroundColor: "#1F381F",
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeCategoryName: {
    color: "#FFFFFF",
  },
  featuredCard: {
    backgroundColor: "#1F381F",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    alignItems: "center",
  },
  featuredEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  featuredDetails: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 16,
    textAlign: "center",
  },
  joinButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  joinButtonText: {
    color: "#1F381F",
    fontSize: 14,
    fontWeight: "600",
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activityHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  activityEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  activityPrice: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F381F",
  },
  viewButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  viewButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  clubCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  clubEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  clubMembers: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default ExploreScreen;
