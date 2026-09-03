import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();

  /* =========================================================
     RESPONSIVE VALUES
  ========================================================= */

  const isSmallPhone = width < 360 || height < 680;
  const isTablet = width >= 600;

  // Keep content from becoming too large on tablets
  const contentWidth = Math.min(width - 40, 600);

  const scale = Math.min(
    Math.max(width / 390, 0.82),
    isTablet ? 1.25 : 1.08,
  );

  const heroHeight = isSmallPhone
    ? 190
    : isTablet
      ? 280
      : 225;

  /* =========================================================
     ANIMATIONS
  ========================================================= */

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(35)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  const pulse = useRef(new Animated.Value(1)).current;
  const carFloat = useRef(new Animated.Value(0)).current;
  const phoneFloat = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.4)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  /* =========================================================
     START ANIMATIONS
  ========================================================= */

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 65,
        useNativeDriver: true,
      }),

      Animated.timing(slideUp, {
        toValue: 0,
        duration: 850,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Car floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(carFloat, {
          toValue: -7,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(carFloat, {
          toValue: 7,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Phone floating - slightly different timing
    Animated.loop(
      Animated.sequence([
        Animated.timing(phoneFloat, {
          toValue: -10,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(phoneFloat, {
          toValue: 4,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Rotating ring
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.9,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.35,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /* =========================================================
     BUTTON ANIMATION
  ========================================================= */

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  /* =========================================================
     PARTICLES
  ========================================================= */

  const particles = [
    { left: '8%', top: '10%', size: 3 },
    { left: '20%', top: '18%', size: 2 },
    { left: '78%', top: '12%', size: 3 },
    { left: '91%', top: '25%', size: 2 },
    { left: '10%', top: '40%', size: 2 },
    { left: '88%', top: '45%', size: 3 },
    { left: '5%', top: '65%', size: 2 },
    { left: '94%', top: '70%', size: 2 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* =================================================
            BACKGROUND
        ================================================= */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.backgroundGlow,
            {
              width: width * 1.25,
              height: width * 1.25,
              borderRadius: width,
              left: -width * 0.125,
              top: height * 0.25,
              opacity: glow,
            },
          ]}
        />

        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            pointerEvents="none"
            style={[
              styles.particle,
              {
                left: particle.left as any,
                top: particle.top as any,
                width: particle.size,
                height: particle.size,
                opacity: glow,
              },
            ]}
          />
        ))}

        {/* =================================================
            SCROLLABLE CONTENT
        ================================================= */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              width: contentWidth,
              alignSelf: 'center',
              minHeight: Math.max(height - 20, 650),
            },
          ]}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeIn,
                transform: [{ translateY: slideUp }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  transform: [
                    { scale: logoScale },
                    { scale: pulse },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.logo,
                  {
                    width: 68 * scale,
                    height: 68 * scale,
                    borderRadius: 20 * scale,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.logoText,
                    {
                      fontSize: 43 * scale,
                    },
                  ]}
                >
                  P
                </Text>
              </View>

              <View
                style={[
                  styles.logoGlow,
                  {
                    width: 68 * scale,
                    height: 68 * scale,
                    borderRadius: 20 * scale,
                  },
                ]}
              />
            </Animated.View>

            <Text
              style={[
                styles.title,
                {
                  fontSize: isTablet ? 42 : isSmallPhone ? 29 : 34,
                },
              ]}
            >
              Park
              <Text style={styles.titleAccent}>
                Connect
              </Text>
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  fontSize: isSmallPhone ? 14 : 16,
                },
              ]}
            >
              Reach any vehicle owner.
            </Text>

            <Text
              style={[
                styles.highlight,
                {
                  fontSize: isSmallPhone ? 13 : 15,
                },
              ]}
            >
              Without ever seeing their number.
            </Text>
          </Animated.View>

          {/* =================================================
              HERO
          ================================================= */}

          <Animated.View
            style={[
              styles.hero,
              {
                height: heroHeight,
                opacity: fadeIn,
                transform: [{ translateY: slideUp }],
              },
            ]}
          >

            {/* Rotating connection ring */}
            <Animated.View
              style={[
                styles.connectionRing,
                {
                  width: Math.min(width * 0.58, 235),
                  height: Math.min(width * 0.32, 125),
                  borderRadius: 150,
                  transform: [{ rotate: rotation }],
                },
              ]}
            />

            {/* Private */}
            <View
              style={[
                styles.featureBadge,
                styles.privateBadge,
                {
                  left: isTablet ? '18%' : '5%',
                  top: isSmallPhone ? 15 : 20,
                },
              ]}
            >
              <View
                style={[
                  styles.featureCircle,
                  {
                    width: 40 * scale,
                    height: 40 * scale,
                    borderRadius: 20 * scale,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.featureIcon,
                    {
                      fontSize: 17 * scale,
                    },
                  ]}
                >
                  🔒
                </Text>
              </View>

              <Text style={styles.featureText}>
                PRIVATE
              </Text>
            </View>

            {/* Connect */}
            <View
              style={[
                styles.featureBadge,
                styles.connectBadge,
                {
                  top: isSmallPhone ? 0 : 5,
                },
              ]}
            >
              <View
                style={[
                  styles.featureCircle,
                  {
                    width: 40 * scale,
                    height: 40 * scale,
                    borderRadius: 20 * scale,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.featureIcon,
                    {
                      fontSize: 18 * scale,
                    },
                  ]}
                >
                  ☎
                </Text>
              </View>

              <Text style={styles.featureText}>
                CONNECT
              </Text>
            </View>

            {/* Chat */}
            <View
              style={[
                styles.featureBadge,
                styles.chatBadge,
                {
                  right: isTablet ? '18%' : '4%',
                  top: isSmallPhone ? 18 : 25,
                },
              ]}
            >
              <View
                style={[
                  styles.featureCircle,
                  {
                    width: 40 * scale,
                    height: 40 * scale,
                    borderRadius: 20 * scale,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.featureIcon,
                    {
                      fontSize: 17 * scale,
                    },
                  ]}
                >
                  💬
                </Text>
              </View>

              <Text style={styles.featureText}>
                CHAT
              </Text>
            </View>

            {/* Car */}
            <Animated.View
              style={[
                styles.carContainer,
                {
                  left: isTablet
                    ? '25%'
                    : '2%',
                  bottom: isSmallPhone ? 5 : 10,
                  transform: [{ translateY: carFloat }],
                },
              ]}
            >
              <Text
                style={[
                  styles.car,
                  {
                    fontSize: isTablet
                      ? 115
                      : isSmallPhone
                        ? 75
                        : Math.min(width * 0.25, 100),
                  },
                ]}
              >
                🚘
              </Text>
            </Animated.View>

            {/* Phone */}
            <Animated.View
              style={[
                styles.phone,
                {
                  width: isTablet ? 120 : isSmallPhone ? 88 : 105,
                  height: isTablet ? 215 : isSmallPhone ? 165 : 190,
                  right: isTablet
                    ? '25%'
                    : '6%',
                  bottom: isSmallPhone ? 0 : 3,
                  borderRadius: isSmallPhone ? 17 : 20,
                  transform: [
                    { rotate: '5deg' },
                    { translateY: phoneFloat },
                  ],
                },
              ]}
            >
              <View style={styles.phoneNotch} />

              <Text
                style={[
                  styles.phoneTitle,
                  {
                    fontSize: isSmallPhone ? 8 : 10,
                  },
                ]}
              >
                ParkConnect
              </Text>

              <View
                style={[
                  styles.qrBox,
                  {
                    width: isSmallPhone ? 52 : 65,
                    height: isSmallPhone ? 52 : 65,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.qr,
                    {
                      fontSize: isSmallPhone ? 43 : 55,
                    },
                  ]}
                >
                  ▦
                </Text>
              </View>

              <Text
                style={[
                  styles.scanText,
                  {
                    fontSize: isSmallPhone ? 7 : 8,
                  },
                ]}
              >
                🔒 Scan to Connect
              </Text>

              <Text
                style={[
                  styles.secureText,
                  {
                    fontSize: isSmallPhone ? 6 : 7,
                  },
                ]}
              >
                Secure. Private. Instant.
              </Text>
            </Animated.View>
          </Animated.View>

          {/* =================================================
              BENEFITS
          ================================================= */}

          <Animated.View
            style={[
              styles.benefits,
              {
                opacity: fadeIn,
                transform: [{ translateY: slideUp }],
              },
            ]}
          >
            <Benefit
              icon="🔐"
              title="Private"
              description="Number stays hidden"
              small={isSmallPhone}
            />

            <View style={styles.divider} />

            <Benefit
              icon="⚡"
              title="Instant"
              description="Connect in seconds"
              small={isSmallPhone}
            />

            <View style={styles.divider} />

            <Benefit
              icon="✓"
              title="Secure"
              description="Safe communication"
              small={isSmallPhone}
            />
          </Animated.View>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeIn,
                transform: [{ translateY: slideUp }],
              },
            ]}
          >
            {/* LOGIN */}
            <Animated.View
              style={{
                transform: [{ scale: buttonScale }],
              }}
            >
              <Pressable
                style={[
                  styles.primaryButton,
                  {
                    height: isSmallPhone ? 52 : 58,
                  },
                ]}
                onPress={() =>
                  router.push('/(auth)/login')
                }
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                testID="welcome-login"
              >
                <View
                  style={[
                    styles.arrowCircle,
                    {
                      width: isSmallPhone ? 38 : 42,
                      height: isSmallPhone ? 38 : 42,
                      borderRadius: isSmallPhone ? 19 : 21,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.arrow,
                      {
                        fontSize: isSmallPhone ? 21 : 25,
                      },
                    ]}
                  >
                    →
                  </Text>
                </View>

                <Text
                  style={[
                    styles.primaryText,
                    {
                      fontSize: isSmallPhone ? 15 : 17,
                    },
                  ]}
                >
                  Log in
                </Text>
              </Pressable>
            </Animated.View>

            {/* REGISTER */}
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  height: isSmallPhone ? 50 : 54,
                },
                pressed && styles.pressed,
              ]}
              onPress={() =>
                router.push('/(auth)/register')
              }
              testID="welcome-register"
            >
              <Text
                style={[
                  styles.userIcon,
                  {
                    fontSize: isSmallPhone ? 21 : 25,
                  },
                ]}
              >
                ♙
              </Text>

              <Text
                style={[
                  styles.secondaryText,
                  {
                    fontSize: isSmallPhone ? 14 : 16,
                  },
                ]}
              >
                Create account
              </Text>
            </Pressable>
          </Animated.View>

          {/* =================================================
              FOOTER
          ================================================= */}

          <Animated.View
            style={[
              styles.footer,
              {
                opacity: fadeIn,
              },
            ]}
          >
            <Text style={styles.footerIcon}>
              🛡
            </Text>

            <Text style={styles.footerText}>
              Privacy-first communication
            </Text>
          </Animated.View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   BENEFIT COMPONENT
========================================================= */

function Benefit({
  icon,
  title,
  description,
  small,
}: {
  icon: string;
  title: string;
  description: string;
  small: boolean;
}) {
  return (
    <View style={styles.benefit}>
      <Text
        style={[
          styles.benefitIcon,
          {
            fontSize: small ? 16 : 19,
          },
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.benefitTitle,
          {
            fontSize: small ? 10 : 12,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.benefitText,
          {
            fontSize: small ? 7 : 8,
          },
        ]}
      >
        {description}
      </Text>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050B24',
  },

  container: {
    flex: 1,
    backgroundColor: '#050B24',
    overflow: 'hidden',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    justifyContent: 'space-between',
  },

  /* =======================================================
     BACKGROUND
  ======================================================= */

  backgroundGlow: {
    position: 'absolute',
    backgroundColor: '#312E81',
  },

  particle: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: '#60A5FA',
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    alignItems: 'center',
    paddingTop: 8,
  },

  logoWrapper: {
    position: 'relative',
    marginBottom: 9,
  },

  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101B55',
    borderWidth: 2,
    borderColor: '#3B82F6',

    shadowColor: '#2563EB',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 15,
  },

  logoGlow: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },

  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
  },

  title: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -1,
  },

  titleAccent: {
    color: '#38BDF8',
  },

  subtitle: {
    color: '#F8FAFC',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },

  highlight: {
    color: '#FBBF24',
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },

  /* =======================================================
     HERO
  ======================================================= */

  hero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  connectionRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },

  /* =======================================================
     FEATURE BADGES
  ======================================================= */

  featureBadge: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },

  privateBadge: {
    zIndex: 6,
  },

  connectBadge: {
    alignSelf: 'center',
    zIndex: 6,
  },

  chatBadge: {
    zIndex: 6,
  },

  featureCircle: {
    backgroundColor: '#172554',
    borderWidth: 1,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#38BDF8',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  featureIcon: {
    textAlign: 'center',
  },

  featureText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 3,
  },

  /* =======================================================
     CAR
  ======================================================= */

  carContainer: {
    position: 'absolute',
    zIndex: 2,
  },

  car: {
    includeFontPadding: false,
  },

  /* =======================================================
     PHONE
  ======================================================= */

  phone: {
    position: 'absolute',
    backgroundColor: '#0B163C',
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
    paddingTop: 20,
    zIndex: 4,

    shadowColor: '#38BDF8',
    shadowOpacity: 0.65,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 12,
  },

  phoneNotch: {
    position: 'absolute',
    top: 5,
    width: 35,
    height: 6,
    borderRadius: 5,
    backgroundColor: '#020617',
  },

  phoneTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },

  qrBox: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  qr: {
    color: '#020617',
  },

  scanText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
  },

  secureText: {
    color: '#34D399',
    marginTop: 7,
    fontWeight: '700',
  },

  /* =======================================================
     BENEFITS
  ======================================================= */

  benefits: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 91, 0.75)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
    marginBottom: 12,
  },

  benefit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },

  benefitIcon: {
    marginBottom: 3,
  },

  benefitTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  benefitText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },

  divider: {
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
  },

  /* =======================================================
     BUTTONS
  ======================================================= */

  buttonContainer: {
    width: '100%',
    gap: 10,
  },

  primaryButton: {
    width: '100%',
    borderRadius: 17,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#2563EB',
    shadowOpacity: 0.55,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 8,
  },

  arrowCircle: {
    position: 'absolute',
    left: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    color: '#2563EB',
    fontWeight: '800',
  },

  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  secondaryButton: {
    width: '100%',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#64748B',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  userIcon: {
    color: '#FFFFFF',
    marginRight: 8,
  },

  secondaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  footerIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  footerText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
});

