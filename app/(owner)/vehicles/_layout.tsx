import { Stack } from 'expo-router';

export default function VehiclesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Vehicles' }} />
      <Stack.Screen name="new" options={{ title: 'Add vehicle', presentation: 'modal' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit vehicle' }} />
      <Stack.Screen name="[id]/qr" options={{ title: 'QR Code' }} />
    </Stack>
  );
}
