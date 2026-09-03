import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { extractErrorMessage, useUpdateVehicle, useVehicle } from '@/hooks/use-vehicles';
import { vehicleUpdateSchema, VehicleUpdateFormValues } from '@/lib/validation/vehicle';

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: vehicle, isLoading, isError } = useVehicle(id);
  const updateVehicle = useUpdateVehicle(id ?? '');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VehicleUpdateFormValues>({
    resolver: zodResolver(vehicleUpdateSchema),
    defaultValues: { vehicle_type: 'car', brand: '', model: '', color: '', emergency_contact: '' },
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        vehicle_type: vehicle.vehicle_type,
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        emergency_contact: vehicle.emergency_contact,
      });
    }
  }, [vehicle, reset]);

  const vehicleType = watch('vehicle_type');

  const onSubmit = (values: VehicleUpdateFormValues) => {
    setServerError(null);
    updateVehicle.mutate(values, {
      onSuccess: () => router.back(),
      onError: (err) => setServerError(extractErrorMessage(err, 'Something went wrong. Please try again.')),
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !vehicle) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn&apos;t load this vehicle.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Vehicle number</Text>
      <Text style={styles.readOnlyValue}>{vehicle.vehicle_number}</Text>
      <Text style={styles.helperText}>
        The vehicle number can&apos;t be changed after registration — it&apos;s tied to this vehicle&apos;s QR code.
      </Text>

      <Text style={styles.label}>Vehicle type</Text>
      <View style={styles.segmented}>
        {(['car', 'bike'] as const).map((type) => (
          <Pressable
            key={type}
            style={[styles.segment, vehicleType === type && styles.segmentActive]}
            onPress={() => setValue('vehicle_type', type)}
          >
            <Text style={[styles.segmentText, vehicleType === type && styles.segmentTextActive]}>
              {type === 'car' ? 'Car' : 'Bike'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Brand</Text>
      <Controller
        control={control}
        name="brand"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />
      {errors.brand && <Text style={styles.fieldError}>{errors.brand.message}</Text>}

      <Text style={styles.label}>Model</Text>
      <Controller
        control={control}
        name="model"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />
      {errors.model && <Text style={styles.fieldError}>{errors.model.message}</Text>}

      <Text style={styles.label}>Color</Text>
      <Controller
        control={control}
        name="color"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />
      {errors.color && <Text style={styles.fieldError}>{errors.color.message}</Text>}

      <Text style={styles.label}>Emergency contact</Text>
      <Controller
        control={control}
        name="emergency_contact"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.emergency_contact && <Text style={styles.fieldError}>{errors.emergency_contact.message}</Text>}

      {serverError && <Text style={styles.serverError}>{serverError}</Text>}

      <Pressable
        style={[styles.button, updateVehicle.isPending && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={updateVehicle.isPending}
        testID="save-vehicle-submit"
      >
        {updateVehicle.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save changes</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: '#d32f2f', textAlign: 'center' },
  label: { fontSize: 13, color: '#555', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d0d0d0', borderRadius: 8, padding: 12 },
  readOnlyValue: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    color: '#666',
    fontWeight: '600',
  },
  helperText: { fontSize: 12, color: '#888', marginTop: 4 },
  fieldError: { color: '#d32f2f', fontSize: 12, marginTop: 4 },
  serverError: { color: '#d32f2f', marginTop: 16, textAlign: 'center' },
  segmented: { flexDirection: 'row', gap: 8 },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: '#111', borderColor: '#111' },
  segmentText: { color: '#333', fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
  button: { backgroundColor: '#111', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
