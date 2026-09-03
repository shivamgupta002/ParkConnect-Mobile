import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const carFloat = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Page entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating car animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(carFloat, {
          toValue: -8,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(carFloat, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
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

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#0F172A', '#1E3A5F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.smallText}>Welcome back 👋</Text>
              <Text style={styles.username}>ParkConnect</Text>
            </View>

            <Pressable style={styles.profileButton}>
              <Ionicons
                name="person-outline"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={18}
              color="#38BDF8"
            />

            <View>
              <Text style={styles.locationLabel}>Current location</Text>
              <Text style={styles.locationText}>
                Greater Noida, India
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#94A3B8"
              style={{ marginLeft: 'auto' }}
            />
          </View>

          {/* Car illustration */}
          <Animated.View
            style={[
              styles.carContainer,
              {
                transform: [{ translateY: carFloat }],
              },
            ]}
          >
            <Ionicons
              name="car-sport"
              size={100}
              color="#38BDF8"
            />
          </Animated.View>
        </LinearGradient>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={21}
            color="#64748B"
          />

          <Text style={styles.searchText}>
            Search parking near you
          </Text>

          <View style={styles.filterButton}>
            <Ionicons
              name="options-outline"
              size={20}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Main CTA */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale }],
          }}
        >
          <Pressable
            onPress={animateButton}
            style={styles.mainButtonWrapper}
          >
            <LinearGradient
              colors={['#2563EB', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainButton}
            >
              <View>
                <Text style={styles.mainButtonTitle}>
                  Find Parking
                </Text>

                <Text style={styles.mainButtonSubtitle}>
                  Discover nearby parking spaces
                </Text>
              </View>

              <View style={styles.arrowCircle}>
                <Ionicons
                  name="arrow-forward"
                  size={23}
                  color="#2563EB"
                />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.seeAll}>View all</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionGrid}>
          <QuickAction
            icon="qr-code-outline"
            title="Scan QR"
            subtitle="Scan parking QR"
            iconColor="#2563EB"
          />

          <QuickAction
            icon="ticket-outline"
            title="My Parking"
            subtitle="View bookings"
            iconColor="#8B5CF6"
          />

          <QuickAction
            icon="time-outline"
            title="History"
            subtitle="Past parking"
            iconColor="#F59E0B"
          />

          <QuickAction
            icon="heart-outline"
            title="Favorites"
            subtitle="Saved places"
            iconColor="#EF4444"
          />
        </View>

        {/* Nearby parking */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Parking</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        <ParkingCard
          name="City Centre Parking"
          distance="0.8 km"
          available="24 spots"
          price="₹30/hr"
        />

        <ParkingCard
          name="Gaur City Parking"
          distance="1.4 km"
          available="12 spots"
          price="₹40/hr"
        />

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------------------------------------------
   QUICK ACTION COMPONENT
--------------------------------------------------- */

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  iconColor: string;
};

function QuickAction({
  icon,
  title,
  subtitle,
  iconColor,
}: QuickActionProps) {
  return (
    <Pressable style={styles.actionCard}>
      <View
        style={[
          styles.actionIcon,
          { backgroundColor: `${iconColor}18` },
        ]}
      >
        <Ionicons
          name={icon}
          size={25}
          color={iconColor}
        />
      </View>

      <Text style={styles.actionTitle}>{title}</Text>

      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

/* ---------------------------------------------------
   PARKING CARD
--------------------------------------------------- */

type ParkingCardProps = {
  name: string;
  distance: string;
  available: string;
  price: string;
};

function ParkingCard({
  name,
  distance,
  available,
  price,
}: ParkingCardProps) {
  return (
    <Pressable style={styles.parkingCard}>
      <View style={styles.parkingIconContainer}>
        <Ionicons
          name="car-outline"
          size={28}
          color="#2563EB"
        />
      </View>

      <View style={styles.parkingInfo}>
        <Text style={styles.parkingName}>{name}</Text>

        <View style={styles.parkingMeta}>
          <Ionicons
            name="location-outline"
            size={14}
            color="#64748B"
          />

          <Text style={styles.metaText}>{distance}</Text>

          <View style={styles.dot} />

          <Ionicons
            name="checkmark-circle-outline"
            size={14}
            color="#22C55E"
          />

          <Text style={styles.availableText}>
            {available}
          </Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{price}</Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#94A3B8"
        />
      </View>
    </Pressable>
  );
}

/* ---------------------------------------------------
   STYLES
--------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* HEADER */

  header: {
    height: 300,
    paddingTop: 60,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  smallText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 4,
  },

  username: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    gap: 9,
  },

  locationLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },

  locationText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },

  carContainer: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    opacity: 0.9,
  },

  /* SEARCH */

  searchContainer: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: -30,
    paddingLeft: 18,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },

  searchText: {
    color: '#94A3B8',
    fontSize: 15,
    flex: 1,
  },

  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* MAIN BUTTON */

  mainButtonWrapper: {
    marginHorizontal: 20,
    marginTop: 22,
  },

  mainButton: {
    minHeight: 100,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },

  mainButtonTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  mainButtonSubtitle: {
    color: '#DBEAFE',
    fontSize: 12,
    marginTop: 5,
  },

  arrowCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },

  seeAll: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ACTION GRID */

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 10,
  },

  actionCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  actionTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },

  actionSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },

  /* PARKING */

  parkingCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  parkingIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  parkingInfo: {
    flex: 1,
    marginLeft: 13,
  },

  parkingName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  parkingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 4,
  },

  metaText: {
    fontSize: 11,
    color: '#64748B',
  },

  availableText: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '600',
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 3,
  },

  priceContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },

  price: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
});