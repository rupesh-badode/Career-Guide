import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Linking, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Animated 
} from 'react-native';
import { getLegal } from '../../../../src/services/user';
import { Ionicons } from '@expo/vector-icons';

// Note: If using React Navigation, pass { navigation } as a prop
const LegalScreen = ({ navigation }) => {
  const [legalDoc, setLegalDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchLegalData();
  }, []);

  const fetchLegalData = async () => {
    try {
      const response = await getLegal();
      setLegalDoc(response.data); 
    } catch (error) {
      Alert.alert("Error", error.toString());
    } finally {
      setLoading(false);
      triggerAnimation();
    }
  };

  const triggerAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const openPDF = () => {
    if (legalDoc?.pdf) {
      Linking.openURL(legalDoc.pdf).catch(() => {
        Alert.alert("Error", "Could not open the PDF document.");
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header - Keeps back button accessible even while loading */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation?.goBack()} // Assuming React Navigation
        >
           <Ionicons style={styles.backIcon} name="arrow-back-outline"></Ionicons> 
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Information</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Fetching documents...</Text>
        </View>
      ) : (
        <Animated.View 
          style={[
            styles.contentContainer, 
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.card}>
            <Text style={styles.docTitle}>
              {legalDoc?.title || 'Terms & Conditions'}
            </Text>
            <Text style={styles.docSubtitle}>
              Please review our latest legal documentation.
            </Text>
            
            <TouchableOpacity 
              style={[styles.customButton, !legalDoc?.pdf && styles.disabledButton]} 
              onPress={openPDF} 
              disabled={!legalDoc?.pdf}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>View PDF Document</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    paddingRight: 15,
  },
  backIcon: {
    fontSize: 28,
    color: '#333333',
    lineHeight: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6C757D',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, // For Android shadow
  },
  docTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  docSubtitle: {
    fontSize: 15,
    color: '#6C757D',
    marginBottom: 24,
    lineHeight: 22,
  },
  customButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#A5C8F2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LegalScreen;