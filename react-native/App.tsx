import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text } from "react-native";

// Import contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ActivitiesProvider } from "./contexts/ActivitiesContext";
import { FollowProvider } from "./contexts/FollowContext";

// Import screens
import ExploreScreen from "./screens/ExploreScreen";
import ProfileScreen from "./screens/ProfileScreen";

// Simple placeholder components for other tabs
const ActivitiesScreen = () => (
  <Text style={{ flex: 1, textAlign: "center", marginTop: 100, fontSize: 18 }}>
    Activities Screen Coming Soon!
  </Text>
);

const CreateScreen = () => (
  <Text style={{ flex: 1, textAlign: "center", marginTop: 100, fontSize: 18 }}>
    Create Activity Coming Soon!
  </Text>
);

const ChatScreen = () => (
  <Text style={{ flex: 1, textAlign: "center", marginTop: 100, fontSize: 18 }}>
    Chat Screen Coming Soon!
  </Text>
);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AuthProvider>
      <FollowProvider>
        <ActivitiesProvider>
          <NavigationContainer>
            <Tab.Navigator
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

                  return <Text style={{ fontSize: size }}>{iconText}</Text>;
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
  },
});
