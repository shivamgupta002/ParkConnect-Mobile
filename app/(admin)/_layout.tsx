import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { ActivityIndicator } from 'react-native';

export default function AdminLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: true }} />;
}