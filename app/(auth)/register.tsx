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

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

const registerSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),

  email: z.string().email('Enter a valid email address'),

  phone_number: z
    .string()
    .trim()
    .regex(
      E164_REGEX,
      'Use E.164 format, e.g. +919876543210'
    ),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one digit'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;
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

      Animated.spring(logoScale, {
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
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
      password: '',
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

  const onSubmit = async (data: RegisterForm) => {
    animateButton();

    setServerError(null);
    setSubmitting(true);

    try {
      // POST /auth/register
      await api.post('/auth/register', data);

      // Move to OTP verification
      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          phone_number: data.phone_number,
        },
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
            {/* Logo */}
            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              <LinearGradient
                colors={['#2563EB', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <Ionicons
                  name="car-sport"
                  size={36}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Animated.View>

            {/* Branding */}
            <Text style={styles.brand}>
              ParkConnect
            </Text>

            <Text style={styles.title}>
              Create account
            </Text>

            <Text style={styles.subtitle}>
              Join ParkConnect and make parking
              simple, fast and convenient.
            </Text>

            {/* Form Card */}
            <View style={styles.card}>
              {/* Full Name */}
              <Text style={styles.label}>
                Full name
              </Text>

              <Controller
                control={control}
                name="full_name"
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
                      errors.full_name &&
                        styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#64748B"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="words"
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />

              {errors.full_name && (
                <Text style={styles.fieldError}>
                  {errors.full_name.message}
                </Text>
              )}

              {/* Email */}
              <Text
                style={[
                  styles.label,
                  styles.fieldSpacing,
                ]}
              >
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

              {/* Phone */}
              <Text
                style={[
                  styles.label,
                  styles.fieldSpacing,
                ]}
              >
                Phone number
              </Text>

              <Controller
                control={control}
                name="phone_number"
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
                      errors.phone_number &&
                        styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color="#64748B"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="+919876543210"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />

              {errors.phone_number && (
                <Text style={styles.fieldError}>
                  {errors.phone_number.message}
                </Text>
              )}

              {/* Password */}
              <Text
                style={[
                  styles.label,
                  styles.fieldSpacing,
                ]}
              >
                Password
              </Text>

              <Controller
                control={control}
                name="password"
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
                      errors.password &&
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
                      placeholder="At least 8 characters"
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

              {errors.password && (
                <Text style={styles.fieldError}>
                  {errors.password.message}
                </Text>
              )}

              {/* Password Hint */}
              <View style={styles.passwordHint}>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color="#64748B"
                />

                <Text style={styles.passwordHintText}>
                  Minimum 8 characters with at least
                  one number
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

                  <Text
                    style={styles.serverError}
                  >
                    {serverError}
                  </Text>
                </View>
              )}

              {/* Register Button */}
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
                  testID="register-submit"
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
                          Create account
                        </Text>

                        <View
                          style={
                            styles.buttonIcon
                          }
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
            <View
              style={styles.loginContainer}
            >
              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <Pressable
                onPress={() =>
                  router.push(
                    '/(auth)/login'
                  )
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
                Your information is secure
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

  /* LOGO */

  logoWrapper: {
    marginBottom: 10,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 8,
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 1,
    marginBottom: 13,
  },

  /* HEADING */

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
    marginTop: 8,
    marginBottom: 24,
    maxWidth: 330,
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

  fieldSpacing: {
    marginTop: 16,
  },

  inputWrapper: {
    height: 54,
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

  /* PASSWORD HINT */

  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    marginBottom: 17,
  },

  passwordHintText: {
    color: '#64748B',
    fontSize: 10,
  },

  /* SERVER ERROR */

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

