import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useAuth } from '../contexts/AuthContext';
import { useFollow } from '../contexts/FollowContext';
import { useUserActivitiesAndReviews } from '../hooks/useUserActivitiesAndReviews';
import { apiService } from '../services/apiService';

const ProfileScreen: React.FC = () => {
  const { user, profile } = useAuth();
  const { followStats, isLoading: followLoading, refreshFollowData } = useFollow();
  const {
    completedActivities,
    organizedActivities,
    totalActivities,
    averageRating,
    totalReviews,
    loading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useUserActivitiesAndReviews(user?.id);

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"completed" | "organized">(
    "completed",
  );
  const [activeSportTab, setActiveSportTab] = useState<string>("climbing");
  const [activeClubTab, setActiveClubTab] = useState<string>("clubs");
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Calculate age from birthday if available
  const calculateAge = (birthday: string): number => {
    if (!birthday) return 22;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Use actual profile data when available, fallback to demo data matching web exactly
  const profileData = {
    full_name: profile?.full_name || user?.full_name || "KOKO",
    profile_image: profile?.profile_image || user?.profile_image || null,
    bio: profile?.bio || "Passionate climber and outdoor enthusiast from Oxford. Love exploring new routes and meeting fellow adventurers!",
    age: profile?.birthday ? calculateAge(profile.birthday) : 15,
    gender: profile?.gender || "Female",
    nationality: profile?.country || "United Kingdom",
    profession: profile?.profession || "STUDENT",
    university: profile?.university || "",
    location: profile?.location || "Oxford, UK",
    sports: profile?.sports || ["Cycling", "Climbing", "Running"],
    languages: profile?.languages || ["🇪🇸", "🇬🇧", "🇨🇳"],
    followers: followStats?.followers || 125,
    following: followStats?.following || 87,
    rating: averageRating || 5.0,
    reviews: totalReviews || 1,
    // Sport-specific data
    climbingLevel: profile?.climbingLevel || "Advanced",
    climbingExperience: profile?.climbingExperience || "3+ years",
    cyclingLevel: profile?.cyclingLevel || "Intermediate",
    cyclingExperience: profile?.cyclingExperience || "2+ years",
    runningLevel: profile?.runningLevel || "Beginner",
    runningExperience: profile?.runningExperience || "1+ year",
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) {
      setIsLoadingData(false);
      return;
    }

    try {
      setIsLoadingData(true);

      // Load user activities and reviews in parallel
      const [activitiesResponse, reviewsResponse] = await Promise.allSettled([
        apiService.getUserActivityHistory({ user_id: user.id }),
        apiService.getUserReviews(user.id)
      ]);

      if (activitiesResponse.status === 'fulfilled' && activitiesResponse.value.data) {
        setUserActivities(activitiesResponse.value.data);
      }

      if (reviewsResponse.status === 'fulfilled' && reviewsResponse.value.data) {
        setUserReviews(reviewsResponse.value.data);
      }

      // Refresh follow data
      await refreshFollowData();

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingData(false);
    }
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

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              star <= Math.floor(rating) ? styles.filledStar : styles.emptyStar,
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back arrow, title, and settings */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.profileTop}>
            {/* Avatar with initial */}
            <View style={styles.avatarContainer}>
              {profileData.profile_image ? (
                <Image
                  source={{ uri: profileData.profile_image }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {profileData.full_name.charAt(0)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.full_name}</Text>

              {/* Followers/Following Stats */}
              <View style={styles.statsContainer}>
                <TouchableOpacity onPress={() => setShowFollowers(true)}>
                  <Text style={styles.statText}>
                    {followLoading ? (
                      <ActivityIndicator size="small" color="#6B7280" />
                    ) : (
                      `${profileData.followers} Followers`
                    )}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.statDivider}>•</Text>
                <TouchableOpacity onPress={() => setShowFollowing(true)}>
                  <Text style={styles.statText}>
                    {followLoading ? (
                      <ActivityIndicator size="small" color="#6B7280" />
                    ) : (
                      `${profileData.following} Following`
                    )}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Rating Stars */}
              <View style={styles.ratingContainer}>
                {renderStars(profileData.rating)}
                <Text style={styles.ratingText}>
                  {profileData.rating.toFixed(1)} ({profileData.reviews} review{profileData.reviews !== 1 ? 's' : ''})
                </Text>
              </View>
            </View>
          </View>

          {/* Sport Tags and Profession */}
          <View style={styles.tagsContainer}>
            {profileData.sports.map((sport, index) => (
              <View key={index} style={styles.sportTag}>
                <Text style={styles.sportTagText}>
                  {getSportEmoji(sport)} {sport}
                </Text>
              </View>
            ))}
            <View style={styles.professionTag}>
              <Text style={styles.professionTagText}>
                {profileData.profession}
              </Text>
            </View>
          </View>

          {/* Languages */}
          <View style={styles.languagesContainer}>
            {profileData.languages.map((lang, index) => (
              <Text key={index} style={styles.languageFlag}>{lang}</Text>
            ))}
          </View>

          {/* Bio/Description */}
          <Text style={styles.bio}>{profileData.bio}</Text>
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Gender:</Text>
              <Text style={styles.detailValue}>{profileData.gender}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Age:</Text>
              <Text style={styles.detailValue}>
                {profileData.age} years old
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Nationality:</Text>
              <Text style={styles.detailValue}>{profileData.nationality}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Profession:</Text>
              <Text style={styles.detailValue}>{profileData.profession}</Text>
            </View>
          </View>
        </View>

        {/* Sports & Licensing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports & Licensing</Text>

          {/* Sport Tabs */}
          <View style={styles.tabContainer}>
            {profileData.sports.map((sport, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tab,
                  activeSportTab === sport.toLowerCase() && styles.activeTab,
                ]}
                onPress={() => setActiveSportTab(sport.toLowerCase())}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeSportTab === sport.toLowerCase() &&
                      styles.activeTabText,
                  ]}
                >
                  {getSportEmoji(sport)} {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sport Details */}
          <View style={styles.sportCard}>
            <View style={styles.sportDetailRow}>
              <Text style={styles.sportDetailLabel}>Level:</Text>
              <Text style={styles.sportDetailValue}>
                {activeSportTab === "climbing" ? profileData.climbingLevel :
                 activeSportTab === "cycling" ? profileData.cyclingLevel :
                 activeSportTab === "running" ? profileData.runningLevel : "Intermediate"}
              </Text>
            </View>
            <View style={styles.sportDetailRow}>
              <Text style={styles.sportDetailLabel}>Experience:</Text>
              <Text style={styles.sportDetailValue}>
                {activeSportTab === "climbing" ? profileData.climbingExperience :
                 activeSportTab === "cycling" ? profileData.cyclingExperience :
                 activeSportTab === "running" ? profileData.runningExperience : "2+ years"}
              </Text>
            </View>
          </View>
        </View>

        {/* Activities & Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities & Reviews</Text>

          {/* Activity Tabs */}
          <View style={styles.activityTabContainer}>
            <TouchableOpacity
              style={[
                styles.activityTab,
                activeTab === "completed" && styles.activeActivityTab,
              ]}
              onPress={() => setActiveTab("completed")}
            >
              <Text
                style={[
                  styles.activityTabText,
                  activeTab === "completed" && styles.activeActivityTabText,
                ]}
              >
                Completed Activities
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.activityTab,
                activeTab === "organized" && styles.activeActivityTab,
              ]}
              onPress={() => setActiveTab("organized")}
            >
              <Text
                style={[
                  styles.activityTabText,
                  activeTab === "organized" && styles.activeActivityTabText,
                ]}
              >
                Organized Activities
              </Text>
            </TouchableOpacity>
          </View>

          {/* Activity Content */}
          {activitiesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6B7280" />
              <Text style={styles.loadingText}>Loading activities...</Text>
            </View>
          ) : (
            <View style={styles.activitiesContent}>
              {activeTab === "completed" ? (
                completedActivities.length > 0 ? (
                  completedActivities.slice(0, 3).map((activity, index) => (
                    <View key={activity.id || index} style={styles.activityCard}>
                      <Text style={styles.activityTitle}>
                        {getSportEmoji(activity.activity_type)} {activity.title}
                      </Text>
                      <Text style={styles.activitySubtitle}>
                        {new Date(activity.date).toLocaleDateString()} • {activity.location}
                      </Text>
                      {activity.recent_review && (
                        <View style={styles.reviewContainer}>
                          <Text style={styles.reviewText}>"{activity.recent_review.comment}"</Text>
                          <Text style={styles.reviewRating}>
                            {renderStars(activity.recent_review.rating)} {activity.recent_review.rating}/5
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No completed activities yet</Text>
                )
              ) : (
                organizedActivities.length > 0 ? (
                  organizedActivities.slice(0, 3).map((activity, index) => (
                    <View key={activity.id || index} style={styles.activityCard}>
                      <Text style={styles.activityTitle}>
                        {getSportEmoji(activity.activity_type)} {activity.title}
                      </Text>
                      <Text style={styles.activitySubtitle}>
                        {new Date(activity.date).toLocaleDateString()} • {activity.location}
                      </Text>
                      {activity.total_reviews > 0 && (
                        <View style={styles.reviewContainer}>
                          <Text style={styles.reviewText}>
                            Average rating: {activity.average_rating?.toFixed(1)}/5 ({activity.total_reviews} reviews)
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No organized activities yet</Text>
                )
              )}
            </View>
          )}
        </View>

        {/* Clubs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clubs</Text>
          <View style={styles.clubCard}>
            <Text style={styles.clubName}>🧗 Westway Climbing Centre</Text>
            <Text style={styles.clubDetails}>1,250 members • London, UK</Text>
            <Text style={styles.clubRole}>Member since 2023</Text>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.locationText}>📍 {profileData.location}</Text>
        </View>

        {/* Bottom padding for navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navLabel}>Activities</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navLabel}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>👤</Text>
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Followers Modal */}
      <Modal visible={showFollowers} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFollowers(false)}>
              <Text style={styles.modalClose}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Followers</Text>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.emptyText}>Followers list coming soon!</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Following Modal */}
      <Modal visible={showFollowing} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFollowing(false)}>
              <Text style={styles.modalClose}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Following</Text>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.emptyText}>Following list coming soon!</Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 24,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statText: {
    fontSize: 14,
    color: "#6B7280",
  },
  statDivider: {
    marginHorizontal: 8,
    color: "#6B7280",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  star: {
    fontSize: 16,
  },
  filledStar: {
    color: "#FBBF24",
  },
  emptyStar: {
    color: "#D1D5DB",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  sportTag: {
    backgroundColor: "#1F381F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sportTagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  occupationTag: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  occupationTagText: {
    color: "#D97706",
    fontSize: 14,
    fontWeight: "500",
  },
  bio: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    width: "45%",
  },
  fullWidth: {
    width: "100%",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  tabContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#1F381F",
  },
  sportCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
  },
  sportName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  sportDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  activityCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalClose: {
    fontSize: 16,
    color: "#1F381F",
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
});

export default ProfileScreen;
