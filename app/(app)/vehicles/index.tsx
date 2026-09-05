import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { listVehicles, Vehicle } from '@/lib/vehicle-api';

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      listVehicles().then(setVehicles).finally(() => setLoading(false));
    }, [])
  );

  if (loading) return <ActivityIndicator style={styles.center} />;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(v) => v.id}
        ListEmptyComponent={<ThemedText>No vehicles yet.</ThemedText>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/(app)/vehicles/${item.id}/qr`)}>
            <ThemedText type="defaultSemiBold">
              {item.color} {item.brand} {item.model}
            </ThemedText>
            <ThemedText>{item.vehicle_number}</ThemedText>
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/(app)/vehicles/new')}>
        <ThemedText style={styles.fabText}>+ Add Vehicle</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center' },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  fab: {
    marginTop: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontWeight: '600' },
});