import { useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Plus, Car as CarIcon } from 'lucide-react-native';

import { extractErrorMessage, useDeleteVehicle, useVehicles } from '@/hooks/use-vehicles';
import { useSubscription } from '@/hooks/use-subscription';
import type { Vehicle } from '@/lib/types/vehicle';

const FREE_PLAN_VEHICLE_LIMIT = 1;

export default function VehiclesScreen() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useVehicles();
  const { data: subscription } = useSubscription();
  const deleteVehicle = useDeleteVehicle();

  const vehicles = useMemo(() => data?.pages.flatMap((page) => page.vehicles) ?? [], [data]);
  const activeCount = useMemo(() => vehicles.filter((v) => v.is_active).length, [vehicles]);

  const isFreePlan = (subscription?.plan ?? 'free') === 'free';
  const atLimit = isFreePlan && activeCount >= FREE_PLAN_VEHICLE_LIMIT;

  const handleDelete = (vehicle: Vehicle) => {
    Alert.alert(
      'Remove vehicle',
      `Remove ${vehicle.brand} ${vehicle.model} (${vehicle.vehicle_number})? This can't be undone from here.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deleteVehicle.mutate(vehicle.id, {
              onError: (err) => {
                Alert.alert(
                  'Could not remove vehicle',
                  extractErrorMessage(err, 'Something went wrong. Please try again.')
                );
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {extractErrorMessage(error, "Couldn't load your vehicles. Pull down to try again.")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={vehicles.length === 0 ? styles.emptyList : styles.list}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No vehicles yet. Add your first one to get started.</Text>
          </View>
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
        renderItem={({ item }) => (
          <View style={styles.card} testID={`vehicle-card-${item.id}`}>
            <View style={styles.cardHeader}>
              <CarIcon size={18} color="#555" />
              <Text style={styles.cardTitle}>
                {item.brand} {item.model}
              </Text>
              <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={styles.badgeText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>
              {item.vehicle_type === 'car' ? 'Car' : 'Bike'} · {item.vehicle_number} · {item.color}
            </Text>
            <View style={styles.cardActions}>
              <Link href={{ pathname: '/(owner)/vehicles/[id]/qr', params: { id: item.id } }} asChild>
                <Pressable style={styles.linkButton}>
                  <Text style={styles.linkButtonText}>View QR</Text>
                </Pressable>
              </Link>
              <Pressable
                style={styles.linkButton}
                onPress={() => router.push({ pathname: '/(owner)/vehicles/[id]/edit', params: { id: item.id } })}
              >
                <Text style={styles.linkButtonText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.linkButton} onPress={() => handleDelete(item)}>
                <Text style={[styles.linkButtonText, styles.deleteText]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {atLimit ? (
        <View style={styles.limitBanner}>
          <Text style={styles.limitText}>
            Free plan is limited to {FREE_PLAN_VEHICLE_LIMIT} vehicle. Upgrade to add more.
          </Text>
          <Link href="/(owner)/subscription" asChild>
            <Pressable>
              <Text style={styles.limitLink}>View plans</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <Pressable style={styles.fab} onPress={() => router.push('/(owner)/vehicles/new')} testID="add-vehicle-fab">
          <Plus color="#fff" size={24} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: '#d32f2f', textAlign: 'center' },
  emptyText: { color: '#666', textAlign: 'center' },
  list: { padding: 16, gap: 12, paddingBottom: 96 },
  emptyList: { flexGrow: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  cardSubtitle: { color: '#666', fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeActive: { backgroundColor: '#e6f4ea' },
  badgeInactive: { backgroundColor: '#f1f1f1' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#333' },
  cardActions: { flexDirection: 'row', gap: 16, marginTop: 4 },
  linkButton: { paddingVertical: 4 },
  linkButtonText: { color: '#0a7ea4', fontWeight: '600', fontSize: 13 },
  deleteText: { color: '#d32f2f' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  limitBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#fff8e1',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  limitText: { color: '#7a5c00', fontSize: 13 },
  limitLink: { color: '#0a7ea4', fontWeight: '600', fontSize: 13 },
});
