
import { ScrollView } from "react-native";
import CounselorList from "./CounselorList";
import ImageCarousel from "./ImageCarousel";
import NewsSection from "./NewsSection";
import Blog from "./Blog";
import FeaturedBooks from "./FeaturedBooks";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import OnboardingScreen from "./OnboardingScreen";

export default function Index() {
    return (
        <>
            <CustomHeader routeName="Home" />
            <ScrollView contentContainerStyle={{ paddingBottom: 80,paddingTop:80 }} >
                <OnboardingScreen />
                <ImageCarousel />
                <CounselorList />
                <Blog />
                <FeaturedBooks />
                <NewsSection />
            </ScrollView>
            {/* <AnimatedCarousel/> */}
            {/* <ExploreSection/> */}

        </>
    )
}