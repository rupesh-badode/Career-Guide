import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChangePassword } from '../../src/services/authAPI';
import { useNavigation } from '@react-navigation/native';


export default function ChangePasswordScreen() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
    });

    const navigation = useNavigation();


    const backButtonScale = useRef(new Animated.Value(1)).current;

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Animation values
    const buttonScale = useRef(new Animated.Value(1)).current;
    const messageOpacity = useRef(new Animated.Value(0)).current;

    const animateMessage = () => {
        messageOpacity.setValue(0);
        Animated.timing(messageOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
        if (status.type === 'error') setStatus({ type: '', message: '' });
    };

    const toggleVisibility = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();

        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            animateMessage();
            return;
        }
        if (formData.newPassword.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
            animateMessage();
            return;
        }

        setIsLoading(true);
        setStatus({ type: '', message: '' });

        const payload = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
        };

        // Replace with your actual API call
        const res = await ChangePassword(payload);


        if (res.success) {
            setStatus({ type: 'success', message: 'Password updated successfully!' });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            setStatus({ type: 'error', message: res.message || 'Failed to update password.' });
        }

        animateMessage();
        setIsLoading(false);
    };

    return (
        <>
            <View style={styles.topHeader}>
                <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </TouchableOpacity>
                </Animated.View>

                <Text style={styles.topHeaderTitle}>Security</Text>

                {/* Empty view to perfectly center the title */}
                <View style={{ width: 40 }} />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.inner}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Change Password</Text>
                            <Text style={styles.subtitle}>
                                Ensure your account is using a long, random password to stay secure.
                            </Text>
                        </View>

                        {/* Status Message */}
                        {status.message ? (
                            <Animated.View style={[
                                styles.messageBox,
                                status.type === 'success' ? styles.messageSuccess : styles.messageError,
                                { opacity: messageOpacity }
                            ]}>
                                <Ionicons
                                    name={status.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                                    size={20}
                                    color={status.type === 'success' ? '#15803d' : '#b91c1c'}
                                />
                                <Text style={[
                                    styles.messageText,
                                    status.type === 'success' ? styles.messageTextSuccess : styles.messageTextError
                                ]}>
                                    {status.message}
                                </Text>
                            </Animated.View>
                        ) : null}

                        {/* Current Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showPassword.current}
                                    value={formData.currentPassword}
                                    onChangeText={(val) => handleChange('currentPassword', val)}
                                    placeholder="Enter current password"
                                    placeholderTextColor="#9ca3af"
                                />
                                <TouchableOpacity onPress={() => toggleVisibility('current')} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword.current ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showPassword.new}
                                    value={formData.newPassword}
                                    onChangeText={(val) => handleChange('newPassword', val)}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#9ca3af"
                                />
                                <TouchableOpacity onPress={() => toggleVisibility('new')} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword.new ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm New Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showPassword.new}
                                    value={formData.confirmPassword}
                                    onChangeText={(val) => handleChange('confirmPassword', val)}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                        </View>

                        {/* Submit Button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 10 }}>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                disabled={isLoading || !formData.currentPassword || !formData.newPassword}
                                style={[
                                    styles.button,
                                    (isLoading || !formData.currentPassword || !formData.newPassword) && styles.buttonDisabled
                                ]}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Update Password</Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 40, // Adjusts for the status bar
        paddingBottom: 16,
        backgroundColor: '#f9fafb',
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    topHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    inner: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    messageBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    messageSuccess: {
        backgroundColor: '#f0fdf4',
    },
    messageError: {
        backgroundColor: '#fef2f2',
    },
    messageText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    messageTextSuccess: {
        color: '#15803d',
    },
    messageTextError: {
        color: '#b91c1c',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111827',
    },
    eyeIcon: {
        padding: 12,
    },
    button: {
        backgroundColor: '#F27A21',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonDisabled: {
        backgroundColor: '#eda56e',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});