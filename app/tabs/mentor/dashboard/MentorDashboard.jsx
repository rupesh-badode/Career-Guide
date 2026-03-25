import CustomHeader from '../../../../src/components/common/CustomHeader';
import AnimatedDashboard from './AnimatedDashboard';
import MentorBenefits from './Mentorbenifts';
import MentorBlogsOverview from './MentorBlogsOverview';
import MentorImageCarousel from './MentorImageCarousel';

export default function MentorDashboard() {
  return (
    <>
    <CustomHeader/>
    {/* <AnimatedDashboard/> */}
    <MentorBenefits/>
    <MentorImageCarousel/>
    <MentorBlogsOverview/>
    </>
  );
}
