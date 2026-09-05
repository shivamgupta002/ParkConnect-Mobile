import { StyleSheet } from 'react-native';

import { LogoutButton } from '@/components/logout-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function DashboardScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Dashboard</ThemedText>
      <ThemedText style={styles.subtitle}>Welcome back to ParkConnect.</ThemedText>
      <LogoutButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    gap: 16,
  },
  subtitle: {
    marginBottom: 24,
  },
});