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
import { saveTokens } from '../../lib/auth';

const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

type OtpForm = z.infer<typeof otpSchema>;

export default function VerifyOtpScreen() {
  const { phone_number } = useLocalSearchParams<{ phone_number: string }>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async ({ code }: OtpForm) => {
    setServerError(null);
    setSubmitting(true);
    try {
      // POST /auth/verify-otp -> { access_token, refresh_token, token_type }
      const response = await api.post<{
        access_token: string;
        refresh_token: string;
      }>('/auth/verify-otp', { phone_number, code });

      await saveTokens(response.data.access_token, response.data.refresh_token);

      // Owner dashboard lands in Phase R2 - for now, go to the R0
      // placeholder root screen with tokens now stored on-device.
      router.replace('/');
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      // Backend deliberately returns the same "Invalid or expired code" for
      // both an unknown phone number and a wrong code - surface it as-is.
      setServerError(axiosErr.response?.data?.detail ?? 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your phone</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code we sent to{' '}
        <Text style={styles.phone}>{phone_number}</Text>
      </Text>

      <TextInput
        style={styles.phoneInput}
        value={phone_number}
        editable={false}
        selectTextOnFocus={false}
      />

      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.codeInput}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            testID="otp-code-input"
          />
        )}
      />
      {errors.code && <Text style={styles.fieldError}>{errors.code.message}</Text>}

      {serverError && <Text style={styles.serverError}>{serverError}</Text>}

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
        testID="verify-submit"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 24 },
  phone: { fontWeight: '600', color: '#111' },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#888',
    backgroundColor: '#f7f7f7',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
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
});
