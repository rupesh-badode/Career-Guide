import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, TouchableOpacity, Image, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AnimatedDashboard = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const chartData = [40, 70, 45, 90, 60, 100, 80];
  const barAnims = useRef(chartData.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideUpAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.exp), useNativeDriver: true })
    ]).start();

    const barAnimations = chartData.map((val, index) => {
      return Animated.timing(barAnims[index], {
        toValue: val,
        duration: 1000,
        delay: index * 100,
        easing: Easing.bounce,
        useNativeDriver: false,
      });
    });
    Animated.stagger(100, barAnimations).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim, slideUpAnim, pulseAnim, barAnims]);

  const renderStatCard = (title, value, icon, color) => {
    return (
      <Animated.View style={[styles.statCard, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <View style={[styles.iconWrapper, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>Dr. Aman Pandey</Text>
          </View>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop' }} style={styles.profilePic} />
        </Animated.View>

        <Animated.View style={[styles.upcomingCard, { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Upcoming in 15 mins</Text>
          </View>
          <Text style={styles.upcomingTitle}>System Design Mock Interview</Text>
          <View style={styles.upcomingDetails}>
            <Ionicons name="person-circle-outline" size={20} color="#E0E7FF" />
            <Text style={styles.upcomingStudent}>Rahul Kumar - Google Prep</Text>
          </View>
          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Join Room</Text>
            <Ionicons name="arrow-forward" size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.statsGrid}>
          {renderStatCard("Total Sessions", "128", "videocam", "#8B5CF6")}
          {renderStatCard("Students", "84", "people", "#10B981")}
          {renderStatCard("Earnings", "45K", "wallet", "#F59E0B")}
          {renderStatCard("Rating", "4.9", "star", "#EF4444")}
        </View>

        <Animated.View style={[styles.chartSection, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Engagement</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartContainer}>
            {chartData.map((val, index) => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              return (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barBackground}>
                    <Animated.View style={[styles.barFill, { height: barAnims[index].interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
                  </View>
                  <Text style={styles.barLabel}>{days[index]}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  profilePic: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#8B5CF6' },
  upcomingCard: { backgroundColor: '#8B5CF6', borderRadius: 20, padding: 20, marginBottom: 25, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7C3AED', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399', marginRight: 6 },
  liveText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  upcomingTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10 },
  upcomingDetails: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  upcomingStudent: { color: '#E0E7FF', fontSize: 14, marginLeft: 8, fontWeight: '500' },
  joinBtn: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  joinBtnText: { color: '#8B5CF6', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { backgroundColor: '#FFFFFF', width: (width - 55) / 2, padding: 16, borderRadius: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconWrapper: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  statTitle: { fontSize: 13, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  chartSection: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150, paddingTop: 10 },
  barWrapper: { alignItems: 'center', flex: 1 },
  barBackground: { height: 110, width: 12, backgroundColor: '#F3F4F6', borderRadius: 6, justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: '#8B5CF6', borderRadius: 6 },
  barLabel: { fontSize: 11, color: '#6B7280', marginTop: 10, fontWeight: '500' }
});

export default AnimatedDashboard;