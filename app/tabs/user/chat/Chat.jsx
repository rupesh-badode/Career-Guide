import ChatListCard from "../../../../src/components/common/ChatListCard";
import { useNavigation } from "@react-navigation/native";
import { MyBookings } from "../../../../src/services/user";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import { View, Text, StyleSheet /* etc... */ } from "react-native";
import { useEffect, useMemo, useState } from "react";
import FilterBottomSheet from "./FilterBottomSheet";

export default function Chat() {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await MyBookings();

            const bookingsList = res?.data || [];

            setUserData(bookingsList);
            console.log("Bookings List Loaded: ", bookingsList.length);
        } catch (err) {
            console.log("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);


    const filteredData = useMemo(() => {
        let result = userData;

        // Search text ke hisaab se filter
        if (searchQuery) {
            result = result.filter((item) => {
                const name = item?.consultantId?.name || item?.userId?.name || ""; 
                return name.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        // 👉 Yahan par aap apne API ya Data ke parameters ke hisaab se Advanced Filter logic laga sakte hain
        if (activeFilters) {
           if (activeFilters.instituteType.length > 0) {
               result = result.filter(item => activeFilters.instituteType.includes(item.instituteType))
           }
        }

        return result;
    }, [userData, searchQuery, activeFilters]);

    return (
        <>
            <CustomHeader routeName="Chat" onFilterPress={() => setIsFilterVisible(true)}  onSearchChange={(text)=>setSearchQuery(text)} />
            {/* <FilterBottomSheet/> */}
            <ChatListCard
                data={filteredData}
                isLoading={loading}
                onCardPress={(item) => {
                    navigation.navigate('CounselorProfile', {
                        counselorId: item?.consultantId?._id,
                        counselorName: item?.consultantId?.name,
                        counselorAvatar: item?.consultantId?.profilePicture // 👉 Added Avatar
                    });
                }}
                onChatPress={(item) => {
                    navigation.navigate('ChatScreen', {
                        counselorId: item?.consultantId?._id,
                        counselorName: item?.consultantId?.name,
                        counselorAvatar: item?.consultantId?.profilePicture ,
                        consultationId: item?._id// 👉 Added Avatar
                    });
                }}
                onActionPress={(item) => {
                    navigation.navigate('ChatScreen', {
                        receiverId: item?.consultantId?._id,
                        receiverName:item?.consultantId?.name,
                        receiverAvatar: item?.consultantId?.profilePicture,
                        consultationId: item?._id // 👉 Added Avatar
                    });
                }}
            />

            {/* 👉 2. Bottom Sheet Modal render karein */}
            <FilterBottomSheet 
              visible={isFilterVisible} 
              onClose={() => setIsFilterVisible(false)}
              onApply={(selectedFilters) => {
                 console.log("Applied Filters:", selectedFilters);
                 setActiveFilters(selectedFilters); // Applied filters ko state mein daal do
              }}
            />
        </>
    )
}