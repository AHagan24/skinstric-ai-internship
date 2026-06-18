"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import { BackAction } from "@/components/back-action";
import { DiamondAction } from "@/components/diamond-action";
import { ProceedAction } from "@/components/proceed-action";
import { landingContent } from "@/lib/landing-content";

const DESKTOP_HERO_TITLE_BOX_CLASS = "lg:h-[240px] lg:w-[680px]";
const DESKTOP_HERO_TITLE_CLASS =
  "lg:text-[128px] lg:leading-[120px] lg:tracking-[-0.07em]";
const DESKTOP_HERO_ACTION_TEXT_CLASS =
  "font-roobert text-[14px] font-semibold uppercase leading-4 tracking-[-0.02em]";

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
      className="px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8 lg:fixed lg:inset-0 lg:overflow-hidden lg:px-0 lg:pb-0 lg:pt-0"
    >
      <div
        className="relative flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-center lg:fixed lg:left-1/2 lg:top-1/2 lg:h-[71dvh] lg:-translate-x-1/2 lg:-translate-y-1/2"
      >
        <MobileDiamonds />

        <div
          className={`relative z-10 text-center ${DESKTOP_HERO_TITLE_BOX_CLASS}`}
        >
          <h1
            ref={titleRef}
            id="hero-title"
            className={`font-roobert text-[clamp(3rem,14vw,4.6rem)] font-light leading-[0.92] tracking-[-0.06em] opacity-0 sm:text-[clamp(4.4rem,12vw,5.8rem)] ${DESKTOP_HERO_TITLE_CLASS}`}
          >
            {landingContent.title[0]}
            <br />
            <span ref={secondLineRef} className="block">
              {landingContent.title[1]}
            </span>
          </h1>
        </div>

        <p className="relative z-10 mt-4 w-full max-w-[30ch] text-center text-[15px] font-semibold leading-[1.45] text-[#1A1B1C]/50 sm:text-[16px] lg:hidden">
          {landingContent.description}
        </p>

        <div className="relative z-10 mt-4 lg:hidden">
          <DiamondAction
            direction="right"
            href="/testing"
            label={landingContent.mobileLabel}
            compact
          />
        </div>
      </div>

      <DesktopDescription />

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
      <div className="absolute left-1/2 top-1/2 size-[min(76vw,350px)] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dotted border-[#A0A4AB]" />
      <div className="absolute left-1/2 top-1/2 size-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dotted border-[#A0A4AB]" />
    </div>
  );
}

function DesktopDescription() {
  return (
    <p className="absolute bottom-[clamp(1.75rem,4.5vh,3.25rem)] left-[clamp(1.5rem,6vw,6rem)] z-10 hidden w-full max-w-none text-left text-sm font-normal uppercase leading-[1.45] lg:block">
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
  const label = isLeft
    ? landingContent.discoverLabel
    : landingContent.testLabel;
  const labelClassName = isLeft
    ? "h-4 w-[90px] text-right opacity-70"
    : "h-4 w-[67px] text-left opacity-70";

  return (
    <div
      ref={diamondRef}
      className={`absolute top-1/2 hidden size-[500px] -translate-y-1/2 transition-opacity duration-500 lg:block ${
        isLeft
          ? "left-[-220px] xl:left-[-252px] 2xl:left-[-284px]"
          : "right-[-220px] xl:right-[-252px] 2xl:right-[-284px]"
      }`}
    >
      <div className="relative size-full">
        <div className="absolute inset-0 rotate-45 border border-solid border-[#D8D8D8]" />
        <div
          ref={actionRef}
          className={`absolute top-1/2 z-10 -translate-y-1/2 ${
            isLeft
              ? "right-[12px] xl:right-[-10px] [@media(width>=1920px)]:right-[-9px]"
              : "left-[12px] xl:left-[-10px] [@media(width>=1920px)]:left-[-8px]"
          }`}
        >
          <DesktopHeroAction
            isLeft={isLeft}
            label={label}
            labelClassName={labelClassName}
          />
        </div>
      </div>
    </div>
  );
}

function DesktopHeroAction({
  isLeft,
  label,
  labelClassName,
}: {
  isLeft: boolean;
  label: string;
  labelClassName: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 text-[#1A1B1C] ${
        isLeft ? "flex-row" : "flex-row-reverse"
      }`}
    >
      {isLeft ? (
        <BackAction id="discover-button" />
      ) : (
        <ProceedAction id="take-test-button" href="/testing" />
      )}
      <span className={`${DESKTOP_HERO_ACTION_TEXT_CLASS} ${labelClassName}`}>
        {label}
      </span>
    </div>
  );
}
