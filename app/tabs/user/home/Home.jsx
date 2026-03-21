
import { ScrollView } from "react-native";
import CounselorList from "./CounselorList";
import ImageCarousel from "./ImageCarousel";
import NewsSection from "./NewsSection";
import BlogSection from "./Blog";
import Blog from "./Blog";
import FeaturedBooks from "./FeaturedBooks";

export default function Index() {
    return (
        <>
            <ScrollView contentContainerStyle={{paddingBottom:80}} >
                <ImageCarousel />
                <CounselorList />
                <Blog/>
                <FeaturedBooks/>
                <NewsSection />
            </ScrollView>
            {/* <AnimatedCarousel/> */}
            {/* <ExploreSection/> */}

        </>
    )
}