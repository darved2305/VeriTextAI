import Hero from "@/slices/Hero";
import Bento from "@/slices/Bento";
import Showcase from "@/slices/Showcase";
import Integrations from "@/slices/Integrations";
import CaseStudies from "@/slices/CaseStudies";
import CallToAction from "@/slices/CallToAction";

export default function Index() {
  return (
    <>
      <Hero />
      <Bento />
      <Showcase />
      <Integrations />
      <CaseStudies />
      <CallToAction />
    </>
  );
}
