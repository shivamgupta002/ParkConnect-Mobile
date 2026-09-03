import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
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
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
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
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      new_password: '',
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

  const onSubmit = async (data: ResetPasswordForm) => {
    animateButton();

    setServerError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const response = await api.post<{ message: string }>(
        '/auth/reset-password',
        {
          email,
          code: data.code,
          new_password: data.new_password,
        }
      );

      setSuccessMessage(response.data.message);

      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1200);
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
              onPress={() =>
                router.push('/(auth)/forgot-password')
              }
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
                  name="shield-checkmark-outline"
                  size={38}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Animated.View>

            {/* Branding */}
            <Text style={styles.brand}>
              ParkConnect
            </Text>

            <Text style={styles.title}>
              Reset password
            </Text>

            <Text style={styles.subtitle}>
              Enter the verification code sent to
            </Text>

            <View style={styles.emailBadge}>
              <Ionicons
                name="mail-outline"
                size={15}
                color="#2563EB"
              />

              <Text
                style={styles.email}
                numberOfLines={1}
              >
                {email}
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {/* Verification Code */}
              <Text style={styles.label}>
                Verification code
              </Text>

              <Controller
                control={control}
                name="code"
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
                      styles.codeWrapper,
                      errors.code &&
                        styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="keypad-outline"
                      size={20}
                      color="#64748B"
                    />

                    <TextInput
                      style={[
                        styles.input,
                        styles.codeInput,
                      ]}
                      placeholder="Enter reset code"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      testID="reset-code-input"
                    />
                  </View>
                )}
              />

              {errors.code && (
                <Text style={styles.fieldError}>
                  {errors.code.message}
                </Text>
              )}

              {/* Code Hint */}
              <View style={styles.codeHint}>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color="#64748B"
                />

                <Text style={styles.codeHintText}>
                  Enter the verification code you
                  received.
                </Text>
              </View>

              {/* New Password */}
              <Text
                style={[
                  styles.label,
                  styles.passwordLabel,
                ]}
              >
                New password
              </Text>

              <Controller
                control={control}
                name="new_password"
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
                      errors.new_password &&
                        styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#64748B"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />

                    <Pressable
                      onPress={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      hitSlop={10}
                    >
                      <Ionicons
                        name={
                          showPassword
                            ? 'eye-outline'
                            : 'eye-off-outline'
                        }
                        size={21}
                        color="#64748B"
                      />
                    </Pressable>
                  </View>
                )}
              />

              {errors.new_password && (
                <Text style={styles.fieldError}>
                  {errors.new_password.message}
                </Text>
              )}

              {/* Password Requirements */}
              <View style={styles.requirements}>
                <Text style={styles.requirementTitle}>
                  Password requirements
                </Text>

                <View style={styles.requirementRow}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={15}
                    color="#64748B"
                  />

                  <Text style={styles.requirementText}>
                    At least 8 characters
                  </Text>
                </View>

                <View style={styles.requirementRow}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={15}
                    color="#64748B"
                  />

                  <Text style={styles.requirementText}>
                    At least one number
                  </Text>
                </View>
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

              {/* Success */}
              {successMessage && (
                <View style={styles.successBox}>
                  <Ionicons
                    name="checkmark-circle"
                    size={21}
                    color="#16A34A"
                  />

                  <Text style={styles.successMessage}>
                    {successMessage}
                  </Text>
                </View>
              )}

              {/* Reset Button */}
              <Animated.View
                style={{
                  transform: [
                    { scale: buttonScale },
                  ],
                }}
              >
                <Pressable
                  style={[
                    styles.buttonWrapper,
                    submitting &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={submitting}
                  testID="reset-password-submit"
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
                          Reset password
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
    marginBottom: 7,
  },

  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 25,
    maxWidth: '90%',
  },

  email: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
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

  passwordLabel: {
    marginTop: 14,
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

  codeWrapper: {
    backgroundColor: '#F8FAFC',
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

  codeInput: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
  },

  fieldError: {
    color: '#DC2626',
    fontSize: 11,
    marginTop: 5,
    marginLeft: 3,
  },

  /* HINT */

  codeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },

  codeHintText: {
    color: '#64748B',
    fontSize: 10,
  },

  /* REQUIREMENTS */

  requirements: {
    backgroundColor: '#F8FAFC',
    borderRadius: 13,
    padding: 12,
    marginTop: 15,
    marginBottom: 17,
  },

  requirementTitle: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 7,
  },

  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },

  requirementText: {
    color: '#64748B',
    fontSize: 10,
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

  /* SUCCESS */

  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },

  successMessage: {
    flex: 1,
    color: '#15803D',
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

