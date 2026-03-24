import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// 👉 API IMPORTS
import { UpdateProfile } from '../../services/authAPI';
import { UpdateConsultantProfile, updateConsultantProfilePicture } from '../../services/consultantAPI';
import { UpdateMentorProfile, UpdateMentorProfilePic } from '../../services/mentorAPI';
import { removeListener } from '@reduxjs/toolkit';

const EditProfileScreen = ({ route, navigation }) => {
    // 👉 1. ROLE IDENTIFICATION
    const role = useSelector((state) => state.auth.role);
    const isCounselor = role === 'Consultant';
    const isMentor = role === 'Mentor';
    const isUser = role === 'User';


    // 👉 2. DYNAMIC THEME COLOR
    let themeColor = '#007BFF'; // Default User (Blue)
    if (isCounselor) themeColor = '#10B981'; // Green
    if (isMentor) themeColor = '#8B5CF6'; // Purple

    const { existingProfile = {} } = route.params || {};

    // --- SHARED FIELDS ---
    const [name, setName] = useState(existingProfile.name || '');
    const [phone, setPhone] = useState(existingProfile.phone || existingProfile.mobile || '');
    const [currentPicture, setCurrentPicture] = useState(existingProfile.profilePicture || null);
    const [newLocalImage, setNewLocalImage] = useState(null);

    // --- USER SPECIFIC FIELDS ---
    const [neetScore, setNeetScore] = useState(existingProfile.neetScore?.toString() || '');
    const [address, setAddress] = useState(existingProfile.address || '');

    // --- COUNSELOR & MENTOR SPECIFIC FIELDS ---
    const [specialization, setSpecialization] = useState(existingProfile.specialization || existingProfile.subject || '');
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
            allowsEditing: true, aspect: [1, 1], quality: 0.8,base64:true
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
                // 1. COUNSELOR UPDATE
                // ==========================================
                const textData = {
                    name: name,
                    mobile: phone,
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

                    // Inside your isMentor block...
                    const imageResponse = await updateConsultantProfilePicture(imageFormData);
                    if (!imageResponse.success) {
                        // 👉 CHANGED: Now it will show the actual backend error message
                        throw new Error(`Details updated, but image failed: ${imageResponse.message}`);
                    }
                }
                Alert.alert('Success', 'Consultant profile updated successfully!');
                navigation.goBack();

            } else if (isMentor) {
                // ==========================================
                // 2. MENTOR UPDATE
                // ==========================================

                // Step A: Update Text Details (JSON)
                const textData = {
                    name: name,
                    phone: phone,
                    subject: specialization,
                    experience: experience,
                    bio: bio
                };

                const textResponse = await UpdateMentorProfile(textData);

                if (!textResponse.success) {
                    throw new Error(textResponse.message || 'Failed to update mentor profile');
                }

                // Step B: Update Image (FormData) ONLY if a new image was selected
                // Inside your isMentor block, where you handle newLocalImage:

                if (newLocalImage){
                    const imageFormData = new FormData();


                    // 👉 1. Normalize the URI for Android vs iOS
                    const fileUri = Platform.OS === 'android' ? newLocalImage.uri : newLocalImage.uri.replace('file://', '');

                    // 👉 2. Get filename and extension safely
                    const filename = fileUri.split('/').pop() || 'profile.jpg';
                    let match = /\.(\w+)$/.exec(filename);
                    let type = match ? `image/${match[1]}` : `image/jpeg`;

                    // Fix jpg/jpeg strictness
                    if (type === 'image/jpg') type = 'image/jpeg';

                    imageFormData.append('profilePicture', {
                        uri: fileUri,
                        name: filename,
                        type: type,
                    });

                    console.log("Attempting to upload:", { uri: fileUri, name: filename, type: type }); // <-- Add this to see what's happening

                    const imageResponse = await UpdateMentorProfilePic(imageFormData);

                    if (!imageResponse) {
                        throw new Error(`Image failed: ${imageResponse.message}`);
                    }
                }

                Alert.alert('Success', 'Mentor profile updated successfully!');
                navigation.goBack();

            } else {
                // ==========================================
                // 3. USER UPDATE
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
                    throw new Error(response.message || 'Failed to update profile');
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
                    <Text style={styles.headerText}>Edit {role} Profile</Text>
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
                        <Text style={styles.label}>{(isCounselor || isMentor) ? 'Mobile Number' : 'Phone Number'}</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter mobile number" keyboardType="phone-pad" />
                    </View>

                    {/* --- CONDITIONAL INPUTS --- */}
                    {(isCounselor || isMentor) ? (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>{isMentor ? 'Subject / Expertise' : 'Specialization'}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={specialization}
                                    onChangeText={setSpecialization}
                                    placeholder={isMentor ? "e.g. Mathematics, Coding" : "e.g. Career Counseling"}
                                />
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

    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2 },
    headerButton: { padding: 5 },
    headerText: { fontSize: 18, fontWeight: '700', color: '#333', textTransform: 'capitalize' },
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