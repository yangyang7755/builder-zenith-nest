import React from "react";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ActivitiesProvider } from "./contexts/ActivitiesContext";
import { FollowProvider } from "./contexts/FollowContext";

// Import screens
import AuthLandingScreen from "./screens/AuthLandingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ExploreScreen from "./screens/ExploreScreen";
import ActivitiesScreen from "./screens/ActivitiesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AnimatedSplash from "./components/AnimatedSplash";
import SettingsScreen from "./screens/SettingsScreen";

// Simple placeholder components for screens that haven't been converted yet
const CreateScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Create Activity</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon!</Text>
  </View>
);

const OnboardingScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Onboarding</Text>
    <Text style={styles.placeholderSubtext}>Complete your profile setup</Text>
  </View>
);

const ActivityDetailsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Activity Details</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon!</Text>
  </View>
);

const ProfileEditScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Edit Profile</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon!</Text>
  </View>
);

// Navigation Type Definitions
export type RootStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Explore: undefined;
  Activities: undefined;
  Create: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
  AllFeatures: undefined;
  ClubsList: undefined;
  ClubDetails: { clubId: string } | undefined;
  Followers: undefined;
  Following: undefined;
};

export type ExploreStackParamList = {
  ExploreMain: undefined;
  ActivityDetails: { activityId: string };
};

export type ActivitiesStackParamList = {
  ActivitiesMain: undefined;
  ActivityDetails: { activityId: string };
  Saved: undefined;
  CategoryActivities: undefined;
  MapActivities: undefined;
  PartnerDetails: undefined;
  CarShareDetails: undefined;
};

// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const ExploreStack = createStackNavigator<ExploreStackParamList>();
const ActivitiesStack = createStackNavigator<ActivitiesStackParamList>();

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { userId?: string; clubId?: string } | undefined;
};
const ChatStack = createStackNavigator<ChatStackParamList>();

// Create stack types and navigator
export type CreateStackParamList = {
  CreateTemplates: undefined;
  CreateActivity: { type: string };
};
const CreateStack = createStackNavigator<CreateStackParamList>();

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="AllFeatures" component={AllFeaturesScreen} />
      <ProfileStack.Screen name="ClubsList" component={ClubsListScreen} />
      <ProfileStack.Screen name="ClubDetails" component={ClubDetailsScreen} />
      <ProfileStack.Screen name="Followers" component={FollowersScreen} />
      <ProfileStack.Screen name="Following" component={FollowingScreen} />
    </ProfileStack.Navigator>
  );
}

// Explore Stack Navigator
function ExploreStackNavigator() {
  return (
    <ExploreStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ExploreStack.Screen name="ExploreMain" component={ExploreScreen} />
      <ExploreStack.Screen
        name="ActivityDetails"
        component={ActivityDetailsScreen}
      />
    </ExploreStack.Navigator>
  );
}

// Activities Stack Navigator
function ActivitiesStackNavigator() {
  return (
    <ActivitiesStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ActivitiesStack.Screen
        name="ActivitiesMain"
        component={ActivitiesScreen}
      />
      <ActivitiesStack.Screen
        name="ActivityDetails"
        component={ActivityDetailsScreen}
      />
      <ActivitiesStack.Screen name="Saved" component={SavedScreen} />
      <ActivitiesStack.Screen
        name="CategoryActivities"
        component={CategoryActivitiesScreen}
      />
      <ActivitiesStack.Screen
        name="MapActivities"
        component={MapActivitiesScreen}
      />
      <ActivitiesStack.Screen
        name="PartnerDetails"
        component={PartnerDetailsScreen}
      />
      <ActivitiesStack.Screen
        name="CarShareDetails"
        component={CarShareDetailsScreen}
      />
    </ActivitiesStack.Navigator>
  );
}

import CreateTemplatesScreen from "./screens/CreateTemplatesScreen";
import ChatListScreen from "./screens/ChatListScreen";
import ChatRoomScreen from "./screens/ChatRoomScreen";
import ClubsListScreen from "./screens/ClubsListScreen";
import ClubDetailsScreen from "./screens/ClubDetailsScreen";
import FollowersScreen from "./screens/FollowersScreen";
import FollowingScreen from "./screens/FollowingScreen";
import CategoryActivitiesScreen from "./screens/CategoryActivitiesScreen";
import MapActivitiesScreen from "./screens/MapActivitiesScreen";
import PartnerDetailsScreen from "./screens/PartnerDetailsScreen";
import CarShareDetailsScreen from "./screens/CarShareDetailsScreen";
import AllFeaturesScreen from "./screens/AllFeaturesScreen";
import SavedScreen from "./screens/SavedScreen";
import CreateActivityScreen from "./screens/CreateActivityScreen";

// Create Stack Navigator
function CreateStackNavigator() {
  return (
    <CreateStack.Navigator screenOptions={{ headerShown: false }}>
      <CreateStack.Screen
        name="CreateTemplates"
        component={CreateTemplatesScreen}
      />
      <CreateStack.Screen
        name="CreateActivity"
        component={CreateActivityScreen}
      />
    </CreateStack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </ChatStack.Navigator>
  );
}

// Main Tab Navigator (matches web bottom navigation)
function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconText;
          switch (route.name) {
            case "Explore":
              iconText = "🏠";
              break;
            case "Activities":
              iconText = "⏰";
              break;
            case "Create":
              iconText = "➕";
              break;
            case "Chat":
              iconText = "💬";
              break;
            case "Profile":
              iconText = "👤";
              break;
            default:
              iconText = "🏠";
          }
          return (
            <View style={styles.tabIconContainer}>
              <Text
                style={[
                  styles.tabIcon,
                  { fontSize: size, opacity: focused ? 1 : 0.6 },
                ]}
              >
                {iconText}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: "#1F381F",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <MainTab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{ tabBarLabel: "Explore" }}
      />
      <MainTab.Screen
        name="Create"
        component={CreateStackNavigator}
        options={{ tabBarLabel: "Create" }}
      />
      <MainTab.Screen
        name="Activities"
        component={ActivitiesStackNavigator}
        options={{ tabBarLabel: "Activities" }}
      />
      <MainTab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{ tabBarLabel: "Chat" }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: "Profile" }}
      />
    </MainTab.Navigator>
  );
}

// Root Navigator (handles auth flow)
function RootNavigator() {
  return (
    <RootStack.Navigator
      initialRouteName="AuthLanding"
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="SignUp" component={SignUpScreen} />
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
    </RootStack.Navigator>
  );
}

// Keep the native splash screen visible while we set up JS and show animated splash
SplashScreen.preventAutoHideAsync().catch(() => {});

// Main App Component
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <FollowProvider>
          <ActivitiesProvider>
            {showSplash ? (
              <AnimatedSplash
                sourceUrl="https://cdn.builder.io/o/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F9cad890b588b4e8cbd2726cd71167932?alt=media&token=891d3039-c642-45c7-a19e-083d196ae503&apiKey=f84d5d174b6b486a8c8b5017bb90c068"
                onFinish={() => setShowSplash(false)}
              />
            ) : (
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            )}
          </ActivitiesProvider>
        </FollowProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    textAlign: "center",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F381F",
    marginBottom: 8,
    textAlign: "center",
  },
  placeholderSubtext: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
