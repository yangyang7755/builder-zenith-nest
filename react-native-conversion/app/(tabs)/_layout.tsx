import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabBarIcon({ focused, name }: { focused: boolean; name: string }) {
  const icons: { [key: string]: string } = {
    index: '🏠',
    activities: '⏰',
    create: '➕',
    chat: '💬',
    profile: '👤',
  };

  return (
    <Text style={{ 
      fontSize: 20, 
      opacity: focused ? 1 : 0.6 
    }}>
      {icons[name] || '🏠'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1F381F',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="index" />,
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="activities" />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="create" />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="chat" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="profile" />,
        }}
      />
    </Tabs>
  );
}
