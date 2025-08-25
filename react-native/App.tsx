import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet, Text, View } from "react-native";

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

// Simple placeholder components for screens that haven't been converted yet
const CreateScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Create Activity</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon!</Text>
  </View>
);

const ChatScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Chat</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon!</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Settings</Text>
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
};

export type ExploreStackParamList = {
  ExploreMain: undefined;
  ActivityDetails: { activityId: string };
};

export type ActivitiesStackParamList = {
  ActivitiesMain: undefined;
  ActivityDetails: { activityId: string };
};

// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const ExploreStack = createStackNavigator<ExploreStackParamList>();
const ActivitiesStack = createStackNavigator<ActivitiesStackParamList>();

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
    </ActivitiesStack.Navigator>
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
                  {
                    fontSize: size,
                    opacity: focused ? 1 : 0.6,
                  },
                ]}
              >
                {iconText}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: "#1F381F", // explore-green color
        tabBarInactiveTintColor: "#6B7280", // gray-500
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <MainTab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{
          tabBarLabel: "Explore",
        }}
      />
      <MainTab.Screen
        name="Activities"
        component={ActivitiesStackNavigator}
        options={{
          tabBarLabel: "Activities",
        }}
      />
      <MainTab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarLabel: "Create",
        }}
      />
      <MainTab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: "Chat",
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Profile",
        }}
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

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <FollowProvider>
        <ActivitiesProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ActivitiesProvider>
      </FollowProvider>
    </AuthProvider>
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
    elevation: 8, // Android shadow
    shadowColor: "#000", // iOS shadow
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
