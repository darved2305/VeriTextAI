import Bounded from "@/components/Bounded";
import StarBackground from "./StarBackground";
import Image from "next/image";
import background from "./background.jpg";
import React from "react";
import AnimatedContent from "./AnimatedContent";

const Integrations = (): JSX.Element => {
  return (
    <Bounded className="relative overflow-hidden">
      <Image
        src={background}
        alt=""
        fill
        className="object-cover opacity-30"
        quality={90}
      />
      <StarBackground />

      <div className="relative">
        <h2 className="mx-auto max-w-2xl text-balance text-center text-5xl font-medium text-slate-900 md:text-7xl">
          Connects with your education platforms
        </h2>

        <div className="mx-auto mt-6 max-w-md text-balance text-center text-slate-600">
          <p>One-click integration with Canvas, Blackboard, Moodle, Google Classroom, Schoology, and more. No API keys, no developer required.</p>
        </div>

        <AnimatedContent />
      </div>
    </Bounded>
  );
};

export default Integrations;
