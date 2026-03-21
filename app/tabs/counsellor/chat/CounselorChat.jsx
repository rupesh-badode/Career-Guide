import { ScrollView } from "react-native";
import ChatListCard from "../../../../src/components/common/ChatListCard";
import ChatListScreen from "./ChatListScreen";
import CustomHeader from "../../../../src/components/common/CustomHeader";


export default function CounselorChat() {
    return (
        <>
        <CustomHeader/>
        <ChatListScreen/>
        </>
    )
}