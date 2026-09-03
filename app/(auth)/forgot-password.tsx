
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';

import { api } from '../../lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(iconScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    animateButton();

    setServerError(null);
    setSubmitting(true);

    try {
      await api.post('/auth/forgot-password', { email });

      router.push({
        pathname: '/(auth)/reset-password',
        params: { email },
      });
    } catch (err) {
      const axiosErr = err as AxiosError<{
        detail?: string;
      }>;

      setServerError(
        axiosErr.response?.data?.detail ??
          'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#EFF6FF', '#F8FAFC']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Back Button */}
            <Pressable
              style={styles.backButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color="#0F172A"
              />

              <Text style={styles.backText}>
                Back
              </Text>
            </Pressable>

            {/* Icon */}
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <LinearGradient
                colors={['#2563EB', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Ionicons
                  name="lock-open-outline"
                  size={38}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Animated.View>

            {/* Heading */}
            <Text style={styles.brand}>
              ParkConnect
            </Text>

            <Text style={styles.title}>
              Forgot password?
            </Text>

            <Text style={styles.subtitle}>
              No worries. Enter the email address
              associated with your account and
              we'll send you a reset code.
            </Text>

            {/* Form Card */}
            <View style={styles.card}>
              <Text style={styles.label}>
                Email address
              </Text>

              <Controller
                control={control}
                name="email"
                render={({
                  field: {
                    onChange,
                    onBlur,
                    value,
                  },
                }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.email &&
                        styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#64748B"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      autoComplete="email"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />

              {errors.email && (
                <Text style={styles.fieldError}>
                  {errors.email.message}
                </Text>
              )}

              {/* Info */}
              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={19}
                  color="#2563EB"
                />

                <Text style={styles.infoText}>
                  For your security, we'll send a
                  verification code to your registered
                  email address.
                </Text>
              </View>

              {/* Server Error */}
              {serverError && (
                <View style={styles.serverErrorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#DC2626"
                  />

                  <Text style={styles.serverError}>
                    {serverError}
                  </Text>
                </View>
              )}

              {/* Submit */}
              <Animated.View
                style={{
                  transform: [
                    { scale: buttonScale },
                  ],
                }}
              >
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={submitting}
                  testID="forgot-password-submit"
                  style={[
                    styles.buttonWrapper,
                    submitting &&
                      styles.buttonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={[
                      '#2563EB',
                      '#0EA5E9',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    {submitting ? (
                      <ActivityIndicator
                        color="#FFFFFF"
                      />
                    ) : (
                      <>
                        <Text
                          style={styles.buttonText}
                        >
                          Send reset code
                        </Text>

                        <View
                          style={styles.buttonIcon}
                        >
                          <Ionicons
                            name="arrow-forward"
                            size={19}
                            color="#2563EB"
                          />
                        </View>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>

            {/* Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Remember your password?
              </Text>

              <Pressable
                onPress={() =>
                  router.push('/(auth)/login')
                }
              >
                <Text style={styles.loginLink}>
                  Log in
                </Text>
              </Pressable>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#94A3B8"
              />

              <Text style={styles.footerText}>
                Your account information is secure
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 35,
  },

  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    alignItems: 'center',
  },

  /* BACK */

  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 22,
    paddingVertical: 5,
  },

  backText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },

  /* ICON */

  iconWrapper: {
    marginBottom: 12,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },

  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* HEADING */

  brand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 1,
    marginBottom: 13,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 9,
    marginBottom: 25,
    maxWidth: 340,
  },

  /* CARD */

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 22,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 5,
  },

  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },

  inputWrapper: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  inputError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF7F7',
  },

  input: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    color: '#0F172A',
    fontSize: 14,
  },

  fieldError: {
    color: '#DC2626',
    fontSize: 11,
    marginTop: 5,
    marginLeft: 3,
  },

  /* INFO */

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 13,
    padding: 12,
    marginTop: 17,
    marginBottom: 17,
    gap: 8,
  },

  infoText: {
    flex: 1,
    color: '#475569',
    fontSize: 11,
    lineHeight: 17,
  },

  /* ERROR */

  serverErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },

  serverError: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 12,
    lineHeight: 17,
  },

  /* BUTTON */

  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  button: {
    height: 57,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  buttonIcon: {
    position: 'absolute',
    right: 8,
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* LOGIN */

  loginContainer: {
    flexDirection: 'row',
    marginTop: 22,
    alignItems: 'center',
    gap: 5,
  },

  loginText: {
    color: '#64748B',
    fontSize: 13,
  },

  loginLink: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },

  /* FOOTER */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 22,
  },

  footerText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});

