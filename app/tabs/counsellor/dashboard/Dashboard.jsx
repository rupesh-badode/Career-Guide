import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ==========================================
// DUMMY DATA
// ==========================================
const DASHBOARD_DATA = {
  stats: {
    totalSessions: '1,248',
    upcoming: '4',
    earnings: '$3,450',
    rating: '4.9',
  },
  todayAppointments: [
    {
      id: '1',
      clientName: 'Rahul Sharma',
      time: '10:30 AM',
      mode: 'Video Call',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      status: 'pending' // 'pending' ya 'completed'
    },
    {
      id: '2',
      clientName: 'Priya Desai',
      time: '02:00 PM',
      mode: 'Audio Call',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      status: 'pending'
    },
    {
      id: '3',
      clientName: 'Amit Patel',
      time: '09:00 AM',
      mode: 'Chat',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      status: 'completed'
    }
  ]
};

// ==========================================
// REUSABLE STAT CARD COMPONENT
// ==========================================
const StatCard = ({ title, value, icon, color, bgColor }) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function Dashboard() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* --- Welcome Header --- */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.doctorName}>Dr. Sarah Lee ✨</Text>
          <Text style={styles.subText}>Here is your summary for today.</Text>
        </View>

        {/* ==========================================
            1. 2x2 STATS GRID
        ========================================== */}
        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Sessions" 
            value={DASHBOARD_DATA.stats.totalSessions} 
            icon="people" 
            color="#3B82F6" // Blue
            bgColor="#EFF6FF"
          />
          <StatCard 
            title="Upcoming" 
            value={DASHBOARD_DATA.stats.upcoming} 
            icon="calendar" 
            color="#F59E0B" // Amber
            bgColor="#FFFBEB"
          />
          <StatCard 
            title="Earnings (This Month)" 
            value={DASHBOARD_DATA.stats.earnings} 
            icon="wallet" 
            color="#10B981" // Emerald
            bgColor="#ECFDF5"
          />
          <StatCard 
            title="Overall Rating" 
            value={DASHBOARD_DATA.stats.rating} 
            icon="star" 
            color="#F59E0B" // Gold/Amber
            bgColor="#FEF3C7"
          />
        </View>

        {/* ==========================================
            2. QUICK ACTIONS
        ========================================== */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickBtn}>
            <Ionicons name="time-outline" size={20} color="#10B981" />
            <Text style={styles.quickBtnText}>Manage Slots</Text>
          </TouchableOpacity>
          <View style={{ width: 15 }} />
          <TouchableOpacity style={styles.quickBtn}>
            <Ionicons name="cash-outline" size={20} color="#10B981" />
            <Text style={styles.quickBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* ==========================================
            3. TODAY'S APPOINTMENTS LIST
        ========================================== */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Appointments</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {DASHBOARD_DATA.todayAppointments.map((apt) => (
            <View key={apt.id} style={[styles.aptCard, apt.status === 'completed' && styles.completedAptCard]}>
              <Image source={{ uri: apt.image }} style={styles.clientImage} />
              
              <View style={styles.aptDetails}>
                <Text style={styles.clientName}>{apt.clientName}</Text>
                <View style={styles.aptMetaRow}>
                  <Ionicons 
                    name={apt.mode === 'Video Call' ? 'videocam' : apt.mode === 'Audio Call' ? 'call' : 'chatbubbles'} 
                    size={12} 
                    color="#6B7280" 
                  />
                  <Text style={styles.aptMode}>{apt.mode}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.aptTime}>{apt.time}</Text>
                </View>
              </View>

              {/* Action Button: Start ya Completed dikhana */}
              {apt.status === 'completed' ? (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.completedText}>Done</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.startBtn} activeOpacity={0.7}>
                  <Text style={styles.startBtnText}>Start</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Bottom padding for tab bar visibility */}
        <View style={{ height: 60 }} />
      </ScrollView>
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
    paddingTop:100,
  },
  scrollContent: {
    padding: 20,
  },
  
  // --- Welcome Section ---
  welcomeSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // --- Stats Grid ---
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%', // 2 cards in one row (with small gap)
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.03)' },
    }),
  },
  statHeader: {
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // --- Quick Actions ---
  quickActionsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF', // Light Indigo
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  quickBtnText: {
    color: '#10B981', // Solid Indigo
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },

  // --- Appointments List ---
  appointmentsSection: {
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  aptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 },
      web: { boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.03)' },
    }),
  },
  completedAptCard: {
    opacity: 0.7, // Thoda dim dikhega
    backgroundColor: '#F9FAFB',
  },
  clientImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  aptDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  aptMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aptMode: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  dot: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  aptTime: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  startBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5', // Light Emerald
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});