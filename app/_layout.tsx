import { useEffect } from 'react';
import { router, Slot, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../lib/auth-context';

SplashScreen.preventAutoHideAsync();

function Gate() {
  const { authState } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (authState === null) return; // still resolving, splash stays up

    const group = segments[0]; // '(auth)' | '(owner)' | '(admin)' | undefined

    if (authState.status === 'unauthenticated' && group !== '(auth)') {
      router.replace('/(auth)/login');
    } else if (authState.status === 'owner' && group !== '(owner)') {
      router.replace('/(owner)');
    } else if (authState.status === 'admin' && group !== '(admin)') {
      router.replace('/(admin)');
    }

    SplashScreen.hideAsync();
  }, [authState, segments]);

  if (authState === null) return null; // splash screen covers this frame

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}