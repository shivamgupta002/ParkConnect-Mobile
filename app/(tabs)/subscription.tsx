import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SubscriptionScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Subscription</ThemedText>
      <ThemedText>Coming soon.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, gap: 8 },
});
