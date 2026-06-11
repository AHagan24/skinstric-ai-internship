"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import { DiamondAction } from "@/components/diamond-action";
import { landingContent } from "@/lib/landing-content";

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const secondLineRef = useRef<HTMLSpanElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);
  const takeTestRef = useRef<HTMLDivElement>(null);
  const leftDiamondRef = useRef<HTMLDivElement>(null);
  const rightDiamondRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const title = titleRef.current;
    const secondLine = secondLineRef.current;
    const discover = discoverRef.current;
    const takeTest = takeTestRef.current;
    const leftDiamond = leftDiamondRef.current;
    const rightDiamond = rightDiamondRef.current;

    if (
      !title ||
      !secondLine ||
      !discover ||
      !takeTest ||
      !leftDiamond ||
      !rightDiamond
    ) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const context = gsap.context(() => {
      gsap.set(title, { opacity: prefersReducedMotion ? 1 : 0 });

      if (!prefersReducedMotion) {
        gsap.to(title, {
          opacity: 1,
          duration: 1.5,
          ease: "power2.inOut",
        });
      }
    }, rootRef);

    const moveTitle = (
      x: number,
      lineX: number,
      oppositeDiamond: HTMLDivElement,
      hidden: boolean,
    ) => {
      if (prefersReducedMotion) {
        return;
      }

      gsap.to(oppositeDiamond, {
        opacity: hidden ? 0 : 1,
        duration: hidden ? 0.3 : 0.4,
        ease: "power2.inOut",
      });
      gsap.to(title, {
        x,
        duration: 0.7,
        delay: 0.1,
        ease: "power2.inOut",
      });
      gsap.to(secondLine, {
        x: lineX,
        duration: 0.7,
        delay: hidden ? 0.01 : 0.1,
        ease: "power2.inOut",
      });
    };

    const onDiscoverEnter = () =>
      moveTitle(320, 96, rightDiamond, true);
    const onDiscoverLeave = () => moveTitle(0, 0, rightDiamond, false);
    const onTakeTestEnter = () =>
      moveTitle(-320, -96, leftDiamond, true);
    const onTakeTestLeave = () => moveTitle(0, 0, leftDiamond, false);

    discover.addEventListener("mouseenter", onDiscoverEnter);
    discover.addEventListener("mouseleave", onDiscoverLeave);
    takeTest.addEventListener("mouseenter", onTakeTestEnter);
    takeTest.addEventListener("mouseleave", onTakeTestLeave);

    return () => {
      discover.removeEventListener("mouseenter", onDiscoverEnter);
      discover.removeEventListener("mouseleave", onDiscoverLeave);
      takeTest.removeEventListener("mouseenter", onTakeTestEnter);
      takeTest.removeEventListener("mouseleave", onTakeTestLeave);
      context.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      className="max-sm:origin-center max-sm:scale-[0.75] max-sm:p-6 lg:fixed lg:inset-0 lg:overflow-hidden"
    >
      <div className="relative flex h-[71dvh] flex-col items-center justify-center md:fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
        <MobileDiamonds />

        <div className="relative z-10 text-center max-sm:translate-y-1">
          <h1
            ref={titleRef}
            id="hero-title"
            className="text-[60px] font-light leading-none tracking-[-0.055em] opacity-0 lg:text-[100px]"
          >
            {landingContent.title[0]}
            <br />
            <span ref={secondLineRef} className="block">
              {landingContent.title[1]}
            </span>
          </h1>
        </div>

        <p className="relative z-10 mt-4 w-[30ch] text-center text-[16px] font-semibold leading-[1.45] text-[#1A1B1C]/50 max-sm:translate-y-1 lg:hidden">
          {landingContent.description}
        </p>

        <div className="relative z-10 mt-4 max-sm:translate-y-1 lg:hidden">
          <DiamondAction
            direction="right"
            href="/testing"
            label={landingContent.mobileLabel}
            compact
          />
        </div>

        <DesktopDescription />
      </div>

      <DesktopDiamond
        diamondRef={leftDiamondRef}
        side="left"
        actionRef={discoverRef}
      />
      <DesktopDiamond
        diamondRef={rightDiamondRef}
        side="right"
        actionRef={takeTestRef}
      />
    </section>
  );
}

function MobileDiamonds() {
  return (
    <div aria-hidden="true" className="absolute inset-0 lg:hidden">
      <div className="absolute left-1/2 top-1/2 size-[350px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dotted border-[#A0A4AB]" />
      <div className="absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dotted border-[#A0A4AB]" />
    </div>
  );
}

function DesktopDescription() {
  return (
    <p className="fixed bottom-[calc(-7vh)] left-[calc(-20vw)] z-10 hidden -translate-x-1 text-sm font-normal uppercase leading-[1.45] lg:block xl:left-[calc(-27vw)] 2xl:left-[calc(-31vw)] [@media(width>=1920px)]:left-[calc(-33vw)]">
      Skinstric developed an A.I. that creates a
      <br />
      highly-personalized routine tailored to
      <br />
      what your skin needs.
    </p>
  );
}

type DesktopDiamondProps = {
  side: "left" | "right";
  diamondRef: React.RefObject<HTMLDivElement | null>;
  actionRef: React.RefObject<HTMLDivElement | null>;
};

function DesktopDiamond({
  side,
  diamondRef,
  actionRef,
}: DesktopDiamondProps) {
  const isLeft = side === "left";

  return (
    <div
      ref={diamondRef}
      className={`absolute top-1/2 hidden size-[500px] -translate-y-1/2 transition-opacity duration-500 lg:block ${
        isLeft
          ? "left-[-284px]"
          : "right-[-284px]"
      }`}
    >
      <div className="relative size-full">
        <div className="absolute inset-0 rotate-45 border border-solid border-[#D8D8D8]" />
        <div
          ref={actionRef}
          className={`absolute top-1/2 z-10 -translate-y-1/2 ${
            isLeft
              ? "right-[-27px] [@media(width>=1920px)]:right-[-9px]"
              : "left-[-24px] [@media(width>=1920px)]:left-[-8px]"
          }`}
        >
          <DiamondAction
            id={isLeft ? "discover-button" : "take-test-button"}
            direction={isLeft ? "left" : "right"}
            href={isLeft ? undefined : "/testing"}
            label={
              isLeft
                ? landingContent.discoverLabel
                : landingContent.testLabel
            }
          />
        </div>
      </div>
    </div>
  );
}
