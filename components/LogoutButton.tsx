import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../lib/auth-context';

export default function LogoutButton({ variant = 'default' }: { variant?: 'default' | 'drawer' }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <Pressable onPress={handleLogout} style={[styles.button, variant === 'drawer' && styles.drawer]}>
      <LogOut size={18} />
      <Text style={styles.label}>Log out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  drawer: { marginTop: 'auto', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e2e2e2' },
  label: { fontSize: 16 },
});