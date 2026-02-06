import Bounded from "@/components/Bounded";
import AnimatedContent from "./AnimatedContent";

const Hero = (): JSX.Element => {
  return (
    <Bounded className="text-center">
      <AnimatedContent />
    </Bounded>
  );
};

export default Hero;
