"use client";

import React from "react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import StylizedLogoMark from "./StylizedLogoMark";
import clsx from "clsx";

import {
  FaGoogle,
  FaBlackberry,
} from "react-icons/fa6";
import { SiCanvas, SiMoodle } from "react-icons/si";
import { MdSchool } from "react-icons/md";

const integrations = [
  { icon: "canvas", name: "Canvas" },
  { icon: "blackboard", name: "Blackboard" },
  { icon: "moodle", name: "Moodle" },
  { icon: "google", name: "Google Classroom" },
  { icon: "schoology", name: "Schoology" },
];

export default function AnimatedContent() {
  const container = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  gsap.registerPlugin(useGSAP);

  const icons: Record<string, JSX.Element> = {
    canvas: <SiCanvas />,
    blackboard: <FaBlackberry />,
    moodle: <SiMoodle />,
    google: <FaGoogle />,
    schoology: <MdSchool />,
  };

  useGSAP(
    () => {
      const tl = gsap.timeline({
        repeat: -1,
        defaults: { ease: "power2.inOut" },
      });

      tl.to(".pulsing-logo", {
        keyframes: [
          {
            filter: "brightness(2)",
            opacity: 1,
            duration: 0.4,
            ease: "power2.in",
          },
          {
            filter: "brightness(1)",
            opacity: 0.7,
            duration: 0.9,
          },
        ],
      });

      tl.to(
        ".signal-line",
        {
          keyframes: [
            { backgroundPosition: "0% 0%" },
            {
              backgroundPosition: "100% 100%",
              stagger: { from: "center", each: 0.3 },
              duration: 1,
            },
          ],
        },
        "-=1.4",
      );

      tl.to(
        ".pulsing-icon",
        {
          keyframes: [
            {
              opacity: 1,
              stagger: {
                from: "center",
                each: 0.3,
              },
              duration: 1,
            },
            {
              opacity: 0.4,
              duration: 1,
              stagger: {
                from: "center",
                each: 0.3,
              },
            },
          ],
        },
        "-=2",
      );
    },
    { scope: container },
  );

  return (
    <div
      className="mt-20 flex flex-col items-center md:flex-row"
      ref={container}
    >
      {integrations.map((item, index) => (
        <React.Fragment key={index}>
          {index === Math.floor(integrations.length / 2) && (
            <>
              <StylizedLogoMark />
              <div className="signal-line rotate-180 bg-gradient-to-t" />
            </>
          )}
          <div className="pulsing-icon flex aspect-square shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-3 text-3xl text-slate-600 opacity-40 shadow-sm md:text-4xl lg:text-5xl">
            {item.icon && icons[item.icon]}
          </div>
          {index !== integrations.length - 1 && (
            <div
              className={clsx(
                "signal-line",
                index >= Math.floor(integrations.length / 2)
                  ? "rotate-180"
                  : "rotate-0",
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
