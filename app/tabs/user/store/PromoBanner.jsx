import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

export default function PromoBanner() {
  return (
    <View style={styles.container}>
      {/* Store ka Main Title */}
      <Text style={styles.storeTitle}>Trending Books</Text>

      {/* Banner Container */}
      <View style={styles.bannerWrapper}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000&auto=format&fit=crop' }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.discountText}>40%</Text>
            <Text style={styles.subText}>Off on All books</Text>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10, 
    alignItems: 'center',
  },
  storeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start', // Title ko left align karne ke liye
    marginBottom: 15,
    paddingLeft: 5,
  },
  bannerWrapper: {
    width: width * 0.92, // Screen width ke hisaab se perfect adjust kiya
    height: 160,        
    borderRadius: 15,   
    overflow: 'hidden', 
    elevation: 5,       
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Thoda dark kiya text visibility ke liye
    justifyContent: 'center', 
    alignItems: 'center',     
  },
  discountText: {
    color: '#ffffff',
    fontSize: 48, 
    fontWeight: '900', 
    textShadowColor: 'rgba(0, 0, 0, 0.5)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: -5, 
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});