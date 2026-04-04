import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TESTIMONIALS = [
  {
    id: '1',
    name: 'Rahul Sharma',
    role: 'Student',
    msg: 'Aastroneet ne meri career clarity mein bahut madad ki. Counsellors bahut supportive hain! ❤️',
    rating: 5,
    img: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: '2',
    name: 'Priya Verma',
    role: 'Professional',
    msg: 'The best platform for mental peace. Ek session ke baad hi mujhe kaafi light feel hua.',
    rating: 5,
    img: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: '3',
    name: 'Amit Patel',
    role: 'Parent',
    msg: 'Highly professional experts. Interface bahut smooth hai aur guidance top-notch.',
    rating: 4,
    img: 'https://i.pravatar.cc/150?u=3'
  },
];

const WhyLoveAastroneet = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const index = useRef(0);

  // Auto-scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      index.current = index.current === TESTIMONIALS.length - 1 ? 0 : index.current + 1;
      flatListRef.current?.scrollToIndex({
        index: index.current,
        animated: true,
      });
    }, 3500); // 3.5 seconds mein change hoga

    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.quoteIcon}>
          {/* <Ionicons name="quote" size={30} color="rgba(16, 185, 129, 0.2)" /> */}
        </View>

        <Text style={styles.message}>"{item.msg}"</Text>

        <View style={styles.profileRow}>
          <Image source={{ uri: item.img }} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color="#F27A21" />
            <Text style={styles.ratingText}>{item.rating}.0</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.badge}>⭐ Trusted by Thousands</Text>

        <Text style={styles.title}>
          Why Users <Text style={styles.highlight}>Love</Text> Aastroneet
        </Text>

        <Text style={styles.subtitle}>
          Empowering students with expert guidance, mentorship,
          and career clarity for a brighter future.
        </Text>
      </View>

      {/* Animated Carousel */}
      <FlatList
        ref={flatListRef}
        data={TESTIMONIALS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.dotContainer}>
        {TESTIMONIALS.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
    textAlign: 'center',
  },
  cardContainer: {
    width: width,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 5,
    shadowColor: '#F27A21',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  message: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  role: {
    fontSize: 12,
    color: '#F27A21',
    fontWeight: '600',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D97706',
    marginLeft: 4,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F27A21',
    marginHorizontal: 4,
  },
  header: {
  alignItems: "center",
  paddingHorizontal: 20,
  marginBottom: 25,
},

badge: {
  backgroundColor: "rgba(242,122,33,0.15)",
  color: "#F27A21",
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 20,
  fontSize: 12,
  fontWeight: "600",
  marginBottom: 8,
},

title: {
  fontSize: 24,
  fontWeight: "800",
  color: "#111827",
  textAlign: "center",
},

highlight: {
  color: "#F27A21",
},

subtitle: {
  marginTop: 8,
  fontSize: 14,
  color: "#6B7280",
  textAlign: "center",
  lineHeight: 20,
}
});

export default WhyLoveAastroneet;