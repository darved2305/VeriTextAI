import Bounded from "@/components/Bounded";
import ButtonLink from "@/components/ButtonLink";
import Image from "next/image";
import { PiGear } from "react-icons/pi";
import AnimatedContent from "./AnimatedContent";

const Showcase = (): JSX.Element => {
  return (
    <Bounded className="relative">
      <div className="glow absolute -z-10 aspect-square w-full max-w-xl rounded-full bg-blue-400/10 blur-3xl filter" />

      <AnimatedContent>
        <h2 className="text-balance text-center text-5xl font-medium text-slate-900 md:text-7xl">
          Built for your teaching workflow
        </h2>
      </AnimatedContent>
      
      <div className="mt-16 grid items-center gap-8 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-8 py-8 shadow-lg backdrop-blur-sm lg:grid-cols-3 lg:gap-0 lg:py-12">
        <div>
          <div className="w-fit rounded-lg bg-blue-500/20 p-4 text-3xl text-blue-600">
            <PiGear />
          </div>
          <div className="mt-6 text-2xl font-normal text-slate-900">
            <h3>Zero disruption. Instant setup.</h3>
          </div>

          <div className="prose mt-4 max-w-xl text-slate-600">
            <p>VeriText AI plugs directly into your existing LMS. No complicated software installation. No training videos. Students submit assignments the same way they always have—you get plagiarism reports automatically.</p>
          </div>

          <ButtonLink field="/#integrations" className="mt-6">
            See Integration Options
          </ButtonLink>
        </div>

        <Image
          src="/placeholder-workflow.svg"
          alt="Workflow integration"
          width={800}
          height={600}
          className="opacity-90 shadow-2xl lg:col-span-2 lg:pt-0 lg:-order-1 lg:translate-x-[-15%]"
        />
      </div>
    </Bounded>
  );
};

export default Showcase;
