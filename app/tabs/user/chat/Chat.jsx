import ChatListCard from "../../../../src/components/common/ChatListCard";
import { useNavigation } from "@react-navigation/native";
import { MyBookings } from "../../../../src/services/user";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import { View, Text, StyleSheet /* etc... */ } from "react-native";
import { useEffect, useState } from "react";

export default function Chat() {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

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

    return (
        <>
            {/* <CustomHeader/> */}

            <ChatListCard
                data={userData}
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
        </>
    )
}