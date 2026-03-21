import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ==========================================
// DUMMY DATA
// ==========================================
const APPOINTMENTS = [
  {
    id: '1',
    studentName: 'Rahul Sharma',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: '12 Mar 2026',
    time: '10:30 AM',
    status: 'pending', // pending, upcoming, completed, cancelled
  },
  {
    id: '2',
    studentName: 'Priya Desai',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    date: '14 Mar 2026',
    time: '02:00 PM',
    status: 'pending',
  },
  {
    id: '3',
    studentName: 'Amit Patel',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    date: '10 Mar 2026',
    time: '09:00 AM',
    status: 'upcoming',
  },
  {
    id: '4',
    studentName: 'Neha Gupta',
    image: 'https://randomuser.me/api/portraits/women/72.jpg',
    date: '08 Mar 2026',
    time: '04:15 PM',
    status: 'completed',
  },
  {
    id: '5',
    studentName: 'Vikram Singh',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
    date: '05 Mar 2026',
    time: '11:00 AM',
    status: 'cancelled',
  },
];

// Tabs setup
const TABS = [
  { id: 'pending', label: 'Requests' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' }, // Completed & Cancelled will go here
];

export default function ManageAppointments({ navigation }) {
  const [activeTab, setActiveTab] = useState('pending');

  // --- Filtering Logic ---
  const filteredAppointments = APPOINTMENTS.filter(apt => {
    if (activeTab === 'past') return apt.status === 'completed' || apt.status === 'cancelled';
    return apt.status === activeTab;
  });

  // --- Helper for Status Badges ---
  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return { bg: '#FEF3C7', text: '#D97706', label: 'Pending' }; // Amber
      case 'upcoming': return { bg: '#DBEAFE', text: '#2563EB', label: 'Confirmed' }; // Blue
      case 'completed': return { bg: '#D1FAE5', text: '#059669', label: 'Completed' }; // Emerald
      case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled' }; // Red
      default: return { bg: '#F3F4F6', text: '#4B5563', label: 'Unknown' };
    }
  };

  // --- Render Single Appointment Card ---
  const renderAppointmentCard = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        
        {/* Top Row: Image, Name & Status Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Image source={{ uri: item.image }} style={styles.clientImage} />
            <Text style={styles.clientName}>{item.studentName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>

        {/* Middle Row: Date & Time */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dtItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.dtText}>{item.date}</Text>
          </View>
          <View style={styles.dtItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.dtText}>{item.time}</Text>
          </View>
        </View>

        {/* Bottom Row: Dynamic Actions based on Status */}
        <View style={styles.actionRow}>
          
          {item.status === 'pending' && (
            <>
              <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]}>
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
              <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]}>
                <Text style={styles.acceptText}>Approve</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'upcoming' && (
            <>
              <TouchableOpacity style={[styles.actionBtn, styles.rescheduleBtn]}>
                <Text style={styles.rescheduleText}>Reschedule</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
              <TouchableOpacity style={[styles.actionBtn, styles.joinBtn]}>
                <Ionicons name="videocam" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.joinText}>Join Call</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'completed' && (
            <TouchableOpacity style={[styles.actionBtn, styles.notesBtn]}>
              <Ionicons name="document-text-outline" size={16} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.notesText}>View Notes</Text>
            </TouchableOpacity>
          )}

          {item.status === 'cancelled' && (
            <Text style={styles.cancelledNote}>This session was cancelled.</Text>
          )}

        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
  
      {/* Tabs (Pending | Upcoming | Past) */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity 
              key={tab.id} 
              style={[styles.tabBtn, isActive && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        {filteredAppointments.length > 0 ? (
          <FlatList
            data={filteredAppointments}
            keyExtractor={(item) => item.id}
            renderItem={renderAppointmentCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No appointments found here.</Text>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  iconButton: {
    padding: 5,
  },
  
  // --- Tabs ---
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
  },
  activeTabBtn: {
    backgroundColor: '#10B981', // Indigo
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  // --- List & Card ---
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.04)' },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  dtItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dtText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 6,
    fontWeight: '500',
  },
  
  // --- Actions ---
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 15,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1, // Dono buttons ko equal width dega
  },
  
  // Specific Button Styles
  declineBtn: {
    backgroundColor: '#FEE2E2', // Light Red
  },
  declineText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  acceptBtn: {
    backgroundColor: '#10B981', // Emerald
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rescheduleBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  rescheduleText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  joinBtn: {
    backgroundColor: '#4F46E5', // Indigo
  },
  joinText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notesBtn: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
    flex: 0, // Shrink to fit content
  },
  notesText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  cancelledNote: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'center',
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyStateText: {
    marginTop: 15,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});