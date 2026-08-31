import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    setServerError(null);
    setSubmitting(true);
    try {
      // POST /auth/forgot-password -> { message } always, regardless of
      // whether the email matched an account (backend never confirms/denies
      // this) - so we always proceed to the reset screen.
      await api.post('/auth/forgot-password', { email });

      router.push({
        pathname: '/(auth)/reset-password',
        params: { email },
      });
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
      <Text style={styles.title}>Forgot password</Text>
      <Text style={styles.subtitle}>
        Enter your account email and we&apos;ll send a reset code.
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="jane@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}

      {serverError && <Text style={styles.serverError}>{serverError}</Text>}

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
        testID="forgot-password-submit"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send reset code</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>Back to login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  fieldError: { color: '#d32f2f', fontSize: 12, marginBottom: 8 },
  serverError: { color: '#d32f2f', marginTop: 8, marginBottom: 8, textAlign: 'center' },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: '#0066cc', marginTop: 16, textAlign: 'center' },
});
