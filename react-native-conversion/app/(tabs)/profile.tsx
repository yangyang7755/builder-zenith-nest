import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Modal,
} from 'react-native';

// Import shared constants and utils
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/shared/constants';
import { calculateAge } from '../../src/shared/utils';

export default function Profile() {
  const [refreshing, setRefreshing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"sports" | "activities" | "reviews">("sports");
  const [activeSportTab, setActiveSportTab] = useState<"climbing" | "cycling" | "running">("climbing");

  // Demo profile data (matching web)
  const profileData = {
    full_name: "KOKO",
    profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face",
    bio: "Passionate climber and outdoor enthusiast from Oxford. Love exploring new routes and meeting fellow adventurers!",
    age: 15,
    gender: "Female",
    nationality: "United Kingdom",
    profession: "STUDENT",
    location: "Oxford, UK",
    sports: ["Cycling", "Climbing", "Running"],
    languages: ["🇪🇸", "🇬🇧", "🇨🇳"],
    followers: 125,
    following: 87,
    rating: 5.0,
    reviews: 1,
    climbingLevel: "Advanced",
    climbingExperience: "3+ years",
    cyclingLevel: "Intermediate",
    cyclingExperience: "2+ years",
    runningLevel: "Beginner",
    runningExperience: "1+ year",
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Status Bar Component (matching web)
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

  // Header Component
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity>
        <Text style={styles.backButton}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Profile</Text>
      <TouchableOpacity>
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );

  // Profile Section
  const ProfileSection = () => (
    <View style={styles.profileSection}>
      {/* Profile Header */}
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
              <Text key={index} style={styles.languageFlag}>{lang}</Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  // Tab Button Component
  const TabButton = ({ title, isActive, onPress, icon }: { title: string; isActive: boolean; onPress: () => void; icon?: string }) => (
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

  // Main Tabs
  const MainTabs = () => (
    <View style={styles.mainTabs}>
      <TabButton
        title="Sports & Licensing"
        isActive={activeTab === "sports"}
        onPress={() => setActiveTab("sports")}
      />
      <TabButton
        title="Activities"
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

  // Sports Tab Content
  const SportsTabContent = () => (
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
                <Text style={styles.skillValue}>{profileData.climbingLevel}</Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillLabel}>Experience</Text>
                <Text style={styles.skillValue}>{profileData.climbingExperience}</Text>
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
    </View>
  );

  // Clubs Section
  const ClubsSection = () => (
    <View style={styles.clubsSection}>
      <Text style={styles.sectionLabel}>Clubs & Communities</Text>
      <View style={styles.clubsGrid}>
        <View style={styles.clubCard}>
          <Image
            source={{ uri: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fcce50dcf455a49d6aa9a7694c8a58f26?format=webp&width=800" }}
            style={styles.clubImage}
          />
          <Text style={styles.clubName}>Westway Climbing</Text>
        </View>
        <View style={styles.clubCard}>
          <Image
            source={{ uri: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c?format=webp&width=800" }}
            style={styles.clubImage}
          />
          <Text style={styles.clubName}>Oxford Cycling</Text>
        </View>
      </View>
    </View>
  );

  // Location Section
  const LocationSection = () => (
    <View style={styles.locationSection}>
      <Text style={styles.sectionLabel}>Location</Text>
      <View style={styles.locationCard}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{profileData.location}</Text>
      </View>
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
        <Header />
        <ProfileSection />
        <MainTabs />
        {activeTab === "sports" && <SportsTabContent />}
        <ClubsSection />
        <LocationSection />
        
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
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
    color: COLORS.text,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sportTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sportTagText: {
    color: COLORS.textInverse,
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
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
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
    borderBottomColor: COLORS.border,
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
    borderBottomColor: COLORS.primary,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  tabContent: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sportTabButtons: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 4,
  },
  sportContent: {
    gap: 16,
  },
  skillCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
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
    color: COLORS.textSecondary,
  },
  skillValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
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
    color: COLORS.text,
    textAlign: "center",
  },
  locationSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  locationIcon: {
    fontSize: 20,
  },
  locationText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  followModal: {
    backgroundColor: COLORS.background,
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
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  comingSoon: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: 32,
  },
});
