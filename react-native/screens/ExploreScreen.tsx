import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Image,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Import contexts (will be created)
import { useActivities } from "../contexts/ActivitiesContext";
import { useAuth } from "../contexts/AuthContext";
import { useFollow } from "../contexts/FollowContext";

const { width: screenWidth } = Dimensions.get("window");

interface FilterOptions {
  activityType: string[];
  numberOfPeople: { min: number; max: number };
  location: string;
  locationRange: number;
  date: { start: string; end: string };
  gender: string[];
  age: { min: number; max: number };
  gear: string[];
  pace: { min: number; max: number };
  distance: { min: number; max: number };
  elevation: { min: number; max: number };
  clubOnly: boolean;
}

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activities, searchActivities, loading, error, refreshActivities } =
    useActivities();
  const { user } = useAuth();
  const { following, isFollowing } = useFollow();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [isSearching, setIsSearching] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(
    "Notting hill, London",
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const formatActivityDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get activities from followed users
  const getActivitiesFromFollowedUsers = () => {
    if (following.length === 0) return [];

    const followedUserIds = following.map((rel) => rel.following_id);
    const followedUserNames = following
      .map((rel) => rel.following?.full_name)
      .filter(Boolean);

    return activities.filter((activity) => {
      const organizerId = activity.organizer_id || activity.organizer?.id;
      const organizerName =
        activity.organizer?.full_name || activity.organizerName;

      return (
        followedUserIds.includes(organizerId) ||
        followedUserNames.includes(organizerName)
      );
    });
  };

  const activitiesFromFollowedUsers = getActivitiesFromFollowedUsers();

  // Helper function to check if organizer is followed
  const isOrganizerFollowed = (activity: any) => {
    const organizerId = activity.organizer_id || activity.organizer?.id;
    const organizerName =
      activity.organizer?.full_name || activity.organizerName;

    return following.some(
      (rel) =>
        rel.following_id === organizerId ||
        rel.following?.full_name === organizerName,
    );
  };

  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const toggleActivityType = (type: string) => {
    setFilters((prev) => {
      const selected = prev.activityType.includes(type)
        ? prev.activityType.filter((t) => t !== type)
        : [...prev.activityType, type];
      return { ...prev, activityType: selected };
    });
  };

  useEffect(() => {
    let filtered = activities;

    if (searchQuery.trim()) {
      filtered = searchActivities(searchQuery);
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    // Apply comprehensive filters (same logic as web)
    if (filters.activityType.length > 0) {
      filtered = filtered.filter((activity) => {
        const activityType = activity.type || activity.activity_type;
        return filters.activityType.some(
          (type) =>
            activityType === type.toLowerCase() ||
            activityType === type ||
            (type === "Cycling" && activityType === "cycling") ||
            (type === "Climbing" && activityType === "climbing") ||
            (type === "Running" && activityType === "running") ||
            (type === "Hiking" && activityType === "hiking") ||
            (type === "Skiing" && activityType === "skiing") ||
            (type === "Surfing" && activityType === "surfing") ||
            (type === "Tennis" && activityType === "tennis") ||
            (type === "General" && activityType === "general"),
        );
      });
    }

    // Filter by date range
    if (filters.date.start || filters.date.end) {
      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.date);
        const startDate = filters.date.start
          ? new Date(filters.date.start)
          : null;
        const endDate = filters.date.end ? new Date(filters.date.end) : null;

        if (startDate && activityDate < startDate) return false;
        if (endDate && activityDate > endDate) return false;
        return true;
      });
    }

    // Filter by location (text search)
    if (filters.location && !filters.location.includes("Current Location")) {
      filtered = filtered.filter(
        (activity) =>
          activity.location
            .toLowerCase()
            .includes(filters.location.toLowerCase()) ||
          activity.meetupLocation
            .toLowerCase()
            .includes(filters.location.toLowerCase()),
      );
    }

    // Filter by number of people
    filtered = filtered.filter((activity) => {
      const maxPeople = parseInt(activity.maxParticipants) || 50;
      return (
        maxPeople >= filters.numberOfPeople.min &&
        maxPeople <= filters.numberOfPeople.max
      );
    });

    // Filter by gender
    if (filters.gender.length > 0) {
      if (filters.gender.includes("Female only")) {
        filtered = filtered.filter(
          (activity) => activity.gender === "Female only",
        );
      } else {
        filtered = filtered.filter(
          (activity) =>
            activity.gender !== "Female only" ||
            filters.gender.includes(activity.gender || "All genders"),
        );
      }
    }

    setFilteredActivities(filtered);
  }, [searchQuery, activities, searchActivities, filters]);

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
    await refreshActivities();
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
      <Text style={styles.headerTitle}>Explore!</Text>

      {/* Backend Status Indicator */}
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
            <TouchableOpacity
              onPress={refreshActivities}
              style={styles.retryButton}
            >
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

  const renderLocationSelector = () => (
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

  const renderFilterBar = () => (
    <View>
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
              <Text style={styles.filterBadgeText}>
                {getActiveFilterCount()}
              </Text>
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

      {/* Selected Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {[
          "Cycling",
          "Climbing",
          "Running",
          "Hiking",
          "Skiing",
          "Surfing",
          "Tennis",
          "General",
        ].map((type) => {
          const selected = filters.activityType.includes(type);
          return (
            <TouchableOpacity
              key={type}
              onPress={() => toggleActivityType(type)}
              style={[
                styles.chip,
                selected ? styles.chipSelected : styles.chipUnselected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selected
                    ? styles.chipTextSelected
                    : styles.chipTextUnselected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderActivityCard = (activity: any, index: number) => (
    <TouchableOpacity
      key={activity.id || index}
      style={styles.activityCard}
      onPress={() => {
        // Navigate to activity details
        // navigation.navigate('ActivityDetails', { activityId: activity.id });
      }}
    >
      {/* Header with title and badges */}
      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle} numberOfLines={2}>
          {activity.title}
        </Text>
        <View style={styles.activityBadges}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveIcon}>🔖</Text>
          </TouchableOpacity>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>
              {activity.difficulty ||
                activity.difficulty_level ||
                "Intermediate"}
            </Text>
          </View>
          {isOrganizerFollowed(activity) && (
            <View style={styles.followingBadge}>
              <Text style={styles.followingText}>👥 Following</Text>
            </View>
          )}
        </View>
      </View>

      {/* Organizer info */}
      <View style={styles.organizerInfo}>
        <Image
          source={{
            uri:
              activity.imageSrc ||
              activity.organizer?.profile_image ||
              "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
          }}
          style={styles.organizerImage}
        />
        <View style={styles.organizerDetails}>
          <Text style={styles.organizerName}>
            By{" "}
            {activity.organizer?.full_name ||
              activity.organizerName ||
              "Community"}
          </Text>
        </View>
      </View>

      {/* Date and Location */}
      <View style={styles.activityMeta}>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>
            {formatActivityDate(activity.date)}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText}>{activity.location}</Text>
        </View>
      </View>

      {/* Activity Metrics for cycling */}
      {(activity.type === "cycling" || activity.activity_type === "cycling") &&
        (activity.distance || activity.pace || activity.elevation) && (
          <View style={styles.metricsContainer}>
            {activity.distance && (
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Distance</Text>
                <View style={styles.metricValue}>
                  <Text style={styles.metricIcon}>🚴</Text>
                  <Text style={styles.metricText}>{activity.distance}</Text>
                </View>
              </View>
            )}
            {activity.pace && (
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Pace</Text>
                <View style={styles.metricValue}>
                  <Text style={styles.metricIcon}>⚡</Text>
                  <Text style={styles.metricText}>{activity.pace}</Text>
                </View>
              </View>
            )}
            {activity.elevation && (
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Elevation</Text>
                <View style={styles.metricValue}>
                  <Text style={styles.metricIcon}>⛰️</Text>
                  <Text style={styles.metricText}>{activity.elevation}</Text>
                </View>
              </View>
            )}
          </View>
        )}

      {/* Participation button */}
      <View style={styles.participationSection}>
        <View style={styles.participantCount}>
          <Text style={styles.participantText}>
            0/{activity.maxParticipants || activity.max_participants || 10}{" "}
            participants
          </Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Request to join</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderPartnerRequestCard = (partner: any, index: number) => (
    <TouchableOpacity key={index} style={styles.partnerCard}>
      <Text style={styles.partnerTitle}>{partner.title}</Text>
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
        <Text style={styles.partnerButtonText}>Connect</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderClubLogo = (club: any, index: number) => (
    <TouchableOpacity key={index} style={styles.clubLogo}>
      <Image source={{ uri: club.src }} style={styles.clubImage} />
    </TouchableOpacity>
  );

  const renderCarShareCard = (carShare: any, index: number) => (
    <TouchableOpacity key={index} style={styles.carShareCard}>
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
    </TouchableOpacity>
  );

  // Demo data (same as web)
  const partnerRequests = [
    {
      title: "Looking for a belay partner...",
      name: "Sarah K.",
      age: 28,
      climbingLevel: "5.9-5.11",
      date: "📅 Friday evenings",
      location: "📍 Westway Climbing Centre",
      description:
        "Looking for a regular climbing partner for Friday evening sessions. I'm working on lead climbing and could use someone experienced.",
      imageSrc:
        "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Climbing buddy needed!",
      name: "Alex M.",
      age: 35,
      climbingLevel: "V4-V6 Bouldering",
      date: "📅 Monday evenings",
      location: "📍 The Castle Climbing Centre",
      description:
        "Experienced boulderer looking for motivation and someone to work projects with. Happy to share beta and spot!",
      imageSrc:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const myClubs = [
    {
      src: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fcce50dcf455a49d6aa9a7694c8a58f26?format=webp&width=800",
      alt: "Westway climbing gym",
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c?format=webp&width=800",
      alt: "Oxford university cycling club",
    },
  ];

  const discoverClubs = [
    {
      src: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F88bca9c7cd744a57bb7cf584dcc74c21?format=webp&width=800",
      alt: "Rapha Cycling Club London",
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2Fce3624672f324cdbb888f18e32d8b72d?format=webp&width=800",
      alt: "VauxWall East Climbing Centre",
    },
  ];

  const carShares = [
    {
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
        <View style={styles.content}>
          {renderHeader()}
          {renderLocationSelector()}
          {renderFilterBar()}

          {/* All Activities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isSearching
                  ? `Search Results (${filteredActivities.length})`
                  : "Recent activities nearby"}
              </Text>
              {!isSearching && (
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* No Activities Message */}
            {!isSearching && filteredActivities.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Change filters to see more activities...
                </Text>
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {/* Show search results or backend activities */}
              {isSearching ? (
                filteredActivities.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      No activities found matching "{searchQuery}"
                    </Text>
                  </View>
                ) : (
                  filteredActivities.map(renderActivityCard)
                )
              ) : activities.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No activities yet</Text>
                  <TouchableOpacity style={styles.createButton}>
                    <Text style={styles.createButtonText}>Create Activity</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                activities.map(renderActivityCard)
              )}
            </ScrollView>
          </View>

          {/* Activities from Followed Users Section */}
          {!isSearching && activitiesFromFollowedUsers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  From people you follow ({activitiesFromFollowedUsers.length})
                </Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.verticalList}>
                {activitiesFromFollowedUsers
                  .slice(0, 3)
                  .map((activity, index) => (
                    <View
                      key={activity.id}
                      style={styles.followingActivityWrapper}
                    >
                      <View style={styles.followingBadgeContainer}>
                        <View style={styles.followingActivityBadge}>
                          <Text style={styles.followingBadgeText}>
                            👥 Following
                          </Text>
                        </View>
                      </View>
                      {renderActivityCard(activity, index)}
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* Partner Requests Section */}
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
              {partnerRequests.map(renderPartnerRequestCard)}
            </ScrollView>
          </View>

          {/* My Clubs Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your clubs & communities</Text>
            <View style={styles.clubsContainer}>
              {myClubs.map(renderClubLogo)}
            </View>
          </View>

          {/* Discover More Clubs Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discover local clubs</Text>
            <View style={styles.clubsContainer}>
              {discoverClubs.map(renderClubLogo)}
            </View>
            <Text style={styles.clubsNote}>
              Request to join clubs to see their activities and events
            </Text>
          </View>

          {/* Car Sharing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Car sharing for trips</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {carShares.map(renderCarShareCard)}
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select your preferred location for finding activities
            </Text>

            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.currentLocationButton}
                disabled={isGettingLocation}
              >
                <Text style={styles.currentLocationIcon}>📍</Text>
                <Text style={styles.currentLocationText}>
                  {isGettingLocation
                    ? "Getting location..."
                    : "Use Current Location"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.orText}>or choose from popular areas</Text>

              {[
                "Notting hill, London",
                "Shoreditch, London",
                "Camden, London",
                "Westminster, London",
                "Canary Wharf, London",
                "Greenwich, London",
                "Richmond, London",
                "Clapham, London",
              ].map((location) => (
                <TouchableOpacity
                  key={location}
                  onPress={() => {
                    setCurrentLocation(location);
                    setShowLocationModal(false);
                  }}
                  style={styles.locationOption}
                >
                  <Text style={styles.locationOptionText}>{location}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal - Simplified for now */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              <Text style={styles.filterSectionTitle}>Activity Type</Text>
              <Text style={styles.comingSoonText}>
                Comprehensive filters coming soon...
              </Text>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  // Clear filters logic
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
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
    color: "#1F381F",
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
    backgroundColor: "#F59E0B",
  },
  statusError: {
    backgroundColor: "#EF4444",
  },
  statusConnected: {
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusErrorText: {
    color: "#EF4444",
  },
  retryButton: {
    marginLeft: 8,
  },
  retryText: {
    color: "#1F381F",
    textDecorationLine: "underline",
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 24,
    backgroundColor: "#F9FAFB",
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
    color: "#000000",
  },
  locationValue: {
    fontSize: 14,
    color: "#6B7280",
  },
  chevronDown: {
    fontSize: 20,
    color: "#000000",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
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
    color: "#000000",
  },
  clearIcon: {
    fontSize: 16,
    color: "#6B7280",
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
    color: "#000000",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#1F381F",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  mapButton: {
    backgroundColor: "#1F381F",
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
    color: "#FFFFFF",
  },
  chipsScroll: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  chip: {
    borderWidth: 2,
    borderColor: "#1F381F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  chipSelected: {
    backgroundColor: "#E5F4EA",
    borderColor: "#1F381F",
  },
  chipUnselected: {
    backgroundColor: "#FFFFFF",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#1F381F",
  },
  chipTextUnselected: {
    color: "#1F381F",
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
    color: "#000000",
  },
  seeAllText: {
    fontSize: 14,
    color: "#000000",
    textDecorationLine: "underline",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: "#1F381F",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  horizontalScroll: {
    paddingRight: 16,
    gap: 8,
  },
  verticalList: {
    gap: 16,
  },
  activityCard: {
    width: 288,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#1F381F",
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F381F",
    flex: 1,
    paddingRight: 8,
  },
  activityBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButton: {
    padding: 4,
  },
  saveIcon: {
    fontSize: 16,
  },
  difficultyBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "500",
  },
  followingBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  followingText: {
    fontSize: 10,
    color: "#1E40AF",
    fontWeight: "500",
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  organizerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#000000",
  },
  organizerDetails: {
    flex: 1,
  },
  organizerName: {
    fontSize: 14,
    color: "#6B7280",
  },
  activityMeta: {
    gap: 8,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 14,
    color: "#000000",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  metric: {
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  metricValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  participationSection: {
    gap: 8,
  },
  participantCount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantText: {
    fontSize: 12,
    color: "#6B7280",
  },
  joinButton: {
    backgroundColor: "#1F381F",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  followingActivityWrapper: {
    position: "relative",
  },
  followingBadgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  followingActivityBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  followingBadgeText: {
    fontSize: 12,
    color: "#1E40AF",
    fontWeight: "500",
  },
  partnerCard: {
    width: 240,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
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
    color: "#000000",
  },
  partnerAge: {
    fontSize: 12,
    color: "#6B7280",
  },
  partnerLevel: {
    fontSize: 12,
    color: "#6B7280",
  },
  partnerDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  partnerLocation: {
    fontSize: 12,
    color: "#6B7280",
  },
  partnerDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
  },
  partnerButton: {
    backgroundColor: "#1F381F",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  partnerButtonText: {
    color: "#FFFFFF",
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
    color: "#6B7280",
    marginTop: 8,
  },
  carShareCard: {
    width: 200,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
  },
  carShareDestination: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  carShareDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  carShareTime: {
    fontSize: 14,
    color: "#6B7280",
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
    color: "#000000",
  },
  carShareSeats: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  carShareCost: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F381F",
    marginBottom: 12,
  },
  carShareButton: {
    backgroundColor: "#1F381F",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  carShareButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  locationModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
  },
  filterModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
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
    color: "#1F381F",
  },
  modalClose: {
    fontSize: 24,
    color: "#6B7280",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    padding: 16,
  },
  modalContent: {
    padding: 16,
    gap: 12,
  },
  currentLocationButton: {
    backgroundColor: "#1F381F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  currentLocationIcon: {
    fontSize: 16,
  },
  currentLocationText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  orText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
    marginVertical: 8,
  },
  locationOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  locationOptionText: {
    fontSize: 16,
    color: "#000000",
  },
  cancelButton: {
    marginTop: 16,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#6B7280",
    textDecorationLine: "underline",
  },
  filterContent: {
    padding: 16,
    maxHeight: 400,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 32,
  },
  filterActions: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    alignItems: "center",
  },
  clearFiltersText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#1F381F",
    borderRadius: 8,
    alignItems: "center",
  },
  applyFiltersText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ExploreScreen;
