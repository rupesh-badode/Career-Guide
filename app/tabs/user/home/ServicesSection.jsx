import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
// 1. useNavigation hook import karein
import { useNavigation } from '@react-navigation/native'; 

const { width } = Dimensions.get('window');

// 2. Har service mein uski target 'screen' ka naam add karein
const astrologyServices = [
  {
    id: '1',
    title: 'Chat\nMentor',
    iconName: 'message-text',
    IconComponent: MaterialCommunityIcons,
    screen: 'AllMentor', // Yahan apne Chat screen ka exact naam dalein jo Navigator mein hai
  },
  {
    id: '2',
    title: 'Call\nConsulant',
    iconName: 'phone',
    IconComponent: Feather,
    screen: 'Appointments', // Yahan apne Call screen ka exact naam dalein jo Navigator mein hai
  },
  {
    id: '3',
    title: 'Watch\nBlogs',
    iconName: 'file-text',
    IconComponent: Feather,
    screen: 'Blogs',
  },
  {
    id: '4',
    title: 'Book\nBazar',
    iconName: 'book-reader',
    IconComponent: FontAwesome5,
    screen: 'AllBooks',
  }
];

export default function ServicesSection() {
  // 3. Navigation object initialize karein
  const navigation = useNavigation(); 

  return (
    <View style={styles.container}>
      {astrologyServices.map((item) => {
        const Icon = item.IconComponent;
        return (
          <TouchableOpacity 
            key={item.id} 
            style={styles.itemContainer} 
            activeOpacity={0.7}
            // 4. onPress event mein navigate function call karein
            onPress={() => {
              if (item.screen) {
                navigation.navigate(item.screen);
              }
            }}
          >
            {/* Yellow Circular Background */}
            <View style={styles.iconCircle}>
              <Icon name={item.iconName} size={28} color="#ffffff" />
            </View>
            
            {/* Text Label */}
            <Text style={styles.titleText}>{item.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: '#FFFFFF', 
    width: '100%',
  },
  itemContainer: {
    alignItems: 'center',
    width: (width - 40) / 4, 
  },
  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 35, 
    backgroundColor: '#F59E0B', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  titleText: {
    fontSize: 13,
    color: '#6B7280', 
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18, 
  },
});