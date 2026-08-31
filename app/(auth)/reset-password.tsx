import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { api } from '../../lib/api';

const resetPasswordSchema = z.object({
  code: z.string().min(1, 'Enter the code we sent you'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one digit'),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', new_password: '' },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setServerError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    try {
      // POST /auth/reset-password -> { message }. No tokens are issued here
      // - the user logs in fresh with their new password afterwards.
      const response = await api.post<{ message: string }>('/auth/reset-password', {
        email,
        code: data.code,
        new_password: data.new_password,
      });

      setSuccessMessage(response.data.message);
      setTimeout(() => router.replace('/(auth)/login'), 1200);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      setServerError(
        axiosErr.response?.data?.detail ?? 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>
        Enter the code we sent for <Text style={styles.email}>{email}</Text> and choose a new
        password.
      </Text>

      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Reset code"
            keyboardType="number-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            testID="reset-code-input"
          />
        )}
      />
      {errors.code && <Text style={styles.fieldError}>{errors.code.message}</Text>}

      <Controller
        control={control}
        name="new_password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="New password"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.new_password && (
        <Text style={styles.fieldError}>{errors.new_password.message}</Text>
      )}

      {serverError && <Text style={styles.serverError}>{serverError}</Text>}
      {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
        testID="reset-password-submit"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset password</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 24 },
  email: { fontWeight: '600', color: '#111' },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  fieldError: { color: '#d32f2f', fontSize: 12, marginBottom: 8 },
  serverError: { color: '#d32f2f', marginTop: 8, marginBottom: 8, textAlign: 'center' },
  successMessage: { color: '#2e7d32', marginTop: 8, marginBottom: 8, textAlign: 'center' },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
