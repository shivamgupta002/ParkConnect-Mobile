import { useEffect } from 'react';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Car, FileBarChart, LayoutDashboard, ScrollText, Users } from 'lucide-react-native';
import { useAuth } from '../../lib/auth-context';
import LogoutButton from '../../components/LogoutButton';

export default function AdminLayout() {
  const { authState } = useAuth();

  useEffect(() => {
    // Belt-and-suspenders: the root gate already routes non-admins away, but
    // this mirrors the web app's Phase 13 rule that /admin/* itself refuses
    // to render for non-admins rather than exposing that it exists.
    if (authState && authState.status !== 'admin') {
      router.replace('/(owner)');
    }
  }, [authState]);

  if (!authState || authState.status !== 'admin') {
    return null;
  }

  return (
    <Drawer
      screenOptions={{ headerShown: true }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
          <LogoutButton variant="drawer" />
        </DrawerContentScrollView>
      )}
    >
      <Drawer.Screen name="index" options={{ drawerLabel: 'Overview', title: 'Overview', drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
      <Drawer.Screen name="users" options={{ drawerLabel: 'Users', title: 'Users', drawerIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Drawer.Screen name="vehicles" options={{ drawerLabel: 'Vehicles', title: 'Vehicles', drawerIcon: ({ color, size }) => <Car color={color} size={size} /> }} />
      <Drawer.Screen name="reports" options={{ drawerLabel: 'Reports', title: 'Reports', drawerIcon: ({ color, size }) => <FileBarChart color={color} size={size} /> }} />
      <Drawer.Screen name="audit-log" options={{ drawerLabel: 'Audit Log', title: 'Audit Log', drawerIcon: ({ color, size }) => <ScrollText color={color} size={size} /> }} />
    </Drawer>
  );
}