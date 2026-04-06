import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';
import * as Haptics from 'expo-haptics';

export default function PullToRefreshScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);

    // Simulate an API call or data fetch
    setTimeout(() => {
      setItems((prev) => [prev.length + 1, ...prev]);
      
      setRefreshing(false);
      
      // 2. Trigger a pleasant 'success' vibration when the loading spinner disappears
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500); // 1.5 second simulated delay
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Activity</Text>
        <Text style={styles.headerSubtitle}>Pull down to refresh</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // 👉 The Magic Happens Here
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#059669" // Color of the spinner (iOS)
            colors={['#059669']} // Color of the spinner (Android)
            progressBackgroundColor="#ffffff" // Background of the spinner (Android)
          />
        }
      >
        {items.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardText}>Activity Item #{item}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#f9fafb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
});