import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const SecurePaymentBadges = () => {
  return (
    <View style={styles.container}>
      {/* 🛡️ 100% Secure Badge */}
      <View style={styles.badgeItem}>
        <MaterialCommunityIcons name="shield-check-outline" size={24} color="#10B981" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>100% Secure</Text>
          <Text style={styles.subtitle}>Verified Experts</Text>
        </View>
      </View>

      <View style={styles.verticalDivider} />

      {/* 🔒 Safe Payment Badge */}
      <View style={styles.badgeItem}>
        <Ionicons name="lock-closed-outline" size={22} color="#F27A21" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Safe Payment</Text>
          <Text style={styles.subtitle}>SSL Encrypted</Text>
        </View>
      </View>

      <View style={styles.verticalDivider} />

      {/* 💳 Trusted Gateway Badge */}
      <View style={styles.badgeItem}>
        <MaterialCommunityIcons name="credit-card-check-outline" size={24} color="#3B82F6" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Trusted</Text>
          <Text style={styles.subtitle}>Gateway</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB', // Light gray background
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 20,
    marginBottom: 20,
  },
  badgeItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#E5E7EB', // Faint line between items
  },
});

export default SecurePaymentBadges;