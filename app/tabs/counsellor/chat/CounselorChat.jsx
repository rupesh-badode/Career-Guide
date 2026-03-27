import React, { useEffect, useState } from "react";
import { Modal, Platform, StyleSheet, TouchableOpacity, View, Alert, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

import ChatListScreen from "./ChatListScreen";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import AvailabilityModal from "../manageappoinment/MyAvailabilityScreen";
import { DeleteDate, DeleteSlot, getMyAvailblity } from "../../../../src/services/consultantAPI";

export default function CounselorChat() {
    const [isAvailabilityModalVisible, setIsAvailabilityModalVisible] = useState(false);
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(false);


    const [searchQuery, setSearchQuery] = useState("");

    const insets = useSafeAreaInsets();


    useEffect(() => {
        if (isAvailabilityModalVisible) {
            fetchAvailability();
        }
    }, [isAvailabilityModalVisible]);

    const fetchAvailability = async () => {
        setLoading(true);
        const res = await getMyAvailblity();
        if (res.success) {
            setAvailability(res.data.availability);
        } else {
            Alert.alert("Error", res.message || "Failed to fetch availability");
        }
        setLoading(false);
    };

    const handleDeleteSlot = async (payload) => {
        const res = await DeleteSlot(payload);
        if (res.success) {
            fetchAvailability();
        } else {
            Alert.alert("Error", res.message || "Failed to delete slot");
        }
    };

    const handleDeleteDate = async (id) => {
        const res = await DeleteDate(id);
        if (res.success) {
            fetchAvailability();
        } else {
            Alert.alert("Error", res.message || "Failed to delete date");
        }
    };

    return (
        <>
            <CustomHeader
                routeName="CounsellorChat"
                onActionPress={() => setIsAvailabilityModalVisible(true)}
                onSearchChange={(text) => setSearchQuery(text)}
            />
            <ChatListScreen  searchQuery={searchQuery} />

            <Modal
                visible={isAvailabilityModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsAvailabilityModalVisible(false)}
            >
                <View style={[styles.modalContainer, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setIsAvailabilityModalVisible(false)}
                            style={styles.closeBtn}
                        >
                            <Ionicons name="close" size={24} color="#111827" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>My Availability</Text>
                        <View style={styles.spacer} />
                    </View>

                    {/* Content */}
                    <AvailabilityModal
                        data={availability}
                        loading={loading}
                        onDeleteSlot={handleDeleteSlot}
                        onDeleteDate={handleDeleteDate}
                    />
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6'
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827'
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20
    },
    spacer: { width: 40 }
});