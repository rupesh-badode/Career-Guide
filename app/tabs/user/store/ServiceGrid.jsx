import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ImageBackground,
    Dimensions,
    TouchableOpacity // 'See All' ko clickable banane ke liye add kiya
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 8;
const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 3);

const servicesData = [
    { id: '1', title: 'NCERT Biology\nComplete Set', tag: 'STARTS AT ₹599', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop' },
    { id: '2', title: 'NEET Previous\nYear Papers', tag: 'BEST SELLER', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop' },
    { id: '3', title: 'Physics\nConcept Builder', tag: 'STARTS AT ₹399', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop' },
    { id: '4', title: 'Chemistry\nFormula Handbook', tag: 'STARTS AT ₹299', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=600&auto=format&fit=crop' },
    { id: '5', title: 'NCERT\nRevision Notes', tag: 'HIGHLY RECOMMENDED', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=600&auto=format&fit=crop' },
    { id: '6', title: 'Complete NEET\nStudy Material', tag: 'TOP RATED', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop' },
    { id: '7', title: 'NCERT\nPhysics Notes', tag: 'STARTS AT ₹499', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop' },
    { id: '8', title: 'NEET\nQuestion Bank', tag: 'BEST SELLER', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop' },
    { id: '9', title: 'Chemistry\nPractice Papers', tag: 'STARTS AT ₹199', image: 'https://images.unsplash.com/photo-1491895200222-0fc4a4c35e18?q=80&w=600&auto=format&fit=crop' },
    { id: '10', title: 'Biology\nIllustrated Guide', tag: 'HIGHLY RECOMMENDED', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop' },
    { id: '11', title: 'NEET\nFull Syllabus', tag: 'TOP RATED', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600&auto=format&fit=crop' },
    { id: '12', title: 'NCERT\nChemistry Notes', tag: 'STARTS AT ₹499', image: 'https://kota-notes.com/wp-content/uploads/2025/09/ChatGPT-Image-Sep-12-2025-at-09_29_38-PM.jpg' },

];

export default function ServicesGrid({ ListHeaderComponent }) {

    const navigation = useNavigation();

    // Naya function jo Banner aur "Store Header" dono ko ek sath combine karega
    const renderHeader = () => {
        return (
            <View>
                {/* Parent se aaya hua Promo Banner (agar hai toh) */}
                {ListHeaderComponent}

                {/* Naya Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Aastroneet Store</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AllBooks')}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderCard = ({ item }) => {
    return (
        <TouchableOpacity
            style={styles.cardContainer}
            activeOpacity={0.9}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('AllBooks');
            }}
        >
            <ImageBackground
                source={{ uri: item.image }}
                style={styles.cardImage}
                imageStyle={{ borderRadius: 12 }}
            >
                <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{item.tag}</Text>
                </View>

                <View style={styles.darkOverlay} />

                <Text style={styles.titleText}>{item.title}</Text>
            </ImageBackground>
        </TouchableOpacity>
    );
};
    return (
        <View style={styles.container}>
            <FlatList
                data={servicesData}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                // Yahan par naya combined header pass kar rahe hain
                ListHeaderComponent={renderHeader}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    listContainer: {
        paddingHorizontal: CARD_MARGIN,
        paddingBottom: 40,
    },

    /* ---- Naye Header ke Styles ---- */
    sectionHeader: {
        flexDirection: 'row', // Items ko ek line mein laane ke liye
        justifyContent: 'space-between', // Ek left mein, dusra right mein
        alignItems: 'center', // Vertically center mein rakhne ke liye
        paddingHorizontal: 8,
        marginTop: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F27A21', // Reddish color jo aapke badges se match karega
    },
    /* ------------------------------- */

    cardContainer: {
        width: CARD_WIDTH,
        height: 190,
        margin: CARD_MARGIN,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 42,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
    },
    tagContainer: {
        backgroundColor: 'rgba((242,122,33), 0.9)', // Reddish background with some opacity
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderTopLeftRadius: 12,
        borderBottomRightRadius: 10,
        alignSelf: 'flex-start',
    },
    tagText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        borderRadius: 12,
    },
    titleText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5,
    },
});