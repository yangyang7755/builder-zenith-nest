# WildPals React Native App

This is the React Native version of the WildPals web application, providing a native mobile experience for activity discovery and social networking.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Studio (for Android development)

### Installation

1. **Initialize new Expo project:**
```bash
npx create-expo-app WildPalsRN --template
cd WildPalsRN
```

2. **Install dependencies:**
```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-vector-icons
npm install react-native-gesture-handler react-native-reanimated
npm install @react-native-async-storage/async-storage
npm install expo-linear-gradient expo-image expo-font
```

3. **Copy converted files:**
   - Copy `App.tsx` to your project root
   - Copy `components/` folder
   - Copy `contexts/` folder
   - Copy `screens/` folder (you'll need to create the screen components)

4. **Setup vector icons:**
   - Follow the setup guide for `react-native-vector-icons`
   - For Expo: Icons are included via `@expo/vector-icons`

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 📱 Conversion Progress

### ✅ Completed Components
- **CategoryActivities**: Fully converted with native styling and interactions
- **App Navigation**: React Navigation setup with tab and stack navigators
- **ActivitiesContext**: Converted to use AsyncStorage for persistence
- **Basic Project Structure**: Package.json, navigation, and context setup

### 🔄 In Progress / Needed Components

#### Core Screens (Priority 1)
- [ ] **ExploreScreen** - Main discovery page
- [ ] **ActivitiesScreen** - User's activities (saved, joined, organized)
- [ ] **CreateScreen** - Activity creation flow
- [ ] **ChatScreen** - Messaging interface
- [ ] **ProfileScreen** - User profile and settings

#### Detail Screens (Priority 2)
- [ ] **ActivityDetailScreen** - Individual activity details
- [ ] **SettingsScreen** - App settings and preferences
- [ ] **AuthScreens** - Login/signup flow
- [ ] **OnboardingScreen** - First-time user experience

#### Supporting Components (Priority 3)
- [ ] **ActivityCard** - Reusable activity display component
- [ ] **UserAvatar** - User profile image component
- [ ] **SearchBar** - Enhanced search functionality
- [ ] **FilterSheet** - Bottom sheet for filtering options
- [ ] **MapView** - Activity location visualization

### 🔧 Context Conversions Needed

#### Completed
- ✅ **ActivitiesContext** - Core activity management

#### Pending
- [ ] **AuthContext** - User authentication with secure storage
- [ ] **UserProfileContext** - User profile management
- [ ] **ChatContext** - Real-time messaging
- [ ] **ClubContext** - Club/group management
- [ ] **SavedActivitiesContext** - Bookmarked activities
- [ ] **NotificationContext** - Push notifications

## 🎨 Design System

### Color Palette
```javascript
const colors = {
  primary: '#10B981',      // Explore green
  secondary: '#3B82F6',    // Blue
  accent: '#F59E0B',       // Orange
  purple: '#8B5CF6',       // Purple
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
};
```

### Typography
```javascript
const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};
```

### Spacing
```javascript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

## 📋 Key Differences from Web Version

### Navigation
- **Web**: React Router with URL-based navigation
- **Mobile**: React Navigation with screen-based navigation

### Styling
- **Web**: Tailwind CSS classes
- **Mobile**: StyleSheet objects with flexbox

### Storage
- **Web**: localStorage
- **Mobile**: AsyncStorage

### Icons
- **Web**: Lucide React icons
- **Mobile**: React Native Vector Icons / Expo Icons

### Platform Features
- **Mobile Specific**: Push notifications, camera access, device sensors
- **Gestures**: Touch gestures, swipe actions, pull-to-refresh

## 🚀 Next Steps

1. **Create remaining screens** following the CategoryActivities pattern
2. **Implement proper authentication** with secure token storage
3. **Add push notifications** for activity updates
4. **Integrate maps** for location-based features
5. **Add camera integration** for photo uploads
6. **Implement offline functionality** with local data caching
7. **Add gesture-based interactions** (swipe to join, pull to refresh)
8. **Setup crash reporting** and analytics

## 📱 Platform-Specific Considerations

### iOS
- Follow iOS Human Interface Guidelines
- Use proper safe area handling
- Implement iOS-specific navigation patterns

### Android
- Follow Material Design principles
- Handle Android back button navigation
- Use Android-specific UI patterns

## 🔗 Related Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
