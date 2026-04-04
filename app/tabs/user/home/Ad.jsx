import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#F27A21';

const Ad = ({ onPressRecharge }) => {
  return (
    <View style={styles.promoContainer}>
      {/* Background Decorative Circles */}
      <View style={styles.promoCircleLeft} />
      <View style={styles.promoCircleRight} />

      <View style={styles.promoContent}>
        {/* Left Side: Icon & Offer Text */}
        <View style={styles.promoLeftRow}>
          <View style={styles.promoIconWrapper}>
            <MaterialCommunityIcons name="wallet-giftcard" size={26} color={PRIMARY_COLOR} />
          </View>
          <View style={styles.promoTextCol}>
            <Text style={styles.promoTitle}>100% Cashback</Text>
            <Text style={styles.promoSubtitle}>On your first wallet recharge</Text>
          </View>
        </View>

        {/* Right Side: Recharge Button */}
        <TouchableOpacity 
          style={styles.rechargeBtn} 
          activeOpacity={0.8}
          onPress={onPressRecharge} // Yahan navigation ya action pass kar dena
        >
          <Text style={styles.rechargeBtnText}>Recharge</Text>
          <Ionicons name="flash" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promoContainer: {
    backgroundColor: '#0F172A', // Premium Dark Blue/Slate
    marginHorizontal: 20,
    marginBottom: 2,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  promoCircleLeft: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber glow
    top: -40,
    left: -20,
  },
  promoCircleRight: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    bottom: -60,
    right: -40,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: 20,
  },
  promoLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promoTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  promoSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  rechargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30, // Capsule shape
  },
  rechargeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default Ad;