import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getMe } from '@/lib/vehicle-api';
import { listVehicles, Vehicle } from '@/lib/vehicle-api';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        try {
          const [me, vs] = await Promise.all([getMe(), listVehicles()]);
          if (!active) return;
          setName(me.full_name?.split(' ')[0] ?? '');
          setVehicles(vs);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  if (loading) return <ActivityIndicator style={styles.center} />;

  const activeCount = vehicles.filter((v) => v.is_active).length;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Hi{name ? `, ${name}` : ''} 👋</ThemedText>
      <ThemedText style={styles.stat}>{activeCount} active vehicle(s)</ThemedText>
      <ThemedText type="link" onPress={() => router.push('/(app)/vehicles/new')}>
        + Add a vehicle
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  center: { flex: 1, justifyContent: 'center' },
  stat: { fontSize: 16 },
});