import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Bell, Car, CreditCard, History as HistoryIcon } from 'lucide-react-native';
import LogoutButton from '../../components/LogoutButton';

export default function OwnerLayout() {
  // Stubbed at 0; wired to the real unread count in Phase R6.
  const [unreadCount] = useState(0);

  return (
    <Tabs screenOptions={{ headerShown: true, headerRight: () => <LogoutButton /> }}>
      {/* index.tsx just redirects into the vehicles stack; hide it as a tab */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="vehicles"
        options={{ title: 'Vehicles', tabBarIcon: ({ color, size }) => <Car color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: ({ color, size }) => <HistoryIcon color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{ title: 'Subscription', tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} /> }}
      />
    </Tabs>
  );
}