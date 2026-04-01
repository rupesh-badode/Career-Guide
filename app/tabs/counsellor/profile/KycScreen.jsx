import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreateKYC, UpdatedKYC } from '../../../../src/services/consultantAPI';

// ⚠️ API IMPORT: Update this path to where you saved CreateKYC and UpdatedKYC

const PRIMARY_COLOR = '#F59E0B';

export default function KycScreen({ route, navigation }) {
  const existingData = route?.params?.kycData || null;
  const isUpdateMode = !!existingData;
  const insets = useSafeAreaInsets(); 

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: existingData?.fullName || '',
    phone: existingData?.phone || '',
    dob: existingData?.dob || '',
    gender: existingData?.gender || 'male',
    address: existingData?.address || '',
    city: existingData?.city || '',
    state: existingData?.state || '',
    pincode: existingData?.pincode || '',
    aadharNumber: existingData?.aadharNumber || '',
    panNumber: existingData?.panNumber || '',
    accountHolderName: existingData?.accountHolderName || '',
    accountNumber: existingData?.accountNumber || '',
    ifscCode: existingData?.ifscCode || '',
    bankName: existingData?.bankName || '',
  });

  const [images, setImages] = useState({
    profileImage: existingData?.profileImage || null,
    aadharFront: existingData?.aadharFront || null,
    aadharBack: existingData?.aadharBack || null,
    panImage: existingData?.panImage || null,
    passbookImage: existingData?.passbookImage || null,
  });

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async (field) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => ({ ...prev, [field]: result.assets[0].uri }));
    }
  };

  const submitKyc = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append standard text fields
      Object.keys(form).forEach((key) => {
        if (form[key]) formData.append(key, form[key]);
      });

      // Append image files
      Object.keys(images).forEach((key) => {
        if (images[key] && !images[key].startsWith('http')) {
          const uriParts = images[key].split('.');
          const fileType = uriParts[uriParts.length - 1];
          formData.append(key, {
            uri: images[key],
            name: `${key}.${fileType}`,
            type: `image/${fileType}`,
          });
        }
      });

      // BHAi JAAN: Yahan aapki Axios wali API call use ho rahi hai
      let response;
      if (isUpdateMode) {
        response = await UpdatedKYC(formData);
      } else {
        response = await CreateKYC(formData);
      }

      // Aapke API function success aur message return karte hain
      if (response.success) {
        Alert.alert("Success", `KYC ${isUpdateMode ? 'Updated' : 'Created'} Successfully`);
        if (navigation.canGoBack()) navigation.goBack();
      } else {
        // Agar fail hua toh error message alert show karega
        Alert.alert("Error", response.message || "Something went wrong");
      }

    } catch (error) {
      Alert.alert("Error", "Failed to submit KYC");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, field, placeholder, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={form[field]}
        onChangeText={(val) => handleInputChange(field, val)}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  const renderImagePicker = (label, field) => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.imageBox} onPress={() => pickImage(field)}>
        {images[field] ? (
          <Image source={{ uri: images[field] }} style={styles.previewImage} />
        ) : (
          <Text style={styles.uploadText}>+ Tap to upload</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              onPress={() => navigation.canGoBack() ? navigation.goBack() : console.log("Can't go back")} 
              style={styles.backBtn}
            >
              <MaterialIcons name="arrow-back-ios" size={24} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{isUpdateMode ? 'Update KYC' : 'Complete KYC'}</Text>
              <Text style={styles.headerSubtitle}>Provide accurate details for verification.</Text>
            </View>
          </View>

          {/* PROFILE SECTION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            {renderImagePicker("Profile Picture", "profileImage")}
          </View>

          {/* PERSONAL DETAILS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            {renderInput("Full Name", "fullName", "e.g. John Doe")}
            {renderInput("Phone Number", "phone", "e.g. 9876543210", "phone-pad")}
            {renderInput("Date of Birth", "dob", "YYYY-MM-DD")}
            
            <Text style={styles.label}>Gender</Text>
            <View style={styles.row}>
              {['male', 'female', 'other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
                  onPress={() => handleInputChange('gender', g)}
                >
                  <Text style={[styles.genderText, form.gender === g && styles.genderTextActive]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {renderInput("Address", "address", "House No, Street")}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>{renderInput("City", "city", "City")}</View>
              <View style={{ flex: 1 }}>{renderInput("State", "state", "State")}</View>
            </View>
            {renderInput("Pincode", "pincode", "123456", "numeric")}
          </View>

          {/* DOCUMENTS SECTION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Identity Documents</Text>
            {renderInput("Aadhar Number", "aadharNumber", "12-digit number", "numeric")}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>{renderImagePicker("Aadhar Front", "aadharFront")}</View>
              <View style={{ flex: 1 }}>{renderImagePicker("Aadhar Back", "aadharBack")}</View>
            </View>

            {renderInput("PAN Number", "panNumber", "10-character alphanumeric")}
            {renderImagePicker("PAN Card Image", "panImage")}
          </View>

          {/* BANK DETAILS SECTION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            {renderInput("Account Holder Name", "accountHolderName", "Name on passbook")}
            {renderInput("Bank Name", "bankName", "e.g. State Bank of India")}
            {renderInput("Account Number", "accountNumber", "Enter account number", "numeric")}
            {renderInput("IFSC Code", "ifscCode", "e.g. SBIN0001234")}
            {renderImagePicker("Passbook / Cancelled Cheque", "passbookImage")}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity style={styles.submitBtn} onPress={submitKyc} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>{isUpdateMode ? 'Update Details' : 'Submit KYC'}</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  genderBtnActive: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#ECFDF5', 
  },
  genderText: {
    fontSize: 14,
    color: '#6B7280',
  },
  genderTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  imagePickerContainer: {
    marginBottom: 16,
  },
  imageBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: PRIMARY_COLOR,
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadText: {
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});