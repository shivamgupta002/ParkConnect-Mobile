import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { extractErrorMessage, useCreateVehicle } from '@/hooks/use-vehicles';
import { vehicleFormSchema, VehicleFormValues } from '@/lib/validation/vehicle';

export default function NewVehicleScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const createVehicle = useCreateVehicle();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vehicle_type: 'car',
      vehicle_number: '',
      brand: '',
      model: '',
      color: '',
      emergency_contact: '',
    },
  });

  const vehicleType = watch('vehicle_type');

  const onSubmit = (values: VehicleFormValues) => {
    setServerError(null);
    createVehicle.mutate(values, {
      onSuccess: () => router.back(),
      onError: (err) => {
        if (err instanceof AxiosError && err.response?.status === 409) {
          setServerError(extractErrorMessage(err, 'A vehicle with this number is already registered.'));
          return;
        }
        if (err instanceof AxiosError && err.response?.status === 403) {
          setServerError(
            extractErrorMessage(err, 'Free plan is limited to 1 vehicle. Upgrade to Premium to add more.')
          );
          return;
        }
        setServerError(extractErrorMessage(err, 'Something went wrong. Please try again.'));
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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

      <Text style={styles.label}>Vehicle number</Text>
      <Controller
        control={control}
        name="vehicle_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="KA01AB1234"
            autoCapitalize="characters"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.vehicle_number && <Text style={styles.fieldError}>{errors.vehicle_number.message}</Text>}

      <Text style={styles.label}>Brand</Text>
      <Controller
        control={control}
        name="brand"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput style={styles.input} placeholder="Toyota" onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />
      {errors.brand && <Text style={styles.fieldError}>{errors.brand.message}</Text>}

      <Text style={styles.label}>Model</Text>
      <Controller
        control={control}
        name="model"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput style={styles.input} placeholder="Innova" onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />
      {errors.model && <Text style={styles.fieldError}>{errors.model.message}</Text>}

      <Text style={styles.label}>Color</Text>
      <Controller
        control={control}
        name="color"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput style={styles.input} placeholder="White" onBlur={onBlur} onChangeText={onChange} value={value} />
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
            placeholder="+919876500000"
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
        style={[styles.button, createVehicle.isPending && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={createVehicle.isPending}
        testID="save-vehicle-submit"
      >
        {createVehicle.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add vehicle</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24 },
  label: { fontSize: 13, color: '#555', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d0d0d0', borderRadius: 8, padding: 12 },
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
