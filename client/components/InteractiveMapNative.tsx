/**
 * React Native Compatible Interactive Map Component
 * 
 * This component is designed to work with React Native using:
 * - react-native-maps for iOS/Android
 * - react-native-mapbox-gl for advanced features
 * 
 * To use in React Native, install:
 * npm install react-native-maps @react-native-mapbox-gl/maps
 * 
 * For iOS: Add MapKit framework
 * For Android: Add Google Maps API key
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Alert,
  Platform
} from 'react-native';

// React Native imports (conditionally imported)
let MapView: any;
let Marker: any;
let Callout: any;
let PROVIDER_GOOGLE: any;

try {
  // Try to import React Native Maps
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  Callout = RNMaps.Callout;
  PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
} catch (error) {
  // Fallback for web environment
  console.log('React Native Maps not available, using web fallback');
}

// For web environment, we'll use a placeholder
const WebMapPlaceholder = ({ children, style, ...props }: any) => (
  <div style={{ ...style, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Interactive Map</div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        This component is optimized for React Native mobile apps
      </div>
    </div>
  </div>
);

interface Activity {
  id: string;
  title: string;
  type: string;
  location: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: string;
  organizer: string;
  coordinates?: { lat: number; lng: number };
  distance?: number;
}

interface InteractiveMapNativeProps {
  activities: Activity[];
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
  initialCenter?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
}

const { width, height } = Dimensions.get('window');

// Default map center (London)
const DEFAULT_CENTER = { 
  latitude: 51.5074, 
  longitude: -0.1278,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function InteractiveMapNative({ 
  activities, 
  onClose, 
  onActivitySelect,
  initialCenter = { lat: 51.5074, lng: -0.1278 },
  userLocation 
}: InteractiveMapNativeProps) {
  const mapRef = useRef<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [region, setRegion] = useState({
    latitude: initialCenter.lat,
    longitude: initialCenter.lng,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Activity type styles
  const getActivityMarkerStyle = (type: string) => {
    const styles: { [key: string]: { color: string; emoji: string } } = {
      cycling: { color: '#3B82F6', emoji: '🚴' },
      running: { color: '#EF4444', emoji: '🏃' },
      climbing: { color: '#F59E0B', emoji: '🧗' },
      hiking: { color: '#10B981', emoji: '🥾' },
      swimming: { color: '#06B6D4', emoji: '🏊' },
      tennis: { color: '#8B5CF6', emoji: '🎾' },
      football: { color: '#F97316', emoji: '⚽' },
      yoga: { color: '#EC4899', emoji: '🧘' },
    };
    return styles[type.toLowerCase()] || { color: '#6B7280', emoji: '⚡' };
  };

  // Add coordinates to activities if not present
  const activitiesWithCoords = activities.map((activity) => {
    if (activity.coordinates) return activity;
    
    // Mock coordinates for demo
    const mockCoords = {
      lat: initialCenter.lat + (Math.random() - 0.5) * 0.1,
      lng: initialCenter.lng + (Math.random() - 0.5) * 0.1,
    };
    
    return { ...activity, coordinates: mockCoords };
  });

  // Fit map to show all activities
  const fitToActivities = useCallback(() => {
    if (activitiesWithCoords.length === 0 || !mapRef.current) return;

    const coordinates = activitiesWithCoords
      .filter(activity => activity.coordinates)
      .map(activity => ({
        latitude: activity.coordinates!.lat,
        longitude: activity.coordinates!.lng
      }));

    if (coordinates.length === 0) return;

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  }, [activitiesWithCoords]);

  // Fly to user location
  const flyToUserLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [userLocation]);

  // Handle marker press
  const handleMarkerPress = (activity: Activity) => {
    setSelectedActivity(activity);
    
    if (activity.coordinates && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: activity.coordinates.lat,
        longitude: activity.coordinates.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  // Cycle through map types
  const cycleMapType = () => {
    const types: ('standard' | 'satellite' | 'hybrid')[] = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  // If React Native Maps is not available (web environment), show placeholder
  if (!MapView) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity Map (React Native)</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <WebMapPlaceholder style={{ flex: 1 }} />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Install react-native-maps to enable full functionality on mobile
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Activity Map</Text>
            <Text style={styles.headerSubtitle}>
              {activitiesWithCoords.length} activities shown
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.mapTypeButton} onPress={cycleMapType}>
          <Text style={styles.mapTypeButtonText}>
            {mapType === 'standard' ? '🗺️' : mapType === 'satellite' ? '🛰️' : '🌍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        mapType={mapType}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
      >
        {/* Activity markers */}
        {activitiesWithCoords.map((activity) => {
          if (!activity.coordinates) return null;
          
          const markerStyle = getActivityMarkerStyle(activity.type);
          
          return (
            <Marker
              key={activity.id}
              coordinate={{
                latitude: activity.coordinates.lat,
                longitude: activity.coordinates.lng,
              }}
              title={activity.title}
              description={`${activity.location} • ${activity.date} ${activity.time}`}
              pinColor={markerStyle.color}
              onPress={() => handleMarkerPress(activity)}
            >
              <View style={[styles.markerContainer, { backgroundColor: markerStyle.color }]}>
                <Text style={styles.markerEmoji}>{markerStyle.emoji}</Text>
              </View>
              
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle} numberOfLines={2}>
                    {activity.title}
                  </Text>
                  <Text style={styles.calloutDetails}>
                    📍 {activity.location}
                  </Text>
                  <Text style={styles.calloutDetails}>
                    📅 {activity.date} • ⏰ {activity.time}
                  </Text>
                  <Text style={styles.calloutDetails}>
                    👥 {activity.participants}/{activity.maxParticipants} people
                  </Text>
                  
                  <View style={styles.calloutActions}>
                    <TouchableOpacity 
                      style={styles.calloutButton}
                      onPress={() => onActivitySelect(activity)}
                    >
                      <Text style={styles.calloutButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            title="Your Location"
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={fitToActivities}>
          <Text style={styles.controlButtonText}>📍</Text>
        </TouchableOpacity>
        
        {userLocation && (
          <TouchableOpacity style={styles.controlButton} onPress={flyToUserLocation}>
            <Text style={styles.controlButtonText}>🎯</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected activity info */}
      {selectedActivity && (
        <View style={styles.selectedActivityContainer}>
          <Text style={styles.selectedActivityTitle} numberOfLines={1}>
            {selectedActivity.title}
          </Text>
          <Text style={styles.selectedActivityDetails}>
            {selectedActivity.location} • {selectedActivity.date}
          </Text>
          
          <View style={styles.selectedActivityActions}>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => onActivitySelect(selectedActivity)}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={() => setSelectedActivity(null)}
            >
              <Text style={styles.dismissButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  mapTypeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTypeButtonText: {
    fontSize: 20,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 18,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  calloutDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutActions: {
    marginTop: 8,
  },
  calloutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    top: 120,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButtonText: {
    fontSize: 18,
  },
  selectedActivityContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedActivityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  selectedActivityDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  selectedActivityActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
