import CustomHeader from '../../../../src/components/common/CustomHeader';
import AnimatedDashboard from './AnimatedDashboard';
import MentorBlogsOverview from './MentorBlogsOverview';
import MentorImageCarousel from './MentorImageCarousel';

export default function MentorDashboard() {
  return (
    <>
    <CustomHeader/>
    {/* <AnimatedDashboard/> */}
    <MentorImageCarousel/>
    <MentorBlogsOverview/>
    </>
  );
}
