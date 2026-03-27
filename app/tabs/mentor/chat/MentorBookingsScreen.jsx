import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMentorBookings } from '../../../../src/services/mentorAPI';

// 👉 Apne API file ka sahi path daalna yahan

const MentorBookingsScreen = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch Bookings Function
    const fetchBookings = async () => {
        try {
            const response = await getMentorBookings();
            if (response.success) {
                // Assuming backend returns data inside response.data.bookings ya response.data
                // Aap apne backend response ke hisaab se isko adjust kar lena:
                setBookings(response.data.bookings || response.data?.data || []);
            } else {
                Alert.alert("Error", response.message);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Something went wrong while fetching bookings.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Component Mount hone pe data laao
    useEffect(() => {
        fetchBookings();
    }, []);

    // Pull-to-refresh handler
    const onRefresh = () => {
        setIsRefreshing(true);
        fetchBookings();
    };

    // Helper: Status ke hisaab se color return karega
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return { bg: '#D1FAE5', text: '#065F46' }; // Green
            case 'pending': return { bg: '#FEF3C7', text: '#92400E' };   // Yellow/Orange
            case 'completed': return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue
            case 'cancelled': return { bg: '#FEE2E2', text: '#991B1B' }; // Red
            default: return { bg: '#F3F4F6', text: '#374151' };          // Gray
        }
    };

    // Har ek booking ka card UI
    const renderBookingCard = ({ item }) => {
        const statusStyle = getStatusColor(item.status);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.studentName}>
                        {/* Aapke backend me user ka naam jis field me aa raha ho wo daalein */}
                        {item.userName || item.student?.name || 'Student Name'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status || 'Pending'}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                            {item.date || 'DD/MM/YYYY'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                            {item.time || '10:00 AM'}
                        </Text>
                    </View>
                </View>

                {item.subject && (
                    <View style={styles.subjectContainer}>
                        <Text style={styles.subjectText}>Topic: {item.subject}</Text>
                    </View>
                )}

                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => console.log('View Details for', item._id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.actionButtonText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={18} color="#8B5CF6" />
                </TouchableOpacity>
            </View>
        );
    };

    // Jab list khali ho toh kya dikhana hai
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubText}>When students book a session with you, they will appear here.</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            

            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    renderItem={renderBookingCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light gray background to make cards pop
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3, // For Android shadow
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    studentName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    detailsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 6,
        fontWeight: '500',
    },
    subjectContainer: {
        backgroundColor: '#F3F4F6',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    subjectText: {
        fontSize: 14,
        color: '#374151',
        fontStyle: 'italic',
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        marginTop: 4,
    },
    actionButtonText: {
        color: '#8B5CF6',
        fontSize: 15,
        fontWeight: '600',
        marginRight: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4B5563',
        marginTop: 12,
    },
    emptySubText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});

export default MentorBookingsScreen;