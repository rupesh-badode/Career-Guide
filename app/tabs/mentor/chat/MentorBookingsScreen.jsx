import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getMentorBookings } from '../../../../src/services/mentorAPI';
import AvailableModal from '../appoinment/AvailableModal';

// 👉 ACCEPT searchQuery prop
const MentorBookingsScreen = ({ searchQuery = "" }) => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const navigation = useNavigation();

    const fetchBookings = async () => {
        try {
            const response = await getMentorBookings();
            if (response.success) {
                setBookings(response.bookings || response.data?.bookings || []);
            } else {
                Alert.alert("Error", response.message || "Failed to fetch bookings.");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Something went wrong while fetching bookings.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchBookings();
    };

    // 🔥 SMART SEARCH FILTER LOGIC
    const filteredBookings = useMemo(() => {
        if (!searchQuery) return bookings; // Agar search khali hai toh sab dikhao

        return bookings.filter((item) => {
            const studentName = item.user?.name?.toLowerCase() || '';
            const status = item.status?.toLowerCase() || '';
            const query = searchQuery.toLowerCase();

            // Name ya Status (e.g. 'pending') kisi se bhi match kar jaye
            return studentName.includes(query) || status.includes(query);
        });
    }, [bookings, searchQuery]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return { bg: '#D1FAE5', text: '#065F46' };
            case 'pending': return { bg: '#FEF3C7', text: '#92400E' };
            case 'completed': return { bg: '#DBEAFE', text: '#1E40AF' };
            case 'cancelled': return { bg: '#FEE2E2', text: '#991B1B' };
            default: return { bg: '#F3F4F6', text: '#374151' };
        }
    };

    // NAVIGATION HANDLERS
    const handleChat = (item) => {
        navigation.navigate('ChatScreen', {
            receiverId: item.user?._id,
            receiverName: item.user?.name,
            receiverAvatar: item.user?.profilePicture,
            consultationId: item._id,
            senderId: item.mentor?._id,
        });
    };

    const handleAudioCall = (item) => {
        navigation.navigate('AudioCall', {
            roomName: `room_${item._id}`,
        });
    };

    const handleVideoCall = (item) => {
        navigation.navigate('VideoCall', {
            roomName: `room_${item._id}`,
        });
    };

    const renderBookingCard = ({ item }) => {
        const statusStyle = getStatusColor(item.status);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.studentInfo}>
                        <Text style={styles.studentName} numberOfLines={1}>
                            {item.user?.name || 'Unknown Student'}
                        </Text>
                        <Text style={styles.studentEmail} numberOfLines={1}>
                            {item.user?.email || 'No email provided'}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status || 'Pending'}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{item.date || 'DD/MM/YYYY'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{item.time || '10:00 AM'}</Text>
                    </View>
                </View>

                <View style={styles.extraDetailsRow}>
                    <View style={styles.smallBadge}>
                        <Ionicons name="hourglass-outline" size={14} color="#F27A21" />
                        <Text style={styles.smallBadgeText}>{item.duration} Mins</Text>
                    </View>
                    <View style={styles.smallBadge}>
                        <Ionicons name="wallet-outline" size={14} color="#10B981" />
                        <Text style={[styles.smallBadgeText, { color: '#10B981' }]}>
                            ₹{item.amount} ({item.paymentStatus})
                        </Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleChat(item)}>
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#8B5CF6" />
                        <Text style={[styles.actionBtnText, { color: '#8B5CF6' }]}>Chat</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleAudioCall(item)}>
                        <Ionicons name="call-outline" size={20} color="#10B981" />
                        <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Audio</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleVideoCall(item)}>
                        <Ionicons name="videocam-outline" size={22} color="#F59E0B" />
                        <Text style={[styles.actionBtnText, { color: '#F59E0B' }]}>Video</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>
                {searchQuery ? `No results for "${searchQuery}"` : "No bookings found"}
            </Text>
            <Text style={styles.emptySubText}>
                {searchQuery ? "Try a different student name or status." : "When students book a session with you, they will appear here."}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#F27A21" />
                </View>
            ) : (
                <FlatList
                    data={filteredBookings} // 👉 UPDATE: Yahan ab filteredBookings pass karna hai
                    keyExtractor={(item, index) => item._id || index.toString()}
                    renderItem={renderBookingCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#F27A21']} />
                    }
                />
            )}

        
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 100 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, flexGrow: 1 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    studentInfo: { flex: 1, marginRight: 10 },
    studentName: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    studentEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    detailsContainer: { flexDirection: 'row', marginBottom: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
    detailText: { fontSize: 14, color: '#4B5563', marginLeft: 6, fontWeight: '500' },
    extraDetailsRow: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 12 },
    smallBadge: { flexDirection: 'row', alignItems: 'center' },
    smallBadgeText: { fontSize: 13, fontWeight: '600', color: '#F27A21', marginLeft: 4, textTransform: 'capitalize' },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        marginTop: 4,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    actionBtnText: { fontSize: 14, fontWeight: '700', marginLeft: 6 },
    divider: { width: 1, height: 24, backgroundColor: '#E5E7EB' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#4B5563', marginTop: 12 },
    emptySubText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});

export default MentorBookingsScreen;