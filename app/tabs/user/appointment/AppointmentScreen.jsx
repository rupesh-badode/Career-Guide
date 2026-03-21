import { SafeAreaView } from "react-native";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import ConsultantList from "./ConsultantList";

export default function AppointmentSreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <CustomHeader />
      <ConsultantList />
    </SafeAreaView>
  );
}