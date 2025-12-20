import PlainLogo from "./PlainLogo";
import Bounded from "@/components/Bounded";
import ButtonLink from "@/components/ButtonLink";

const CallToAction = (): JSX.Element => {
  return (
    <Bounded className="relative py-32 text-center font-medium md:py-40">
      <div className="glow absolute -z-10 aspect-square w-full max-w-sm rounded-full bg-blue-500/20 blur-[160px] filter" />

      <div className="glass-container rounded-lg bg-gradient-to-b from-white to-slate-100 p-4 shadow-lg md:rounded-xl">
        <PlainLogo />
      </div>

      <div className="mt-8 max-w-xl text-balance text-5xl text-slate-900">
        Protect academic integrity with confidence
      </div>

      <ButtonLink field="/#start-trial" className="mt-6">
        Start Free 30-Day Trial
      </ButtonLink>
    </Bounded>
  );
};

export default CallToAction;
