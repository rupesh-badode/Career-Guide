import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, Linking, Alert, ActivityIndicator, 
  StyleSheet, TouchableOpacity, Animated, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // 👉 SafeArea fixed


// 👉 API IMPORTS (Ensure these exist in your service files)
import {getMentorLegal} from "../../../../src/services/mentorAPI"
import { getLegal } from '../../../../src/services/user';
import { getConsultantLegal } from '../../../../src/services/consultantAPI';

const LegalScreen = ({ navigation }) => {
  // 👉 1. ROLE & THEME SETUP
  const role = useSelector((state) => state.auth.role) || 'User';
  const insets = useSafeAreaInsets();

  let themeColor = '#F59E0B'; // Default User (Blue)
  if (role === 'Consultant') themeColor = '#F59E0B'; // Green
  if (role === 'Mentor') themeColor = '#F59E0B'; // Purple

  const [legalDoc, setLegalDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchLegalData();
  }, [role]);

  const fetchLegalData = async () => {
    setLoading(true);
    try {
      let response;
      
      // 👉 2. ROLE-BASED API CALL
      if (role === 'Consultant') {
        response = await getConsultantLegal();
      } else if (role === 'Mentor') {
        response = await getMentorLegal();
      } else {
        response = await getLegal();
      }

      // Adjust extraction based on your actual API response structure
      setLegalDoc(response?.data?.data || response?.data); 
    } catch (error) {
      console.log("Legal Fetch Error:", error);
      Alert.alert("Error", "Failed to fetch legal documents.");
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
    if (legalDoc?.pdf || legalDoc?.url) { // Handle cases where key might be 'url'
      const pdfUrl = legalDoc.pdf || legalDoc.url;
      Linking.openURL(pdfUrl).catch(() => {
        Alert.alert("Error", "Could not open the PDF document.");
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header - Keeps back button accessible even while loading */}
      <View style={[styles.header]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation?.goBack()} >
           <Ionicons style={styles.backIcon} name="chevron-back" /> 
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Information</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeColor} />
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
            <View style={[styles.iconWrapper, { backgroundColor: `${themeColor}15` }]}>
              <Ionicons name="document-text" size={32} color={themeColor} />
            </View>

            <Text style={styles.docTitle}>
              {legalDoc?.title || 'Terms & Conditions'}
            </Text>
            <Text style={styles.docSubtitle}>
              Please review our latest legal documentation and policies to understand your rights and responsibilities as a {role}.
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.customButton, 
                { backgroundColor: themeColor, shadowColor: themeColor },
                !(legalDoc?.pdf || legalDoc?.url) && styles.disabledButton
              ]} 
              onPress={openPDF} 
              disabled={!(legalDoc?.pdf || legalDoc?.url)}
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    paddingRight: 15,
  },
  backIcon: {
    fontSize: 26,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center', // Center the card vertically
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center', // Center align text and icons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  docTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  docSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  customButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default LegalScreen;