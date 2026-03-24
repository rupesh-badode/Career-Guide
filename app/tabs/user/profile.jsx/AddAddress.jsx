import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addAdress } from '../../../../src/services/user';

const AddAddress = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    state: '',
    city: '',
    addressLine: '',
    isDefault: false,
  });

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validateForm = () => {
    const { name, phone, pincode, state, city, addressLine } = form;
    if (!name || !phone || !pincode || !state || !city || !addressLine) {
      Alert.alert("Missing Fields", "Please fill in all the details to continue.");
      return false;
    }
    if (phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number.");
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await addAdress(form);
      Alert.alert("Success", "Address saved successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert("Error", err || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Contact Info */}
          <Text style={styles.sectionTitle}>Contact Details</Text>
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              value={form.name} 
              onChangeText={(val) => handleInputChange('name', val)} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="call-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="10-digit Mobile Number" 
              keyboardType="phone-pad" 
              maxLength={10}
              value={form.phone} 
              onChangeText={(val) => handleInputChange('phone', val)} 
            />
          </View>

          {/* Address Info */}
          <Text style={styles.sectionTitle}>Address Details</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <TextInput 
                style={styles.input} 
                placeholder="Pincode" 
                keyboardType="numeric" 
                maxLength={6}
                value={form.pincode} 
                onChangeText={(val) => handleInputChange('pincode', val)} 
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <TextInput 
                style={styles.input} 
                placeholder="State" 
                value={form.state} 
                onChangeText={(val) => handleInputChange('state', val)} 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.input} 
              placeholder="City / District" 
              value={form.city} 
              onChangeText={(val) => handleInputChange('city', val)} 
            />
          </View>

          <View style={[styles.inputGroup, styles.textAreaContainer]}>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="House No., Building Name, Road Area" 
              multiline 
              numberOfLines={3}
              value={form.addressLine} 
              onChangeText={(val) => handleInputChange('addressLine', val)} 
            />
          </View>

          {/* Default Switch */}
          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.switchLabel}>Set as Default Address</Text>
              <Text style={styles.switchSubLabel}>This address will be selected by default for future orders.</Text>
            </View>
            <Switch 
              value={form.isDefault} 
              onValueChange={(val) => handleInputChange('isDefault', val)}
              trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
              thumbColor={form.isDefault ? "#2563eb" : "#f4f3f4"}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveBtn, loading && styles.disabledBtn]} 
          onPress={handleSaveAddress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Address</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' ,paddingTop:40 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 22, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 12, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputGroup: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#0f172a' },
  row: { flexDirection: 'row', gap: 12 },
  textAreaContainer: { alignItems: 'flex-start' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  switchContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  switchLabel: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  switchSubLabel: { fontSize: 12, color: '#64748b', marginTop: 2, maxWidth: '80%' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  saveBtn: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  disabledBtn: { backgroundColor: '#94a3b8' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AddAddress;