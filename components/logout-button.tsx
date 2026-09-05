import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { clearTokens } from '@/lib/auth';

export function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await clearTokens();
    router.replace('/(auth)/login');
  };

  return (
    <Pressable
      style={styles.button}
      onPress={handleLogout}
      disabled={loggingOut}
      testID="logout-button">
      <ThemedText style={styles.text}>{loggingOut ? 'Logging out…' : 'Log out'}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  text: {
    color: '#dc2626',
    fontWeight: '600',
  },
});