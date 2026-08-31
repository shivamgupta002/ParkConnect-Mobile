import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { api } from '../../lib/api';

// Simple E.164 check consistent with what backend Phase 2 expects (it does
// full validation server-side via Google's `phonenumbers` library, so this
// is a client-side pre-check, not the source of truth).
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

const registerSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  phone_number: z
    .string()
    .trim()
    .regex(E164_REGEX, 'Use E.164 format, e.g. +919876543210'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one digit'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', phone_number: '', password: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    setSubmitting(true);
    try {
      // POST /auth/register -> { message } (backend sends the OTP itself,
      // no tokens issued yet - those come back from /auth/verify-otp).
      await api.post('/auth/register', data);

      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone_number: data.phone_number },
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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create account</Text>

      <Text style={styles.label}>Full name</Text>
      <Controller
        control={control}
        name="full_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Jane Doe"
            autoCapitalize="words"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.full_name && <Text style={styles.fieldError}>{errors.full_name.message}</Text>}

      <Text style={styles.label}>Email</Text>
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

      <Text style={styles.label}>Phone number</Text>
      <Controller
        control={control}
        name="phone_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="+919876543210"
            keyboardType="phone-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.phone_number && (
        <Text style={styles.fieldError}>{errors.phone_number.message}</Text>
      )}

      <Text style={styles.label}>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="At least 8 characters, 1 digit"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

      {serverError && <Text style={styles.serverError}>{serverError}</Text>}

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
        testID="register-submit"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  label: { fontSize: 13, color: '#555', marginBottom: 4, marginTop: 4 },
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
