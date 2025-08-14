import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Feather";
import { StyleSheet } from "react-native";

// Import screens
import ExploreScreen from "./screens/ExploreScreen";
import ActivitiesScreen from "./screens/ActivitiesScreen";
import CreateScreen from "./screens/CreateScreen";
import ChatScreen from "./screens/ChatScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CategoryActivities from "./components/CategoryActivities";
import ActivityDetailScreen from "./screens/ActivityDetailScreen";
import SettingsScreen from "./screens/SettingsScreen";

// Import contexts (these would need to be converted)
import { AuthProvider } from "./contexts/AuthContext";
import { ActivitiesProvider } from "./contexts/ActivitiesContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Explore":
              iconName = "home";
              break;
            case "Activities":
              iconName = "clock";
              break;
            case "Create":
              iconName = "plus";
              break;
            case "Chat":
              iconName = "message-square";
              break;
            case "Profile":
              iconName = "user";
              break;
            default:
              iconName = "home";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1F381F",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Activities" component={ActivitiesScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="CategoryActivities" component={CategoryActivities} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <UserProfileProvider>
          <ActivitiesProvider>
            <AppStack />
          </ActivitiesProvider>
        </UserProfileProvider>
      </AuthProvider>
    </NavigationContainer>
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
  },
});
