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
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useFollow } from "../contexts/FollowContext";
import { useUserActivitiesAndReviews } from "../hooks/useUserActivitiesAndReviews";
import { useClubs } from "../contexts/ClubContext";

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
  icon?: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  title,
  isActive,
  onPress,
  icon,
}) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTab]}
    onPress={onPress}
  >
    {icon && <Text style={styles.tabIcon}>{icon}</Text>}
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const {
    followStats,
    isLoading: followLoading,
    refreshFollowData,
  } = useFollow();
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
  const [activeTab, setActiveTab] = useState<
    "sports" | "activities" | "reviews"
  >("sports");
  const [activeSportTab, setActiveSportTab] = useState<
    "climbing" | "cycling" | "running"
  >("climbing");
  const [activeActivitiesTab, setActiveActivitiesTab] = useState<
    "completed" | "organized"
  >("completed");
  const [refreshing, setRefreshing] = useState(false);
  const { userClubs, memberships, getUserClubs } = useClubs();

  // Calculate age from birthday if available
  const calculateAge = (birthday: string): number => {
    if (!birthday) return 15;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Use actual profile data when available, fallback to demo data matching web exactly
  const profileData = {
    full_name: profile?.full_name || user?.full_name || "KOKO",
    profile_image:
      profile?.profile_image ||
      user?.profile_image ||
      "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face",
    bio:
      profile?.bio ||
      "Passionate climber and outdoor enthusiast from Oxford. Love exploring new routes and meeting fellow adventurers!",
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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshFollowData(), refetchActivities()]);
    setRefreshing(false);
  };

  const renderStatusBar = () => (
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

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Profile</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("Settings" as never)}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileSection = () => (
    <View style={styles.profileSection}>
      {/* Profile Image and Basic Info */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: profileData.profile_image }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profileData.full_name}</Text>
          <Text style={styles.profileBio} numberOfLines={3}>
            {profileData.bio}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => setShowFollowers(true)}
        >
          <Text style={styles.statNumber}>{profileData.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => setShowFollowing(true)}
        >
          <Text style={styles.statNumber}>{profileData.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>

        <View style={styles.statItem}>
          <View style={styles.ratingContainer}>
            <Text style={styles.statNumber}>{profileData.rating}</Text>
            <Text style={styles.starIcon}>⭐</Text>
          </View>
          <Text style={styles.statLabel}>{profileData.reviews} Reviews</Text>
        </View>
      </View>

      {/* Sport Tags */}
      <View style={styles.sportTags}>
        <Text style={styles.sectionLabel}>Sports & Interests</Text>
        <View style={styles.tagsContainer}>
          {profileData.sports.map((sport, index) => (
            <View key={index} style={styles.sportTag}>
              <Text style={styles.sportTagText}>{sport}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Clubs Section */}
      <View style={styles.clubsSection}>
        <Text style={styles.sectionLabel}>Clubs & Communities</Text>
        {userClubs.length === 0 ? (
          <Text style={styles.emptyText}>No clubs yet</Text>
        ) : (
          <View style={styles.clubsList}>
            {userClubs.map((club: any) => (
              <View key={club.id} style={styles.clubItem}>
                <Text style={styles.clubName}>{club.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Personal Details */}
      <View style={styles.personalDetails}>
        <Text style={styles.sectionLabel}>Personal Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Age</Text>
            <Text style={styles.detailValue}>{profileData.age}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Gender</Text>
            <Text style={styles.detailValue}>{profileData.gender}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Nationality</Text>
            <Text style={styles.detailValue}>{profileData.nationality}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Profession</Text>
            <Text style={styles.detailValue}>{profileData.profession}</Text>
          </View>
        </View>

        <View style={styles.languagesSection}>
          <Text style={styles.detailLabel}>Languages</Text>
          <View style={styles.languagesContainer}>
            {profileData.languages.map((lang, index) => (
              <Text key={index} style={styles.languageFlag}>
                {lang}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    if (activeTab === "sports") {
      return renderSportsLicensingTab();
    } else if (activeTab === "activities") {
      return renderActivitiesTab();
    } else if (activeTab === "reviews") {
      return renderReviewsTab();
    }
    return null;
  };

  const renderSportsLicensingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sportTabButtons}>
        <TabButton
          title="Climbing"
          icon="🧗"
          isActive={activeSportTab === "climbing"}
          onPress={() => setActiveSportTab("climbing")}
        />
        <TabButton
          title="Cycling"
          icon="🚴"
          isActive={activeSportTab === "cycling"}
          onPress={() => setActiveSportTab("cycling")}
        />
        <TabButton
          title="Running"
          icon="🏃"
          isActive={activeSportTab === "running"}
          onPress={() => setActiveSportTab("running")}
        />
      </View>

      {activeSportTab === "climbing" && (
        <View style={styles.sportContent}>
          <View style={styles.skillCard}>
            <Text style={styles.skillTitle}>Climbing Experience</Text>
            <View style={styles.skillDetails}>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Level</Text>
                <Text style={styles.skillValue}>
                  {profileData.climbingLevel}
                </Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Experience</Text>
                <Text style={styles.skillValue}>
                  {profileData.climbingExperience}
                </Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Disciplines</Text>
                <Text style={styles.skillValue}>Bouldering, Sport, Trad</Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Grades</Text>
                <Text style={styles.skillValue}>V4-V6, 6a-6c</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeSportTab === "cycling" && (
        <View style={styles.sportContent}>
          <View style={styles.skillCard}>
            <Text style={styles.skillTitle}>Cycling Experience</Text>
            <View style={styles.skillDetails}>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Level</Text>
                <Text style={styles.skillValue}>
                  {profileData.cyclingLevel}
                </Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Experience</Text>
                <Text style={styles.skillValue}>
                  {profileData.cyclingExperience}
                </Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Disciplines</Text>
                <Text style={styles.skillValue}>Road, Mountain, Gravel</Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Average Pace</Text>
                <Text style={styles.skillValue}>25-30 km/h</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeSportTab === "running" && (
        <View style={styles.sportContent}>
          <View style={styles.skillCard}>
            <Text style={styles.skillTitle}>Running Experience</Text>
            <View style={styles.skillDetails}>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Level</Text>
                <Text style={styles.skillValue}>
                  {profileData.runningLevel}
                </Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Experience</Text>
                <Text style={styles.skillValue}>
                  {profileData.runningExperience}
                </Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Distances</Text>
                <Text style={styles.skillValue}>5K, 10K, Half Marathon</Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Pace</Text>
                <Text style={styles.skillValue}>5:30-6:00 /km</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderActivitiesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.activitiesTabButtons}>
        <TabButton
          title="Completed"
          isActive={activeActivitiesTab === "completed"}
          onPress={() => setActiveActivitiesTab("completed")}
        />
        <TabButton
          title="Organized"
          isActive={activeActivitiesTab === "organized"}
          onPress={() => setActiveActivitiesTab("organized")}
        />
      </View>

      {activeActivitiesTab === "completed" && (
        <View style={styles.activitiesContent}>
          <Text style={styles.activitiesCount}>
            {completedActivities.length} Completed Activities
          </Text>
          {completedActivities.length > 0 ? (
            completedActivities.map((activity, index) => (
              <View key={index} style={styles.activityCard}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
                <Text style={styles.activityLocation}>{activity.location}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>No completed activities yet</Text>
            </View>
          )}
        </View>
      )}

      {activeActivitiesTab === "organized" && (
        <View style={styles.activitiesContent}>
          <Text style={styles.activitiesCount}>
            {organizedActivities.length} Organized Activities
          </Text>
          {organizedActivities.length > 0 ? (
            organizedActivities.map((activity, index) => (
              <View key={index} style={styles.activityCard}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
                <Text style={styles.activityLocation}>{activity.location}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No organized activities yet</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.reviewsTitle}>Activity Reviews</Text>
        <View style={styles.reviewsStats}>
          <Text style={styles.reviewsRating}>⭐ {profileData.rating}</Text>
          <Text style={styles.reviewsCount}>
            ({profileData.reviews} reviews)
          </Text>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
            }}
            style={styles.reviewerImage}
          />
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>Alex M.</Text>
            <Text style={styles.reviewDate}>2 weeks ago</Text>
          </View>
          <Text style={styles.reviewRating}>⭐⭐⭐⭐⭐</Text>
        </View>
        <Text style={styles.reviewText}>
          Great climbing partner! Very experienced and patient. KOKO helped me
          improve my technique and made the session really enjoyable. Highly
          recommend!
        </Text>
        <Text style={styles.reviewActivity}>Peak District Climbing Trip</Text>
      </View>
    </View>
  );

  const renderClubsSection = () => (
    <View style={styles.clubsSection}>
      <Text style={styles.sectionLabel}>Clubs & Communities</Text>
      <View style={styles.clubsGrid}>
        <View style={styles.clubCard}>
          <Image
            source={{
              uri: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fcce50dcf455a49d6aa9a7694c8a58f26?format=webp&width=800",
            }}
            style={styles.clubImage}
          />
          <Text style={styles.clubName}>Westway Climbing</Text>
        </View>
        <View style={styles.clubCard}>
          <Image
            source={{
              uri: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c?format=webp&width=800",
            }}
            style={styles.clubImage}
          />
          <Text style={styles.clubName}>Oxford Cycling</Text>
        </View>
      </View>
    </View>
  );

  const renderLocationSection = () => (
    <View style={styles.locationSection}>
      <Text style={styles.sectionLabel}>Location</Text>
      <View style={styles.locationCard}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{profileData.location}</Text>
      </View>
    </View>
  );

  const renderMainTabs = () => (
    <View style={styles.mainTabs}>
      <TabButton
        title="Sports & Licensing"
        isActive={activeTab === "sports"}
        onPress={() => setActiveTab("sports")}
      />
      <TabButton
        title="Activities & Reviews"
        isActive={activeTab === "activities"}
        onPress={() => setActiveTab("activities")}
      />
      <TabButton
        title="Reviews"
        isActive={activeTab === "reviews"}
        onPress={() => setActiveTab("reviews")}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderStatusBar()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderProfileSection()}
        {renderMainTabs()}
        {renderTabContent()}
        {renderClubsSection()}
        {renderLocationSection()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Followers Modal */}
      <Modal
        visible={showFollowers}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFollowers(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.followModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Followers</Text>
              <TouchableOpacity onPress={() => setShowFollowers(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.comingSoon}>Followers list coming soon!</Text>
          </View>
        </View>
      </Modal>

      {/* Following Modal */}
      <Modal
        visible={showFollowing}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFollowing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.followModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Following</Text>
              <TouchableOpacity onPress={() => setShowFollowing(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.comingSoon}>Following list coming soon!</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  statusBar: {
    height: 44,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  statusTime: {
    color: "#000000",
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
    backgroundColor: "#000000",
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
    borderColor: "#000000",
    borderRadius: 2,
  },
  batteryTip: {
    width: 2,
    height: 4,
    backgroundColor: "#000000",
    borderRadius: 1,
    marginLeft: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: "#000000",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  settingsIcon: {
    fontSize: 24,
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  profileBio: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starIcon: {
    fontSize: 16,
  },
  sportTags: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sportTag: {
    backgroundColor: "#1F381F",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sportTagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  personalDetails: {
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    width: "45%",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  languagesSection: {
    marginTop: 16,
  },
  languagesContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  languageFlag: {
    fontSize: 24,
  },
  mainTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#1F381F",
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#1F381F",
    fontWeight: "600",
  },
  tabContent: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sportTabButtons: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 4,
  },
  sportContent: {
    gap: 16,
  },
  skillCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  skillDetails: {
    gap: 12,
  },
  skillItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  skillValue: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
  },
  activitiesTabButtons: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 4,
  },
  activitiesContent: {
    gap: 16,
  },
  activitiesCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  reviewsStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewsRating: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  reviewsCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  reviewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  reviewDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  reviewRating: {
    fontSize: 16,
  },
  reviewText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewActivity: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  clubsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  clubsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  clubCard: {
    alignItems: "center",
    gap: 8,
  },
  clubImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  clubName: {
    fontSize: 12,
    color: "#000000",
    textAlign: "center",
  },
  locationSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  locationIcon: {
    fontSize: 20,
  },
  locationText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  followModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  modalClose: {
    fontSize: 24,
    color: "#6B7280",
  },
  comingSoon: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 32,
  },
});

export default ProfileScreen;
