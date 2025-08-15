import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { designTokens } from '../styles/designTokens';
import { useActivities } from '../contexts/ActivitiesContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

const { width } = Dimensions.get('window');

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
  images?: string[];
  average_rating?: number;
  total_reviews?: number;
}

interface Club {
  id: string;
  name: string;
  description: string;
  members: number;
  activity_type: string;
  image: string;
}

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activities, isLoading, fetchActivities } = useActivities();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [featuredActivities, setFeaturedActivities] = useState<Activity[]>([]);
  const [featuredClubs] = useState<Club[]>([
    {
      id: '1',
      name: 'Oxford University Climbing Club',
      description: 'Premier climbing community at Oxford',
      members: 245,
      activity_type: 'climbing',
      image: 'https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F2ef8190dcf74499ba685f251b701545c',
    },
    {
      id: '2',
      name: 'London Cycling Network',
      description: 'Explore London on two wheels',
      members: 432,
      activity_type: 'cycling',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    },
  ]);

  const categories = [
    { id: 'all', name: 'All', icon: 'grid', emoji: '🎯' },
    { id: 'climbing', name: 'Climbing', icon: 'mountain', emoji: '🧗' },
    { id: 'cycling', name: 'Cycling', icon: 'circle', emoji: '🚴' },
    { id: 'running', name: 'Running', icon: 'zap', emoji: '👟' },
    { id: 'hiking', name: 'Hiking', icon: 'map', emoji: '🥾' },
    { id: 'skiing', name: 'Skiing', icon: 'triangle', emoji: '⛷️' },
    { id: 'surfing', name: 'Surfing', icon: 'waves', emoji: '🌊' },
    { id: 'tennis', name: 'Tennis', icon: 'circle', emoji: '🎾' },
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    // Set featured activities (first 3)
    setFeaturedActivities(activities.slice(0, 3));
  }, [activities]);

  const getFilteredActivities = () => {
    let filtered = activities;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(activity => 
        activity.activity_type.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.organizer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderFeaturedActivity = ({ item: activity }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigation.navigate('ActivityDetail' as never, { activityId: activity.id } as never)}
    >
      <Image
        source={{ 
          uri: activity.images?.[0] || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400'
        }}
        style={styles.featuredImage}
      />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredCategory}>
            {categories.find(c => c.id === activity.activity_type)?.emoji} {activity.activity_type}
          </Text>
          <Text style={styles.featuredTitle}>{activity.title}</Text>
          <View style={styles.featuredDetails}>
            <View style={styles.featuredDetail}>
              <Icon name="calendar" size={12} color="#FFFFFF" />
              <Text style={styles.featuredDetailText}>{formatDate(activity.date)}</Text>
            </View>
            <View style={styles.featuredDetail}>
              <Icon name="map-pin" size={12} color="#FFFFFF" />
              <Text style={styles.featuredDetailText}>{activity.location.split(',')[0]}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActivityCard = ({ item: activity }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => navigation.navigate('ActivityDetail' as never, { activityId: activity.id } as never)}
    >
      <Image
        source={{ 
          uri: activity.images?.[0] || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400'
        }}
        style={styles.activityImage}
      />
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          {activity.price && (
            <Text style={styles.activityPrice}>£{activity.price}</Text>
          )}
        </View>
        
        <View style={styles.activityMeta}>
          <View style={styles.activityDetail}>
            <Icon name="calendar" size={14} color={designTokens.colors.text.secondary} />
            <Text style={styles.activityDetailText}>
              {formatDate(activity.date)} • {activity.time}
            </Text>
          </View>
          <View style={styles.activityDetail}>
            <Icon name="map-pin" size={14} color={designTokens.colors.text.secondary} />
            <Text style={styles.activityDetailText}>{activity.location}</Text>
          </View>
          <View style={styles.activityDetail}>
            <Icon name="users" size={14} color={designTokens.colors.text.secondary} />
            <Text style={styles.activityDetailText}>
              {activity.current_participants}/{activity.max_participants} joined
            </Text>
          </View>
        </View>

        <View style={styles.activityFooter}>
          <View style={styles.organizerInfo}>
            <Avatar 
              uri={activity.organizer_image} 
              name={activity.organizer_name} 
              size="sm" 
            />
            <Text style={styles.organizerName}>{activity.organizer_name}</Text>
          </View>
          {activity.average_rating && (
            <View style={styles.rating}>
              <Icon name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{activity.average_rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <Badge 
          variant="primary" 
          size="sm" 
          style={styles.skillBadge}
        >
          {activity.skill_level}
        </Badge>
      </View>
    </TouchableOpacity>
  );

  const renderClubCard = ({ item: club }: { item: Club }) => (
    <TouchableOpacity
      style={styles.clubCard}
      onPress={() => navigation.navigate('ClubDetail' as never, { clubId: club.id } as never)}
    >
      <Image source={{ uri: club.image }} style={styles.clubImage} />
      <View style={styles.clubContent}>
        <Text style={styles.clubName}>{club.name}</Text>
        <Text style={styles.clubDescription}>{club.description}</Text>
        <View style={styles.clubMeta}>
          <Icon name="users" size={14} color={designTokens.colors.text.secondary} />
          <Text style={styles.clubMembers}>{club.members} members</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Explore</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications' as never)}>
            <Icon name="bell" size={24} color={designTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={designTokens.colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities, locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={designTokens.colors.text.secondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color={designTokens.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                  activeCategory === category.id && styles.activeCategoryCard
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Text style={[
                  styles.categoryEmoji,
                  activeCategory === category.id && styles.activeCategoryEmoji
                ]}>
                  {category.emoji}
                </Text>
                <Text style={[
                  styles.categoryName,
                  activeCategory === category.id && styles.activeCategoryName
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Activities */}
        {featuredActivities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Activities</Text>
            <FlatList
              data={featuredActivities}
              renderItem={renderFeaturedActivity}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            />
          </View>
        )}

        {/* Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === 'all' ? 'All Activities' : `${categories.find(c => c.id === activeCategory)?.name} Activities`}
            </Text>
            <Text style={styles.sectionCount}>
              {getFilteredActivities().length} found
            </Text>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading activities...</Text>
            </View>
          ) : getFilteredActivities().length > 0 ? (
            <FlatList
              data={getFilteredActivities()}
              renderItem={renderActivityCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.activitiesContainer}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No activities found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? `No activities match "${searchQuery}"`
                  : `No ${activeCategory === 'all' ? '' : activeCategory} activities available`
                }
              </Text>
            </View>
          )}
        </View>

        {/* Featured Clubs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Clubs</Text>
          <FlatList
            data={featuredClubs}
            renderItem={renderClubCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clubsContainer}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: designTokens.colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: designTokens.colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: designTokens.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: designTokens.colors.text.primary,
  },
  sectionCount: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: designTokens.colors.gray[100],
    minWidth: 80,
  },
  activeCategoryCard: {
    backgroundColor: designTokens.colors.primary,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeCategoryEmoji: {
    // No change needed for emoji
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: designTokens.colors.text.secondary,
  },
  activeCategoryName: {
    color: designTokens.colors.white,
  },
  featuredContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  featuredCard: {
    width: width * 0.8,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredCategory: {
    fontSize: 12,
    color: designTokens.colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: designTokens.colors.white,
    marginBottom: 8,
  },
  featuredDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  featuredDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredDetailText: {
    fontSize: 12,
    color: designTokens.colors.white,
    opacity: 0.9,
  },
  activitiesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  activityCard: {
    backgroundColor: designTokens.colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...designTokens.shadows.md,
  },
  activityImage: {
    width: '100%',
    height: 160,
  },
  activityContent: {
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: designTokens.colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  activityPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: designTokens.colors.primary,
  },
  activityMeta: {
    gap: 6,
    marginBottom: 12,
  },
  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityDetailText: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  organizerName: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: designTokens.colors.text.secondary,
  },
  skillBadge: {
    alignSelf: 'flex-start',
  },
  clubsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  clubCard: {
    width: width * 0.7,
    backgroundColor: designTokens.colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...designTokens.shadows.md,
  },
  clubImage: {
    width: '100%',
    height: 120,
  },
  clubContent: {
    padding: 16,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: designTokens.colors.text.primary,
    marginBottom: 4,
  },
  clubDescription: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
    marginBottom: 8,
  },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubMembers: {
    fontSize: 12,
    color: designTokens.colors.text.secondary,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: designTokens.colors.text.secondary,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: designTokens.colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
});

export default ExploreScreen;
