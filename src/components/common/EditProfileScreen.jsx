import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Image, ScrollView, Alert, ActivityIndicator,
    SafeAreaView, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { 
    UpdateProfile, 
} from '../../services/authAPI'; 
import { UpdateConsultantProfile, updateConsultantProfilePicture } from '../../services/consultantAPI';

const EditProfileScreen = ({ route, navigation }) => {
    const role = useSelector((state) => state.auth.role);
    const isCounselor = role === 'Consultant';
    const themeColor = isCounselor ? '#10B981' : '#007BFF';

    const { existingProfile = {} } = route.params || {};

    // --- SHARED FIELDS ---
    const [name, setName] = useState(existingProfile.name || '');
    // Using 'phone' state for both User's 'phone' and Counselor's 'mobile'
    const [phone, setPhone] = useState(existingProfile.phone || existingProfile.mobile || '');
    const [currentPicture, setCurrentPicture] = useState(existingProfile.profilePicture || null);
    const [newLocalImage, setNewLocalImage] = useState(null);

    // --- USER SPECIFIC FIELDS ---
    const [neetScore, setNeetScore] = useState(existingProfile.neetScore?.toString() || '');
    const [address, setAddress] = useState(existingProfile.address || '');

    // --- COUNSELOR SPECIFIC FIELDS ---
    const [specialization, setSpecialization] = useState(existingProfile.specialization || '');
    const [experience, setExperience] = useState(existingProfile.experience?.toString() || '');
    const [bio, setBio] = useState(existingProfile.bio || '');

    const [isLoading, setIsLoading] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1, duration: 400, useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "Please allow access to your camera roll.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.8,
        });

        if (!result.canceled) {
            setNewLocalImage(result.assets[0]);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Validation Error', 'Name and Phone/Mobile number are required.');
            return;
        }

        setIsLoading(true);

        try {
            if (isCounselor) {
                // ==========================================
                // COUNSELOR UPDATE (Uses new backend fields)
                // ==========================================
                const textData = { 
                    name: name, 
                    mobile: phone, // Mapping our phone state to backend's 'mobile'
                    specialization: specialization, 
                    experience: experience, 
                    bio: bio 
                };
                
                const textResponse = await UpdateConsultantProfile(textData);

                if (!textResponse.success) {
                    throw new Error(textResponse.message || "Failed to update details.");
                }

                if (newLocalImage) {
                    const imageFormData = new FormData();
                    const filename = newLocalImage.uri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image`;

                    imageFormData.append('profilePicture', {
                        uri: newLocalImage.uri, name: filename, type: type,
                    });

                    const imageResponse = await updateConsultantProfilePicture(imageFormData);
                    if (!imageResponse.success) {
                        throw new Error("Details updated, but failed to update profile picture.");
                    }
                }

                Alert.alert('Success', 'Consultant profile updated successfully!');
                navigation.goBack();

            } else {
                // ==========================================
                // USER UPDATE
                // ==========================================
                const formData = new FormData();
                formData.append('name', name);
                formData.append('phone', phone);
                formData.append('neetScore', neetScore);
                formData.append('address', address);

                if (newLocalImage) {
                    const filename = newLocalImage.uri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image`;

                    formData.append('profilePicture', {
                        uri: newLocalImage.uri, name: filename, type: type,
                    });
                }

                const response = await UpdateProfile(formData);

                if (response.success) {
                    Alert.alert('Success', 'Profile updated successfully!');
                    navigation.goBack();
                } else {
                    Alert.alert('Error', response.message || 'Failed to update profile');
                }
            }
        } catch (error) {
            console.error('Update Error:', error);
            Alert.alert('Error', error.message || 'Something went wrong while updating.');
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.keyboardAvoid} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Edit Profile</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <Animated.ScrollView 
                    style={[styles.container, { opacity: fadeAnim }]} 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.imageSection}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{
                                    uri: newLocalImage ? newLocalImage.uri : (currentPicture || 'https://via.placeholder.com/150')
                                }}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity style={[styles.editBadge, { backgroundColor: themeColor }]} onPress={pickImage} activeOpacity={0.8}>
                                <Ionicons name="camera" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* --- SHARED INPUTS --- */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter full name" />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{isCounselor ? 'Mobile Number' : 'Phone Number'}</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter mobile number" keyboardType="phone-pad" />
                    </View>

                    {/* --- CONDITIONAL INPUTS --- */}
                    {isCounselor ? (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Specialization</Text>
                                <TextInput style={styles.input} value={specialization} onChangeText={setSpecialization} placeholder="e.g. Career Counseling" />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Experience (Years)</Text>
                                <TextInput style={styles.input} value={experience} onChangeText={setExperience} placeholder="e.g. 5" keyboardType="numeric" />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Bio</Text>
                                <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder="Tell us about your professional background" multiline numberOfLines={4} />
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>NEET Score</Text>
                                <TextInput style={styles.input} value={neetScore} onChangeText={setNeetScore} placeholder="Enter your NEET score" keyboardType="numeric" />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Address</Text>
                                <TextInput style={[styles.input, styles.textArea]} value={address} onChangeText={setAddress} placeholder="Enter your full address" multiline numberOfLines={4} />
                            </View>
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: themeColor, shadowColor: themeColor }, isLoading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>Update Profile</Text>
                        )}
                    </TouchableOpacity>
                </Animated.ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    keyboardAvoid: { flex: 1 },
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2 },
    headerButton: { padding: 5 },
    headerText: { fontSize: 18, fontWeight: '700', color: '#333' },
    headerSpacer: { width: 34 }, 

    imageSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    imageContainer: { position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5 },
    profileImage: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#E1E5EA' },
    editBadge: { position: 'absolute', right: 0, bottom: 5, padding: 10, borderRadius: 20, borderWidth: 3, borderColor: '#fff', elevation: 4 },

    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, color: '#444', marginBottom: 8, fontWeight: '600' },
    input: { borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 10, padding: 14, fontSize: 16, color: '#333', backgroundColor: '#FAFAFA' },
    textArea: { height: 100, textAlignVertical: 'top' },

    saveButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 15, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
    saveButtonDisabled: { backgroundColor: '#D1D5DB', elevation: 0, shadowOpacity: 0 },
    saveButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
});

export default EditProfileScreen;