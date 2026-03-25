import CustomHeader from "../../../../src/components/common/CustomHeader";
import ManageAppointments from "./ManageAppointments";
import ScheduleCalendar from "./ScheduleCalendar";
import UpcomingSessions from "./UpcomingSessions";

export default function Request(){
    return(
        <>
        <CustomHeader />
        {/* <ManageAppointments/> */}
        {/* <UpcomingSessions/> */}
        <ScheduleCalendar/>
        </>
    )
}