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
import { UpdateProfile, UpdateProfilePic, getUserProfile } from '../../services/authAPI';
import { UpdateConsultantProfile, updateConsultantProfilePicture, getConsultantProfile } from '../../services/consultantAPI';
import { UpdateMentorProfile, UpdateMentorProfilePic, getMentorProfile } from '../../services/mentorAPI';

const EditProfileScreen = ({ route, navigation }) => {
    const role = useSelector((state) => state.auth.role);
    const isCounselor = role === 'Consultant';
    const isMentor = role === 'Mentor';
    const isUser = role === 'User';

    let themeColor = '#F27A21'; // App theme color

    // --- FORM STATES ---
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [currentPicture, setCurrentPicture] = useState(null);
    const [newLocalImage, setNewLocalImage] = useState(null);
    const [neetScore, setNeetScore] = useState('');
    const [address, setAddress] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [experience, setExperience] = useState('');
    const [bio, setBio] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // ⚡ 1. FETCH LATEST DATA ON MOUNT
    useEffect(() => {
        const fetchLatestProfile = async () => {
            try {
                setIsLoading(true);
                let res;
                if (isCounselor) res = await getConsultantProfile();
                else if (isMentor) res = await getMentorProfile();
                else res = await getUserProfile();

                // Safe data extraction
                const data = res?.user || res?.consultant || res?.mentor || res?.data || res;

                if (data) {
                    setName(data.name || '');
                    setPhone(data.phone || data.mobile || '');
                    setCurrentPicture(data.profilePicture || null);
                    setNeetScore(data.neetScore?.toString() || '');
                    setAddress(data.address || '');
                    setSpecialization(data.specialization || data.subject || '');
                    setExperience(data.experience?.toString() || '');
                    setBio(data.bio || '');
                }

                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
            } catch (error) {
                console.error("Fetch Profile Error:", error);
                Alert.alert("Error", "Failed to fetch latest profile data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLatestProfile();
    }, []);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "Please allow access to your camera roll.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, 
            aspect: [1, 1], 
            quality: 0.8,
        });

        if (!result.canceled) {
            setNewLocalImage(result.assets[0]);
        }
    };

    // Helper function to safely format image for FormData
    const getFormattedImageObj = (imageAsset) => {
        const localUri = imageAsset.uri;
        const filename = localUri.split('/').pop() || 'profile_image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image/jpeg`;
        
        // React Native specific fix: 'image/jpg' can cause network errors, force it to 'image/jpeg'
        if (type === 'image/jpg') type = 'image/jpeg';

        return {
            uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
            name: filename,
            type: type
        };
    };

    const handleSave = async () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Validation Error', 'Name and Phone number are required.');
            return;
        }

        setIsLoading(true);
        try {
            if (isCounselor) {
                const textResponse = await UpdateConsultantProfile({ name, mobile: phone, specialization, experience, bio });
                if (!textResponse?.success) throw new Error(textResponse?.message || "Failed to update profile details.");

                if (newLocalImage) {
                    const imageFormData = new FormData();
                    imageFormData.append('profilePicture', getFormattedImageObj(newLocalImage));
                    await updateConsultantProfilePicture(imageFormData);
                }
            } else if (isMentor) {
                const textResponse = await UpdateMentorProfile({ name, phone, subject: specialization, experience, bio });
                if (!textResponse?.success) throw new Error(textResponse?.message || "Failed to update profile details.");

                if (newLocalImage) {
                    const imageFormData = new FormData();
                    imageFormData.append('profilePicture', getFormattedImageObj(newLocalImage));
                    await UpdateMentorProfilePic(imageFormData);
                }
            } else {

                const textResponse = await UpdateProfile({ name, phone, subject: specialization, experience, bio });
                if (!textResponse?.success) throw new Error(textResponse?.message || "Failed to update profile details.");

                if (newLocalImage) {
                    const imageFormData = new FormData();
                    imageFormData.append('profilePicture', getFormattedImageObj(newLocalImage));
                    await UpdateProfilePic(imageFormData);
                }
            }

            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Update Error:', error);
            Alert.alert('Update Failed', error.message || 'Check your network connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !name) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={themeColor} />
                <Text style={{ marginTop: 10 }}>Loading Latest Profile...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Edit Profile</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.imageSection}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: newLocalImage ? newLocalImage.uri : (currentPicture || 'https://via.placeholder.com/150') }}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity style={[styles.editBadge, { backgroundColor: themeColor }]} onPress={pickImage}>
                                <Ionicons name="camera" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputContainer}><Text style={styles.label}>Full Name</Text><TextInput style={styles.input} value={name} onChangeText={setName} /></View>
                    <View style={styles.inputContainer}><Text style={styles.label}>Phone Number</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View>

                    {(isCounselor || isMentor) ? (
                        <>
                            <View style={styles.inputContainer}><Text style={styles.label}>Specialization</Text><TextInput style={styles.input} value={specialization} onChangeText={setSpecialization} /></View>
                            <View style={styles.inputContainer}><Text style={styles.label}>Experience</Text><TextInput style={styles.input} value={experience} onChangeText={setExperience} keyboardType="numeric" /></View>
                            <View style={styles.inputContainer}><Text style={styles.label}>Bio</Text><TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} multiline /></View>
                        </>
                    ) : (
                        <>
                            <View style={styles.inputContainer}><Text style={styles.label}>NEET Score</Text><TextInput style={styles.input} value={neetScore} onChangeText={setNeetScore} keyboardType="numeric" /></View>
                            <View style={styles.inputContainer}><Text style={styles.label}>Address</Text><TextInput style={[styles.input, styles.textArea]} value={address} onChangeText={setAddress} multiline /></View>
                        </>
                    )}

                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={handleSave} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Update Profile</Text>}
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
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerText: { fontSize: 18, fontWeight: '700' },
    headerSpacer: { width: 34 },
    imageSection: { alignItems: 'center', marginBottom: 30 },
    imageContainer: { position: 'relative' },
    profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#EEE' },
    editBadge: { position: 'absolute', right: 0, bottom: 0, padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
    inputContainer: { marginBottom: 15 },
    label: { fontSize: 14, color: '#444', marginBottom: 5, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9F9F9' },
    textArea: { height: 80, textAlignVertical: 'top' },
    saveButton: { paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfileScreen;