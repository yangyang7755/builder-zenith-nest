import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Modal,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useActivities, Activity } from "../contexts/ActivitiesContext";

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onPress, count }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {title}
      {count !== undefined && count > 0 && ` (${count})`}
    </Text>
  </TouchableOpacity>
);

const ActivitiesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const {
    activities,
    getUserParticipatedActivities,
    getUserOrganizedActivities,
    loading,
    refreshActivities,
  } = useActivities();

  const [selectedTab, setSelectedTab] = useState("Saved");
  const [refreshing, setRefreshing] = useState(false);
  const [pastActivitiesNeedingReview, setPastActivitiesNeedingReview] = useState<Activity[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedActivityForReview, setSelectedActivityForReview] = useState<Activity | null>(null);

  // Mock saved activities for now - would integrate with SavedActivitiesContext
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);

  // Sort activities by date (future vs past)
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

  // Get activities user has joined using participation context
  const participatedActivities = getUserParticipatedActivities();

  // Get activities user has organized
  const organizedActivities = getUserOrganizedActivities();

  // Combine participated and organized activities, removing duplicates
  const allJoinedActivities = [
    ...participatedActivities,
    ...organizedActivities.filter(
      (org) => !participatedActivities.some((part) => part.id === org.id),
    ),
  ];

  useEffect(() => {
    if (user && selectedTab === "Joined") {
      loadPastActivitiesNeedingReview();
    }
  }, [user, selectedTab, participatedActivities]);

  const loadPastActivitiesNeedingReview = async () => {
    // Mock implementation for now - would integrate with actual API
    const pastActivities = participatedActivities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate < now;
    });
    
    setPastActivitiesNeedingReview(pastActivities.slice(0, 2)); // Mock some activities needing review
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshActivities();
    setRefreshing(false);
  };

  const handleReviewActivity = (activity: Activity) => {
    setSelectedActivityForReview(activity);
    setShowReviewModal(true);
  };

  const formatActivityDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
      <Text style={styles.headerTitle}>Activities</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TabButton
        title="Saved"
        isActive={selectedTab === "Saved"}
        onPress={() => setSelectedTab("Saved")}
        count={savedActivities.length}
      />
      <TabButton
        title="Joined"
        isActive={selectedTab === "Joined"}
        onPress={() => setSelectedTab("Joined")}
        count={allJoinedActivities.length}
      />
      <TabButton
        title="Organized"
        isActive={selectedTab === "Organized"}
        onPress={() => setSelectedTab("Organized")}
        count={organizedActivities.length}
      />
    </View>
  );

  const renderActivityCard = (activity: Activity, showUnsaveButton = false, showReviewButton = false) => (
    <View style={styles.activityCard}>
      {/* Activity Header */}
      <View style={styles.activityHeader}>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <View style={styles.activityMeta}>
            <Text style={styles.metaItem}>📅 {formatActivityDate(activity.date)}</Text>
            <Text style={styles.metaItem}>📍 {activity.location}</Text>
            <Text style={styles.metaItem}>👥 {activity.organizer}</Text>
          </View>
        </View>
        <Image
          source={{
            uri: activity.imageSrc || "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=60&h=60&fit=crop&crop=face"
          }}
          style={styles.activityImage}
        />
      </View>

      {/* Activity Metrics */}
      {activity.type === "cycling" && (activity.distance || activity.pace || activity.elevation) && (
        <View style={styles.metricsContainer}>
          {activity.distance && (
            <View style={styles.metricItem}>
              <Text style={styles.metricIcon}>🚴</Text>
              <Text style={styles.metricValue}>{activity.distance}</Text>
              <Text style={styles.metricLabel}>Distance</Text>
            </View>
          )}
          {activity.pace && (
            <View style={styles.metricItem}>
              <Text style={styles.metricIcon}>⚡</Text>
              <Text style={styles.metricValue}>{activity.pace}</Text>
              <Text style={styles.metricLabel}>Pace</Text>
            </View>
          )}
          {activity.elevation && (
            <View style={styles.metricItem}>
              <Text style={styles.metricIcon}>⛰️</Text>
              <Text style={styles.metricValue}>{activity.elevation}</Text>
              <Text style={styles.metricLabel}>Elevation</Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // Navigate to activity details
            // navigation.navigate('ActivityDetails', { activityId: activity.id });
          }}
        >
          <Text style={styles.primaryButtonText}>View Details</Text>
        </TouchableOpacity>

        {showUnsaveButton && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              Alert.alert(
                "Unsave Activity",
                "Remove this activity from your saved list?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Unsave",
                    style: "destructive",
                    onPress: () => {
                      // Remove from saved activities
                      setSavedActivities(prev => prev.filter(a => a.id !== activity.id));
                    },
                  },
                ],
              );
            }}
          >
            <Text style={styles.secondaryButtonText}>🔖 Unsave</Text>
          </TouchableOpacity>
        )}

        {showReviewButton && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => handleReviewActivity(activity)}
          >
            <Text style={styles.reviewButtonText}>⭐ Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderReviewPrompts = () => {
    if (pastActivitiesNeedingReview.length === 0) return null;

    return (
      <View style={styles.reviewPromptsContainer}>
        <Text style={styles.reviewPromptsTitle}>Activities to Review</Text>
        <Text style={styles.reviewPromptsSubtitle}>
          Help others by sharing your experience
        </Text>
        {pastActivitiesNeedingReview.map((activity) => (
          <View key={activity.id} style={styles.reviewPromptCard}>
            <View style={styles.reviewPromptInfo}>
              <Text style={styles.reviewPromptTitle}>{activity.title}</Text>
              <Text style={styles.reviewPromptDate}>
                📅 {formatActivityDate(activity.date)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.reviewPromptButton}
              onPress={() => handleReviewActivity(activity)}
            >
              <Text style={styles.reviewPromptButtonText}>Review</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (selectedTab === "Saved") {
      if (savedActivities.length === 0) {
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyTitle}>No Saved Activities</Text>
            <Text style={styles.emptySubtitle}>
              Save activities you're interested in to view them here
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Explore' as never)}
            >
              <Text style={styles.exploreButtonText}>Explore Activities</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          {upcomingSavedActivities.length > 0 ? (
            upcomingSavedActivities.map((activity) =>
              renderActivityCard(activity, true)
            )
          ) : (
            <Text style={styles.emptySubsection}>No upcoming saved activities</Text>
          )}

          <Text style={styles.sectionTitle}>Past Activities</Text>
          {pastSavedActivities.length > 0 ? (
            pastSavedActivities.map((activity) =>
              renderActivityCard(activity, true)
            )
          ) : (
            <Text style={styles.emptySubsection}>No past saved activities</Text>
          )}
        </View>
      );
    }

    if (selectedTab === "Joined") {
      return (
        <View style={styles.contentContainer}>
          {renderReviewPrompts()}
          
          {allJoinedActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No Joined Activities</Text>
              <Text style={styles.emptySubtitle}>
                Join activities to connect with fellow outdoor enthusiasts
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Explore' as never)}
              >
                <Text style={styles.exploreButtonText}>Find Activities</Text>
              </TouchableOpacity>
            </View>
          ) : (
            allJoinedActivities.map((activity) => {
              const isPast = new Date(activity.date) < now;
              const needsReview = isPast && pastActivitiesNeedingReview.some(a => a.id === activity.id);
              return renderActivityCard(activity, false, needsReview);
            })
          )}
        </View>
      );
    }

    if (selectedTab === "Organized") {
      return (
        <View style={styles.contentContainer}>
          {organizedActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyTitle}>No Organized Activities</Text>
              <Text style={styles.emptySubtitle}>
                Create activities to build your community
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => {
                  // Navigate to create activity
                  // navigation.navigate('CreateActivity');
                }}
              >
                <Text style={styles.exploreButtonText}>Create Activity</Text>
              </TouchableOpacity>
            </View>
          ) : (
            organizedActivities.map((activity) =>
              renderActivityCard(activity)
            )
          )}
        </View>
      );
    }

    return null;
  };

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
        {renderTabs()}
        {renderContent()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Activity</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedActivityForReview && (
              <View style={styles.modalContent}>
                <Text style={styles.reviewActivityTitle}>
                  {selectedActivityForReview.title}
                </Text>
                <Text style={styles.reviewActivityDate}>
                  📅 {formatActivityDate(selectedActivityForReview.date)}
                </Text>
                
                <Text style={styles.reviewLabel}>How was your experience?</Text>
                
                <View style={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} style={styles.starButton}>
                      <Text style={styles.starText}>⭐</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity
                  style={styles.submitReviewButton}
                  onPress={() => {
                    // Submit review
                    Alert.alert("Review Submitted", "Thank you for your feedback!");
                    setPastActivitiesNeedingReview(prev => 
                      prev.filter(a => a.id !== selectedActivityForReview.id)
                    );
                    setShowReviewModal(false);
                  }}
                >
                  <Text style={styles.submitReviewText}>Submit Review</Text>
                </TouchableOpacity>
              </View>
            )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
  },
  settingsIcon: {
    fontSize: 24,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#1F381F",
  },
  tabText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#1F381F",
    fontWeight: "600",
  },
  contentContainer: {
    paddingHorizontal: 24,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  emptySubsection: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 24,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  activityInfo: {
    flex: 1,
    paddingRight: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  activityMeta: {
    gap: 4,
  },
  metaItem: {
    fontSize: 14,
    color: "#6B7280",
  },
  activityImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  metricItem: {
    alignItems: "center",
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#1F381F",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  reviewButton: {
    flex: 1,
    backgroundColor: "#FEF3C7",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "500",
  },
  reviewPromptsContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  reviewPromptsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 4,
  },
  reviewPromptsSubtitle: {
    fontSize: 14,
    color: "#92400E",
    marginBottom: 16,
  },
  reviewPromptCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reviewPromptInfo: {
    flex: 1,
  },
  reviewPromptTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  reviewPromptDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  reviewPromptButton: {
    backgroundColor: "#92400E",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  reviewPromptButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: "#1F381F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  reviewModal: {
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
  modalContent: {
    padding: 16,
  },
  reviewActivityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  reviewActivityDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 16,
  },
  starRating: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  starButton: {
    padding: 8,
  },
  starText: {
    fontSize: 32,
  },
  submitReviewButton: {
    backgroundColor: "#1F381F",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitReviewText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ActivitiesScreen;
