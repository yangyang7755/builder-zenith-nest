import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { designTokens } from "../styles/designTokens";

const { width } = Dimensions.get("window");

interface Sport {
  sport: string;
  level: string;
  experience?: string;
  maxGrade?: string;
  certifications?: string[];
  specialties?: string[];
  skills?: string[];
  distance?: string;
  pace?: string;
  goals?: string;
  preferences?: string[];
}

interface Activity {
  id: string;
  title: string;
  activity_type: string;
  date: string;
  organizer_name: string;
  recent_review?: {
    rating: number;
    comment: string;
    reviewer_name?: string;
  };
  average_rating?: number;
  total_reviews?: number;
  participant_count?: number;
}

interface Club {
  id: string;
  name: string;
  profileImage?: string;
  memberCount: number;
}

interface ProfileData {
  full_name: string;
  profile_image?: string;
  bio?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  institution?: string;
  occupation?: string;
  location?: string;
  sports?: Sport[];
  languages?: string[];
  followers: number;
  following: number;
  rating: number;
  reviews: number;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"completed" | "organized">(
    "completed",
  );
  const [activeSportTab, setActiveSportTab] = useState<string>("climbing");

  // Demo data - replace with actual data fetching
  const [profileData] = useState<ProfileData>({
    full_name: "Maddie Wei",
    profile_image:
      "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fb4460a1279a84ad1b10626393196b1cf?format=webp&width=800",
    bio: "Passionate climber and outdoor enthusiast from Oxford. Love exploring new routes and meeting fellow adventurers!",
    age: 22,
    gender: "Female",
    nationality: "British",
    institution: "Oxford University",
    occupation: "Student",
    location: "Oxford, UK",
    sports: [
      {
        sport: "Climbing",
        level: "Advanced",
        experience: "3 years",
        maxGrade: "7a",
        certifications: ["Lead Climbing", "Belaying"],
        specialties: ["Bouldering", "Sport Climbing"],
        skills: ["Route Reading", "Mental Game", "Technique"],
      },
      {
        sport: "Cycling",
        level: "Intermediate",
        experience: "2 years",
        distance: "30-50km",
        pace: "25km/h",
        preferences: ["Road Cycling", "Scenic Routes"],
      },
    ],
    followers: 152,
    following: 87,
    rating: 4.8,
    reviews: 23,
  });

  const [completedActivities] = useState<Activity[]>([
    {
      id: "1",
      title: "Westway Climbing Session",
      activity_type: "climbing",
      date: "2024-01-15",
      organizer_name: "Holly Smith",
      recent_review: {
        rating: 5,
        comment: "Amazing climbing session!",
      },
    },
    {
      id: "2",
      title: "Richmond Park Cycling",
      activity_type: "cycling",
      date: "2024-01-10",
      organizer_name: "Marcus Rodriguez",
      recent_review: {
        rating: 4,
        comment: "Great route and company",
      },
    },
  ]);

  const [organizedActivities] = useState<Activity[]>([
    {
      id: "3",
      title: "Oxford Bouldering Meet",
      activity_type: "climbing",
      date: "2024-01-20",
      organizer_name: "Maddie Wei",
      average_rating: 4.7,
      total_reviews: 12,
      participant_count: 15,
    },
  ]);

  const [userClubs] = useState<Club[]>([
    {
      id: "1",
      name: "Oxford University Climbing Club",
      profileImage:
        "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c",
      memberCount: 245,
    },
  ]);

  useEffect(() => {
    if (profileData.sports && profileData.sports.length > 0) {
      setActiveSportTab(profileData.sports[0].sport.toLowerCase());
    }
  }, [profileData.sports]);

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

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="star"
            size={size}
            color={star <= Math.floor(rating) ? "#FBBF24" : "#D1D5DB"}
            style={star <= Math.floor(rating) ? styles.filledStar : {}}
          />
        ))}
      </View>
    );
  };

  const getSportData = (sportName: string) => {
    return profileData.sports?.find(
      (s) => s.sport.toLowerCase() === sportName.toLowerCase(),
    );
  };

  const renderPersonalDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personal Details</Text>
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Gender:</Text>
          <Text style={styles.detailValue}>{profileData.gender}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Age:</Text>
          <Text style={styles.detailValue}>{profileData.age} years old</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Nationality:</Text>
          <Text style={styles.detailValue}>{profileData.nationality}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Profession:</Text>
          <Text style={styles.detailValue}>{profileData.occupation}</Text>
        </View>
        <View style={[styles.detailItem, styles.fullWidth]}>
          <Text style={styles.detailLabel}>Institution:</Text>
          <Text style={styles.detailValue}>{profileData.institution}</Text>
        </View>
      </View>
    </View>
  );

  const renderSportsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sports & Licensing</Text>

      {/* Sport Tabs */}
      <View style={styles.tabContainer}>
        {profileData.sports?.map((sport, index) => {
          const sportKey = sport.sport.toLowerCase();
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                activeSportTab === sportKey && styles.activeTab,
              ]}
              onPress={() => setActiveSportTab(sportKey)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeSportTab === sportKey && styles.activeTabText,
                ]}
              >
                {getSportEmoji(sport.sport)} {sport.sport}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sport Content */}
      {profileData.sports?.map((sport, index) => {
        const sportKey = sport.sport.toLowerCase();
        if (activeSportTab !== sportKey) return null;

        return (
          <View key={index} style={styles.sportCard}>
            <View style={styles.sportHeader}>
              <Text style={styles.sportName}>{sport.sport}</Text>
              <View
                style={[
                  styles.levelBadge,
                  sport.level === "Expert" || sport.level === "Professional"
                    ? styles.expertLevel
                    : sport.level === "Advanced"
                      ? styles.advancedLevel
                      : sport.level === "Intermediate"
                        ? styles.intermediateLevel
                        : styles.beginnerLevel,
                ]}
              >
                <Text style={styles.levelText}>
                  {sport.level || "Beginner"}
                </Text>
              </View>
            </View>

            <View style={styles.sportDetails}>
              {sport.experience && (
                <View style={styles.sportDetailItem}>
                  <Text style={styles.detailLabel}>Experience:</Text>
                  <Text style={styles.detailValue}>{sport.experience}</Text>
                </View>
              )}

              {/* Climbing specific */}
              {sportKey === "climbing" && (
                <>
                  {sport.maxGrade && (
                    <View style={styles.sportDetailItem}>
                      <Text style={styles.detailLabel}>Max Grade:</Text>
                      <Text style={styles.detailValue}>{sport.maxGrade}</Text>
                    </View>
                  )}
                  {sport.certifications && sport.certifications.length > 0 && (
                    <View style={styles.sportDetailItem}>
                      <Text style={styles.detailLabel}>Certifications:</Text>
                      <Text style={styles.detailValue}>
                        {sport.certifications.join(", ")}
                      </Text>
                    </View>
                  )}
                  {sport.specialties && sport.specialties.length > 0 && (
                    <View style={styles.sportDetailItem}>
                      <Text style={styles.detailLabel}>Specialties:</Text>
                      <Text style={styles.detailValue}>
                        {sport.specialties.join(", ")}
                      </Text>
                    </View>
                  )}
                </>
              )}

              {/* Cycling/Running specific */}
              {(sportKey === "cycling" || sportKey === "running") && (
                <>
                  {sport.distance && (
                    <View style={styles.sportDetailItem}>
                      <Text style={styles.detailLabel}>Avg Distance:</Text>
                      <Text style={styles.detailValue}>{sport.distance}</Text>
                    </View>
                  )}
                  {sport.pace && (
                    <View style={styles.sportDetailItem}>
                      <Text style={styles.detailLabel}>
                        {sportKey === "cycling"
                          ? "Preferred Pace:"
                          : "Best Pace:"}
                      </Text>
                      <Text style={styles.detailValue}>{sport.pace}</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Skills/Preferences tags */}
            {(sport.skills || sport.preferences) && (
              <View style={styles.tagsContainer}>
                {(sport.skills || sport.preferences || []).map(
                  (tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ),
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  const renderActivitiesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Activities & Reviews</Text>
        <Text style={styles.totalCount}>
          {completedActivities.length + organizedActivities.length} total
        </Text>
      </View>

      {/* Activity Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed Activities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "organized" && styles.activeTab]}
          onPress={() => setActiveTab("organized")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "organized" && styles.activeTabText,
            ]}
          >
            Organized Activities
          </Text>
        </TouchableOpacity>
      </View>

      {/* Activity Content */}
      <View style={styles.activitiesContainer}>
        {activeTab === "completed" ? (
          completedActivities.length > 0 ? (
            completedActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityEmoji}>
                    {getSportEmoji(activity.activity_type)}
                  </Text>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>
                      {activity.organizer_name} •{" "}
                      {new Date(activity.date).toLocaleDateString()}
                    </Text>
                    {activity.recent_review && (
                      <View style={styles.reviewContainer}>
                        {renderStars(activity.recent_review.rating, 12)}
                        <Text style={styles.reviewComment}>
                          Your review: "{activity.recent_review.comment}"
                        </Text>
                      </View>
                    )}
                  </View>
                  <Icon name="check-circle" size={20} color="#10B981" />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No completed activities yet</Text>
              <Text style={styles.emptySubtitle}>
                Join activities from the explore page to see them here!
              </Text>
            </View>
          )
        ) : organizedActivities.length > 0 ? (
          organizedActivities.map((activity) => (
            <View
              key={activity.id}
              style={[styles.activityCard, styles.organizedActivity]}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityEmoji}>
                  {getSportEmoji(activity.activity_type)}
                </Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>
                    You organized •{" "}
                    {new Date(activity.date).toLocaleDateString()}
                  </Text>
                  <View style={styles.organizerStats}>
                    {renderStars(activity.average_rating || 0, 12)}
                    <Text style={styles.organizerRating}>
                      {(activity.average_rating || 0).toFixed(1)} avg rating (
                      {activity.total_reviews || 0} reviews)
                    </Text>
                  </View>
                </View>
                <Text style={styles.participantCount}>
                  {activity.participant_count} joined
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No organized activities yet</Text>
            <Text style={styles.emptySubtitle}>
              Create activities to help others discover new adventures!
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderClubsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Clubs</Text>
      {userClubs.length > 0 ? (
        <View style={styles.clubsContainer}>
          {userClubs.map((club) => (
            <TouchableOpacity key={club.id} style={styles.clubCard}>
              <Image
                source={{ uri: club.profileImage }}
                style={styles.clubImage}
              />
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.clubMembers}>
                  {club.memberCount} members
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Icon name="users" size={32} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No clubs joined yet</Text>
          <Text style={styles.emptySubtitle}>
            Explore clubs to connect with like-minded outdoor enthusiasts!
          </Text>
          <TouchableOpacity style={styles.exploreButton}>
            <Icon name="search" size={16} color="white" />
            <Text style={styles.exploreButtonText}>Explore Clubs</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings" as never)}
        >
          <Icon name="settings" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileTop}>
            <Image
              source={{ uri: profileData.profile_image }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.full_name}</Text>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <TouchableOpacity onPress={() => setShowFollowers(true)}>
                  <Text style={styles.statText}>
                    {profileData.followers} Followers
                  </Text>
                </TouchableOpacity>
                <Text style={styles.statDivider}>•</Text>
                <TouchableOpacity onPress={() => setShowFollowing(true)}>
                  <Text style={styles.statText}>
                    {profileData.following} Following
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Rating */}
              <TouchableOpacity style={styles.ratingContainer}>
                {renderStars(profileData.rating)}
                <Text style={styles.ratingText}>
                  {profileData.rating.toFixed(1)} ({profileData.reviews}{" "}
                  reviews)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Activity Tags */}
          <View style={styles.tagsContainer}>
            {profileData.sports?.slice(0, 3).map((sport, index) => (
              <View key={index} style={styles.sportTag}>
                <Text style={styles.sportTagText}>{sport.sport}</Text>
              </View>
            ))}
            {profileData.occupation && (
              <View style={styles.occupationTag}>
                <Text style={styles.occupationTagText}>
                  {profileData.occupation}
                </Text>
              </View>
            )}
          </View>

          {/* Bio */}
          {profileData.bio && <Text style={styles.bio}>{profileData.bio}</Text>}
        </View>

        {renderPersonalDetails()}
        {renderSportsSection()}
        {renderActivitiesSection()}
        {renderClubsSection()}

        {/* Location */}
        {profileData.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <Icon name="map-pin" size={20} color="#6B7280" />
              <Text style={styles.locationText}>{profileData.location}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Followers Modal */}
      <Modal visible={showFollowers} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFollowers(false)}>
              <Icon name="arrow-left" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Followers</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {/* Demo followers would go here */}
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No followers yet</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Following Modal */}
      <Modal visible={showFollowing} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFollowing(false)}>
              <Icon name="arrow-left" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Following</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {/* Demo following would go here */}
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Not following anyone yet</Text>
            </View>
          </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
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
    alignItems: "center",
    marginRight: 8,
  },
  filledStar: {
    color: "#FBBF24",
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
    backgroundColor: designTokens.colors.primary,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalCount: {
    fontSize: 14,
    color: "#6B7280",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  activeTabText: {
    color: designTokens.colors.primary,
  },
  sportCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
  },
  sportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sportName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expertLevel: {
    backgroundColor: designTokens.colors.primary,
  },
  advancedLevel: {
    backgroundColor: "#F97316",
  },
  intermediateLevel: {
    backgroundColor: "#EAB308",
  },
  beginnerLevel: {
    backgroundColor: "#3B82F6",
  },
  levelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  sportDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sportDetailItem: {
    width: "45%",
  },
  tag: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    color: "#1D4ED8",
    fontSize: 12,
  },
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
  },
  organizedActivity: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: designTokens.colors.primary,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
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
    marginBottom: 4,
  },
  reviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  reviewComment: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  organizerStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  organizerRating: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  participantCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  clubsContainer: {
    gap: 12,
  },
  clubCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  clubImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  clubMembers: {
    fontSize: 14,
    color: "#6B7280",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#F3F4F6",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: designTokens.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
});

export default ProfileScreen;
