import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { designTokens, commonStyles } from '../styles/designTokens';

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Mobile Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusRight}>
          <View style={styles.signalBars}>
            {[1,2,3,4].map(i => (
              <View key={i} style={styles.signalBar} />
            ))}
          </View>
          <View style={styles.battery} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Explore!</Text>
            <View style={styles.connectionStatus}>
              <View style={styles.connectionDot} />
              <Text style={styles.connectionText}>Connected to backend</Text>
            </View>
          </View>

          {/* Location Selector */}
          <TouchableOpacity style={styles.locationButton}>
            <Icon name="map-pin" size={24} color="#000000" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Chosen location</Text>
              <Text style={styles.locationValue}>Notting hill, London</Text>
            </View>
            <Icon name="chevron-down" size={24} color="#000000" />
          </TouchableOpacity>

          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#000000" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search activities..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#6B7280"
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Icon name="filter" size={16} color="#000000" />
              <Text style={styles.filterText}>Filter</Text>
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>1</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapButton}>
              <Icon name="map-pin" size={16} color="#ffffff" />
              <Text style={styles.mapText}>Map</Text>
            </TouchableOpacity>
          </View>

          {/* Active Filters */}
          <View style={styles.activeFilters}>
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Cycling</Text>
              <TouchableOpacity style={styles.filterRemove}>
                <Icon name="x" size={12} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Climbing</Text>
              <TouchableOpacity style={styles.filterRemove}>
                <Icon name="x" size={12} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent activities nearby</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.emptyMessage}>Change filters to see more activities...</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activitiesScroll}>
              {/* Activity Card 1 */}
              <View style={styles.activityCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.activityTitle}>Westway women's+ climbing morning</Text>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>Intermediate</Text>
                  </View>
                </View>
                <View style={styles.organizerSection}>
                  <View style={styles.avatar} />
                  <Text style={styles.organizerText}>By Community</Text>
                </View>
                <View style={styles.activityDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailEmoji}>📅</Text>
                    <Text style={styles.detailText}>26 January 2025</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailEmoji}>📍</Text>
                    <Text style={styles.detailText}>London, UK</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Request to join</Text>
                </TouchableOpacity>
              </View>

              {/* Activity Card 2 */}
              <View style={styles.activityCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.activityTitle}>Sport climbing trip</Text>
                  <View style={[styles.difficultyBadge, styles.advancedBadge]}>
                    <Text style={styles.difficultyText}>Advanced</Text>
                  </View>
                </View>
                <View style={styles.organizerSection}>
                  <View style={styles.avatar} />
                  <Text style={styles.organizerText}>By Community</Text>
                </View>
                <View style={styles.activityDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailEmoji}>📅</Text>
                    <Text style={styles.detailText}>15 February 2025</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailEmoji}>📍</Text>
                    <Text style={styles.detailText}>Malham Cove, UK</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Request to join</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.white,
  },
  
  statusBar: {
    height: 44,
    backgroundColor: designTokens.colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  
  statusTime: {
    fontSize: 14,
    fontWeight: '500',
    color: designTokens.colors.black,
  },
  
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  signalBars: {
    flexDirection: 'row',
    gap: 2,
  },
  
  signalBar: {
    width: 4,
    height: 12,
    backgroundColor: designTokens.colors.black,
    borderRadius: 1,
  },
  
  battery: {
    width: 24,
    height: 16,
    borderWidth: 1,
    borderColor: designTokens.colors.black,
    borderRadius: 2,
    marginLeft: 4,
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: designTokens.colors.primary,
    fontFamily: 'Cabin',
  },
  
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  
  connectionDot: {
    width: 8,
    height: 8,
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  
  connectionText: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
    fontFamily: 'Cabin',
  },
  
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    marginBottom: 24,
    borderRadius: 8,
  },
  
  locationInfo: {
    flex: 1,
  },
  
  locationLabel: {
    fontSize: 12,
    color: designTokens.colors.black,
    fontFamily: 'Poppins',
  },
  
  locationValue: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
    fontFamily: 'Poppins',
  },
  
  searchSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  
  searchInput: {
    backgroundColor: designTokens.colors.white,
    borderWidth: 2,
    borderColor: designTokens.colors.black,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    paddingLeft: 44,
    fontFamily: 'Cabin',
    fontSize: 16,
  },
  
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  
  filterButton: {
    backgroundColor: designTokens.colors.gray[200],
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  
  filterText: {
    fontSize: 14,
    color: designTokens.colors.black,
    fontFamily: 'Cabin',
  },
  
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: designTokens.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  filterBadgeText: {
    fontSize: 12,
    color: designTokens.colors.white,
    fontWeight: 'bold',
  },
  
  mapButton: {
    backgroundColor: designTokens.colors.primary,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  mapText: {
    fontSize: 14,
    color: designTokens.colors.white,
    fontFamily: 'Cabin',
  },
  
  activeFilters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  
  filterChip: {
    backgroundColor: designTokens.colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  filterChipText: {
    fontSize: 14,
    color: designTokens.colors.white,
    fontFamily: 'Cabin',
  },
  
  filterRemove: {
    marginLeft: 4,
  },
  
  clearAllText: {
    fontSize: 14,
    color: designTokens.colors.primary,
    textDecorationLine: 'underline',
    fontFamily: 'Cabin',
  },
  
  section: {
    marginBottom: 32,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: designTokens.colors.black,
    fontFamily: 'Poppins',
  },
  
  seeAllText: {
    fontSize: 14,
    color: designTokens.colors.black,
    textDecorationLine: 'underline',
    fontFamily: 'Poppins',
  },
  
  emptyMessage: {
    textAlign: 'center',
    color: designTokens.colors.text.secondary,
    fontFamily: 'Cabin',
    paddingVertical: 16,
  },
  
  activitiesScroll: {
    marginBottom: 16,
  },
  
  activityCard: {
    width: 288,
    borderWidth: 2,
    borderColor: designTokens.colors.primary,
    borderRadius: 8,
    padding: 16,
    backgroundColor: designTokens.colors.white,
    marginRight: 8,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: designTokens.colors.black,
    fontFamily: 'Cabin',
    flex: 1,
    marginRight: 8,
  },
  
  difficultyBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  
  advancedBadge: {
    backgroundColor: '#FEE2E2',
  },
  
  difficultyText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    fontFamily: 'Cabin',
  },
  
  organizerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: designTokens.colors.gray[200],
    borderWidth: 1,
    borderColor: designTokens.colors.black,
  },
  
  organizerText: {
    fontSize: 14,
    color: designTokens.colors.text.secondary,
    fontFamily: 'Cabin',
  },
  
  activityDetails: {
    gap: 8,
    marginBottom: 16,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  detailEmoji: {
    fontSize: 16,
  },
  
  detailText: {
    fontSize: 14,
    color: designTokens.colors.black,
    fontFamily: 'Cabin',
  },
  
  joinButton: {
    backgroundColor: designTokens.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  joinButtonText: {
    fontSize: 14,
    color: designTokens.colors.white,
    fontWeight: '500',
    fontFamily: 'Cabin',
  },
});
