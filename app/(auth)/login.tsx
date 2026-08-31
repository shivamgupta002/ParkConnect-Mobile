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
import { saveTokens } from '../../lib/auth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  // Inline error state rather than a native Alert - better for form UX and
  // testability, and lets us surface the backend's exact message (e.g. the
  // 403 "Please verify your phone number before logging in" case).
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    setSubmitting(true);
    try {
      // POST /auth/login -> { access_token, refresh_token, token_type }
      const response = await api.post<{
        access_token: string;
        refresh_token: string;
      }>('/auth/login', data);

      await saveTokens(response.data.access_token, response.data.refresh_token);

      // Dashboard/protected nav is Phase R2 - go to the R0 placeholder for
      // now, with tokens now stored.
      router.replace('/');
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
      <Text style={styles.title}>Log in</Text>

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

      <Text style={styles.label}>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

      {serverError && (
        <Text style={styles.serverError} testID="login-error">
          {serverError}
        </Text>
      )}

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
        testID="login-submit"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log in</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>Need an account? Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
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
