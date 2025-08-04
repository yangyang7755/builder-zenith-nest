# Interactive Map Implementation

## 🗺️ Overview

This project now includes a real interactive map system that works both in web browsers and can be easily converted to React Native mobile apps. The map displays activity locations with interactive markers, user location tracking, and full navigation controls.

## 🎯 Features

### Web Implementation (`InteractiveMap.tsx`)
- **Real Interactive Maps**: Powered by Mapbox GL JS with full zoom, pan, and rotation
- **Multiple Map Styles**: Streets, satellite, outdoors, and light themes
- **Activity Markers**: Custom markers for different activity types with color coding
- **User Location**: GPS location tracking with permission handling
- **Interactive Popups**: Detailed activity information on marker click
- **Navigation Controls**: Zoom, reset view, fit to activities, go to user location
- **Responsive Design**: Optimized for mobile and desktop interfaces

### React Native Implementation (`InteractiveMapNative.tsx`)
- **Native Maps**: Uses `react-native-maps` for iOS/Android compatibility
- **Platform Optimization**: Proper styling and controls for mobile devices
- **Touch Gestures**: Native touch interactions for zoom, pan, and marker selection
- **Callout Views**: Native-style activity information popups
- **Location Services**: Integrated with device GPS and location permissions
- **Map Types**: Standard, satellite, and hybrid map views

## 🚀 Setup Instructions

### 1. Mapbox Configuration (Web)

#### Get Mapbox Access Token:
1. Visit [mapbox.com](https://mapbox.com) and create a free account
2. Go to your [account dashboard](https://account.mapbox.com/access-tokens/)
3. Copy your "Default public token" (starts with `pk.`)
4. Free tier includes 50,000 map loads per month

#### Configure Environment:
```bash
# Add to your .env file
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ciIsImEiOiJjbGV4YW1wbGUifQ.example

# Or use DevServerControl tool
# Set environment variable: VITE_MAPBOX_ACCESS_TOKEN
```

#### Verify Setup:
- Visit `/database-management` → Maps tab
- Use the Mapbox Configuration component to test your token
- Interactive maps will be available once configured

### 2. React Native Setup (Mobile)

#### Install Dependencies:
```bash
# For basic maps
npm install react-native-maps

# For advanced Mapbox features (optional)
npm install @react-native-mapbox-gl/maps
```

#### iOS Configuration:
1. Add MapKit framework to your iOS project
2. Add location permissions to `Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby activities</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby activities</string>
```

#### Android Configuration:
1. Get Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```
3. Add location permissions:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## 🎨 Component Architecture

### Web Components

#### `InteractiveMap.tsx`
- Main interactive map component for web
- Uses Mapbox GL JS for full-featured mapping
- Handles user interactions, markers, and popups
- Responsive design with mobile-optimized controls

#### `MapView.tsx`
- Smart wrapper that chooses between interactive and fallback maps
- Automatically detects Mapbox token availability
- Provides smooth fallback to `EnhancedMapView` when needed
- Includes configuration guidance for users

#### `MapboxConfig.tsx`
- Configuration interface for Mapbox setup
- Token validation and testing
- Setup instructions and troubleshooting
- Environment variable management

### React Native Components

#### `InteractiveMapNative.tsx`
- Native map implementation using react-native-maps
- Platform-specific optimizations for iOS and Android
- Native touch gestures and animations
- Proper styling for mobile interfaces

## 🔧 Technical Details

### Map Markers
Each activity type has a unique marker style:
```typescript
const getActivityMarkerStyle = (type: string) => {
  const styles = {
    cycling: { color: '#3B82F6', emoji: '🚴' },
    running: { color: '#EF4444', emoji: '🏃' },
    climbing: { color: '#F59E0B', emoji: '🧗' },
    hiking: { color: '#10B981', emoji: '🥾' },
    swimming: { color: '#06B6D4', emoji: '🏊' },
    tennis: { color: '#8B5CF6', emoji: '🎾' },
    // ... more activity types
  };
  return styles[type.toLowerCase()] || { color: '#6B7280', emoji: '⚡' };
};
```

### Coordinate System
- Uses standard GPS coordinates (latitude, longitude)
- Automatic coordinate generation for demo activities
- Haversine formula for distance calculations
- Proper bounds calculation for fitting multiple markers

### Performance Optimizations
- Lazy loading of map components
- Efficient marker clustering for large datasets
- Optimized re-renders with React.memo and useCallback
- Proper cleanup of map instances and event listeners

## 🎯 Usage Examples

### Basic Map Integration
```typescript
import InteractiveMap from './components/InteractiveMap';

function MyComponent() {
  const [showMap, setShowMap] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowMap(true)}>
        Show Map
      </button>
      
      {showMap && (
        <InteractiveMap
          activities={activities}
          onClose={() => setShowMap(false)}
          onActivitySelect={(activity) => {
            console.log('Selected activity:', activity);
          }}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}
```

### React Native Integration
```typescript
import InteractiveMapNative from './components/InteractiveMapNative';

function MapScreen() {
  return (
    <InteractiveMapNative
      activities={activities}
      onClose={() => navigation.goBack()}
      onActivitySelect={(activity) => {
        navigation.navigate('ActivityDetails', { activity });
      }}
      userLocation={userLocation}
    />
  );
}
```

## 🔍 Troubleshooting

### Common Issues

#### "Map not loading" (Web)
- Check if VITE_MAPBOX_ACCESS_TOKEN is set correctly
- Verify token is valid using the configuration component
- Ensure token has appropriate permissions
- Check browser console for specific error messages

#### "Map shows placeholder" (Web)
- Mapbox token is missing or invalid
- Use the database management interface to configure
- Falls back to EnhancedMapView automatically

#### "Map not working" (React Native)
- Ensure react-native-maps is properly linked
- Check platform-specific configuration (API keys, permissions)
- Verify location permissions are granted
- Test on device (not simulator) for GPS features

#### "Markers not showing"
- Check if activities have valid coordinates
- Verify coordinate format (lat/lng numbers)
- Check map bounds and zoom level
- Ensure activities array is not empty

### Debug Information
- Use browser dev tools to check console errors
- Test token validity in the configuration interface
- Use the health check endpoints for API status
- Check network connectivity for map tile loading

## 📱 Mobile Conversion Guide

### Converting to React Native

1. **Replace Web Components**:
   - `InteractiveMap.tsx` → `InteractiveMapNative.tsx`
   - Remove Mapbox GL JS dependencies
   - Use react-native-maps instead

2. **Update Styling**:
   - Convert CSS classes to StyleSheet
   - Use React Native Flexbox layout
   - Implement proper touch targets for mobile

3. **Handle Platform Differences**:
   - iOS: Use MapKit integration
   - Android: Use Google Maps integration
   - Handle permissions properly for each platform

4. **Navigation Integration**:
   - Use React Navigation for screen transitions
   - Implement proper back button handling
   - Integrate with device navigation apps

### Performance Considerations
- Use FlatList for large marker datasets
- Implement marker clustering for dense areas
- Optimize image loading for marker icons
- Use proper memory management for map instances

## 🔄 Future Enhancements

### Planned Features
- **Offline Maps**: Cached map tiles for offline usage
- **Route Planning**: Turn-by-turn navigation to activities
- **Clustering**: Automatic marker clustering for dense areas
- **Custom Tiles**: Organization-specific map overlays
- **Heat Maps**: Activity density visualization
- **AR Integration**: Augmented reality activity discovery

### Integration Opportunities
- **Calendar Sync**: Show activities on map by date
- **Weather Overlay**: Real-time weather information
- **Traffic Data**: Live traffic conditions for route planning
- **Social Features**: Friend locations and shared activities
- **Geofencing**: Location-based notifications and alerts

---

The interactive map system provides a solid foundation for both web and mobile applications, with proper fallbacks and configuration options for different deployment scenarios.
