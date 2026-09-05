import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
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
import { saveTokens } from '../../lib/auth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(35)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
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
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
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

  const onSubmit = async (data: LoginForm) => {
    animateButton();

    setServerError(null);
    setSubmitting(true);

    try {
      const response = await api.post<{
        access_token: string;
        refresh_token: string;
      }>('/auth/login', data);

      await saveTokens(
        response.data.access_token,
        response.data.refresh_token
      );

      router.replace('/(app)');
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;

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
                  size={38}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Animated.View>

            {/* Heading */}
            <Text style={styles.brand}>ParkConnect</Text>

            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Login to find and manage your parking
              spaces easily.
            </Text>

            {/* Form Card */}
            <View style={styles.card}>
              {/* Email */}
              <Text style={styles.label}>Email address</Text>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.email && styles.inputError,
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

              {/* Password */}
              <Text style={[styles.label, styles.passwordLabel]}>
                Password
              </Text>

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#64748B"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
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
                        setShowPassword(!showPassword)
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

              {/* Forgot Password */}
              <Pressable
                style={styles.forgotContainer}
                onPress={() =>
                  router.push('/(auth)/forgot-password')
                }
              >
                <Text style={styles.forgotText}>
                  Forgot password?
                </Text>
              </Pressable>

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
                    testID="login-error"
                  >
                    {serverError}
                  </Text>
                </View>
              )}

              {/* Login Button */}
              <Animated.View
                style={{
                  transform: [{ scale: buttonScale }],
                }}
              >
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={submitting}
                  testID="login-submit"
                  style={[
                    styles.buttonWrapper,
                    submitting && styles.buttonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={['#2563EB', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>
                          Log in
                        </Text>

                        <View style={styles.buttonIcon}>
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

            {/* Register */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <Pressable
                onPress={() =>
                  router.push('/(auth)/register')
                }
              >
                <Text style={styles.registerLink}>
                  Register
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
                Secure & trusted parking
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
    paddingVertical: 40,
  },

  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    alignItems: 'center',
  },

  /* LOGO */

  logoWrapper: {
    marginBottom: 12,

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
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 1,
    marginBottom: 15,
  },

  /* HEADING */

  title: {
    fontSize: 31,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 9,
    marginBottom: 27,
    maxWidth: 320,
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
    marginTop: 17,
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

  /* FORGOT */

  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 13,
    marginBottom: 18,
  },

  forgotText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
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

  /* REGISTER */

  registerContainer: {
    flexDirection: 'row',
    marginTop: 23,
    alignItems: 'center',
    gap: 5,
  },

  registerText: {
    color: '#64748B',
    fontSize: 13,
  },

  registerLink: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },

  /* FOOTER */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 25,
  },

  footerText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
