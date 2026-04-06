import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function PromoBanner() {

  const navigation = useNavigation();

  return (
    <View style={styles.cardContainer}>
      
      {/* --- Left Side: Content Section --- */}
      <View style={styles.leftSection}>
        {/* Top Text */}
        <Text style={styles.unlockText}>
          You've unlocked a <Text style={styles.surpriseText}>SURPRISE!</Text>
        </Text>

        {/* Pricing Text */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLarge}>₹5</Text>
          <Text style={styles.priceSmall}>/min only</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.chatButton} activeOpacity={0.8} onPress={() => navigation.navigate('Appointments')}>
          <Text style={styles.buttonText}>Chat Now</Text>
        </TouchableOpacity>

        {/* Terms & Conditions */}
        <Text style={styles.termsText}>*On next chat with astrologer</Text>
      </View>

      {/* --- Right Side: Image & Yellow Background Section --- */}
      <View style={styles.rightSection}>
        {/* Dotted Pattern (Top Right Corner) */}
        <View style={styles.dotsContainer}>
          <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
          <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
          <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
        </View>

        {/* Person Image */}
        {/* Note: Yahan aap apne local image ka path daal sakte hain jaise require('./assets/actor.png') */}
        <Image 
          source={{ uri: 'https://img.freepik.com/free-photo/entrepreneurs-discussing-work-results-meeting_1163-5277.jpg?semt=ais_incoming&w=740&q=80' }} // Placeholder
          style={styles.personImage} 
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    width: width - 30, // Screen width se thoda padding chhod kar
    height: 150, // Fixed height taaki banner ka proportion sahi rahe
    alignSelf: 'center',
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden', // Extra content (jaise image) bahar na nikle
    // Shadow for premium look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },

  // --- Left Section Styles ---
  leftSection: {
    flex: 1.2, // Left part thoda zyada space lega
    backgroundColor: '#FAF5E3', // Light Cream Color
    paddingLeft: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  unlockText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  surpriseText: {
    color: '#E03C31', // Red color for SURPRISE!
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 5,
  },
  priceLarge: {
    fontSize: 38,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  priceSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 2,
  },
  chatButton: {
    backgroundColor: '#F27A21', // Vibrant Yellow
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20, // Pill shape
    alignSelf: 'flex-start', // Button content ke hisaab se wrap ho jayega
    marginTop: 5,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  termsText: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 10,
  },

  // --- Right Section Styles ---
  rightSection: {
    flex: 0.8, // Right part
    backgroundColor: '#F27A21', // Vibrant Yellow matching the button
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  personImage: {
    width: '120%', 
    height: '110%', 
    resizeMode: 'cover',
    position: 'absolute',
    bottom: -5, // Image thodi niche se cut off ho sakti hai proper look ke liye
    left: -20, // Image thodi left me overlap karegi cream background par
  },
  
  // Dotted Pattern Styles
  dotsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 20, // Grid width
    justifyContent: 'space-between',
    zIndex: 10,
  },
  dot: {
    width: 3,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1.5,
    marginBottom: 3,
  }
});