import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getMyKYC } from '../../../../src/services/consultantAPI'; // Ensure this path is correct

const PRIMARY_COLOR = '#10B981';

export default function KycDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchKycDetails();
    }, [])
  );

  const fetchKycDetails = async () => {
    setLoading(true);
    const response = await getMyKYC();
    if (response.success && response.data) {
      // Adjusted to use response.data directly based on your JSON structure
      setKycData(response.data.data); 
    } else {
      setKycData(null);
    }
    setLoading(false);
  };

  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    </View>
  );

  const DocumentImage = ({ title, uri }) => {
    if (!uri) return null;
    return (
      <View style={styles.docImageContainer}>
        <Text style={styles.docTitle}>{title}</Text>
        <Image source={{ uri }} style={styles.docImage} resizeMode="cover" />
      </View>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#10B981'; // Green
      case 'pending': return '#F59E0B'; // Orange
      case 'rejected': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'check-circle';
      case 'pending': return 'schedule';
      case 'rejected': return 'cancel';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.centerAll]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading KYC Details...</Text>
      </View>
    );
  }

  if (!kycData) {
    return (
      <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KYC Details</Text>
        </View>
        <View style={styles.centerAll}>
          <Ionicons name="document-text-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyText}>No KYC Details Found</Text>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => navigation.navigate('KycScreen')} 
          >
            <Text style={styles.actionBtnText}>Complete KYC Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(kycData.kycStatus);

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Details</Text>
        <View style={{flex: 1}} />
        <TouchableOpacity 
          style={styles.editIconBtn}
          onPress={() => navigation.navigate('KycScreen', { kycData })}
        >
          <MaterialIcons name="edit" size={22} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP PROFILE BANNER */}
        <View style={styles.profileBanner}>
          {/* <View style={styles.profileImageWrapper}>
            {kycData.profileImage ? (
              <Image source={{ uri: kycData.profileImage }} style={styles.profileAvatar} />
            ) : (
              <MaterialIcons name="person" size={50} color="#9CA3AF" />
            )}
          </View> */}
          <Text style={styles.profileName}>{kycData.fullName || 'User Name'}</Text>
          <Text style={styles.profilePhone}>{kycData.phone || 'No Phone'}</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <MaterialIcons name={getStatusIcon(kycData.kycStatus)} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {kycData.kycStatus ? kycData.kycStatus.toUpperCase() : 'UNKNOWN'}
            </Text>
          </View>

          {/* Show Rejection Reason if present */}
          {kycData.kycStatus === 'rejected' && kycData.rejectionReason && (
             <Text style={styles.rejectionText}>Reason: {kycData.rejectionReason}</Text>
          )}
        </View>

        {/* PERSONAL DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <DetailRow label="Date of Birth" value={kycData.dob ? new Date(kycData.dob).toDateString() : 'N/A'} />
          <DetailRow label="Gender" value={kycData.gender ? kycData.gender.charAt(0).toUpperCase() + kycData.gender.slice(1) : ''} />
          <DetailRow label="Address" value={kycData.address} />
          <DetailRow label="City & State" value={`${kycData.city || ''}, ${kycData.state || ''}`} />
          <DetailRow label="Pincode" value={kycData.pincode} />
        </View>

        {/* IDENTITY DOCUMENTS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Identity Documents</Text>
          <DetailRow label="Aadhar Number" value={kycData.aadharNumber} />
          <DetailRow label="PAN Number" value={kycData.panNumber} />
          
          <Text style={styles.subHeading}>Uploaded Files</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.docScroll}>
            <DocumentImage title="Aadhar Front" uri={kycData.aadharFront} />
            <DocumentImage title="Aadhar Back" uri={kycData.aadharBack} />
            <DocumentImage title="PAN Card" uri={kycData.panImage} />
          </ScrollView>
        </View>

        {/* BANK DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bank Details</Text>
          <DetailRow label="Account Holder" value={kycData.accountHolderName} />
          <DetailRow label="Bank Name" value={kycData.bankName} />
          <DetailRow label="Account Number" value={kycData.accountNumber} />
          <DetailRow label="IFSC Code" value={kycData.ifscCode} />
          
          {kycData.passbookImage && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.subHeading}>Passbook / Cheque</Text>
              <Image source={{ uri: kycData.passbookImage }} style={styles.passbookImg} resizeMode="cover" />
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerAll: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  editIconBtn: {
    padding: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileBanner: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#ECFDF5',
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  profilePhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  rejectionText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  docScroll: {
    flexDirection: 'row',
  },
  docImageContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  docImage: {
    width: 100,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  docTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  passbookImg: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginTop: 16,
  },
  actionBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});