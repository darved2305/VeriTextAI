"use client";
import ButtonLink from "@/components/ButtonLink";
import StarGrid from "@/components/StarGrid";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

export default function AnimatedContent() {
  const container = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  gsap.registerPlugin(useGSAP);

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(
          ".hero__heading, .hero__body, .hero__button, .hero__image, .hero__glow",
          { opacity: 1 },
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      tl.fromTo(
        ".hero__heading",
        { scale: 0.5 },
        { scale: 1, opacity: 1, duration: 1.4 },
      );

      tl.fromTo(
        ".hero__body",
        { y: 20 },
        { y: 0, opacity: 1, duration: 1.2 },
        "-=0.6",
      );

      tl.fromTo(
        ".hero__button",
        { scale: 1.5 },
        { scale: 1, opacity: 1, duration: 1.3 },
        "-=0.8",
      );
      tl.fromTo(
        ".hero__image",
        { y: 100 },
        { y: 0, opacity: 1, duration: 1.3 },
        "+=0.3",
      );
      tl.fromTo(
        ".hero__glow",
        { scale: 0.5 },
        { scale: 1, opacity: 1, duration: 1.8 },
        "-=1",
      );
    },
    { scope: container },
  );

  return (
    <div className="relative" ref={container}>
      <StarGrid />
      <h1 className="hero__heading text-balance text-5xl font-medium text-slate-900 opacity-0 md:text-7xl">
        Academic integrity powered by intelligent AI
      </h1>

      <div className="hero__body mx-auto mt-6 max-w-md text-balance text-slate-600 opacity-0">
        <p>VeriText AI detects plagiarism, paraphrasing, and AI-generated content in student submissions. Integrates seamlessly with Canvas, Blackboard, Moodle, and more.</p>
      </div>

      <ButtonLink
        className="hero__button mt-8 opacity-0"
        field="/#start-free-trial"
      >
        Start Free Trial
      </ButtonLink>

      <div className="hero__image glass-container mt-16 w-fit opacity-0">
        <div className="hero__glow absolute inset-0 -z-10 bg-blue-500/20 opacity-0 blur-2xl filter" />
        <Image
          className="rounded-lg"
          src="/dashboard.png"
          alt="VeriText AI Dashboard"
          width={1200}
          height={800}
          priority
        />
      </div>
    </div>
  );
}
