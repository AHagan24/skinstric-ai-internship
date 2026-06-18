"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import { BackAction } from "@/components/back-action";

const setupDiamondLayers = [
  {
    size: 604.03,
    opacity: 0.3,
    rotation: -15,
    duration: 92,
    direction: 1,
  },
  {
    size: 498,
    opacity: 0.6,
    rotation: 0,
    duration: 110,
    direction: -1,
  },
  {
    size: 405.18,
    opacity: 1,
    rotation: 15,
    duration: 128,
    direction: 1,
  },
] as const;

export function CameraSetupState({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="absolute inset-0 overflow-x-hidden overflow-y-auto bg-[#FCFCFC] text-[#1A1B1C] min-[1080px]:overflow-hidden">
      <p className="absolute left-5 top-16 z-10 text-left text-[11px] font-semibold uppercase leading-4 sm:left-9 sm:text-xs min-[1080px]:left-8 min-[1080px]:top-[86px] min-[1080px]:text-base min-[1080px]:leading-6 min-[1080px]:tracking-[-0.02em]">
        TO START ANALYSIS
      </p>

      <div className="mx-auto flex min-h-full max-w-[960px] flex-col items-center justify-center px-4 pb-32 pt-28 text-center sm:px-6 sm:pt-32 min-[1080px]:pb-24">
        <div className="relative flex h-[min(739.78px,82vw)] w-[min(739.78px,82vw)] min-h-[280px] min-w-[280px] items-center justify-center sm:min-h-[340px] sm:min-w-[340px] min-[1080px]:h-[739.78px] min-[1080px]:w-[739.78px]">
          <CameraSetupDiamonds />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-[116px] w-[116px] items-center justify-center min-[1080px]:h-[152px] min-[1080px]:w-[152px]">
              <Image
                src="/assets/camera.png"
                alt=""
                aria-hidden="true"
                width={152}
                height={152}
                priority
                className="camera-setup-icon-pulse h-[116px] w-[116px] object-contain min-[1080px]:h-[152px] min-[1080px]:w-[152px]"
              />
            </div>

            <p className="camera-setup-text-fade mt-5 text-[16px] font-semibold uppercase leading-6 tracking-[-0.02em] text-[#1A1B1C] min-[1080px]:mt-[18px]">
              SETTING UP CAMERA ...
            </p>
          </div>
        </div>

        <div className="mt-4 flex max-w-[780px] flex-col items-center gap-5 min-[1080px]:-mt-[4px]">
          <p className="text-center text-[12px] font-normal uppercase leading-6 tracking-[-0.02em] text-[#1A1B1C] min-[1080px]:text-[14px]">
            TO GET BETTER RESULTS MAKE SURE TO HAVE
          </p>

          <div className="flex max-w-[780px] flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12px] font-normal uppercase leading-6 tracking-[-0.02em] text-[#1A1B1C] min-[1080px]:gap-x-10 min-[1080px]:text-[14px]">
            <span>&loz; NEUTRAL EXPRESSION</span>
            <span>&loz; FRONTAL POSE</span>
            <span>&loz; ADEQUATE LIGHTING</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-4 z-30 flex sm:bottom-8 sm:left-8">
        <BackAction onClick={onCancel} />
      </div>
    </div>
  );
}

function CameraSetupDiamonds() {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const context = gsap.context(() => {
      setupDiamondLayers.forEach((layer, index) => {
        const layerElement = layerRefs.current[index];

        if (!layerElement) {
          return;
        }

        gsap.set(layerElement, { rotation: layer.rotation });

        if (prefersReducedMotion) {
          return;
        }

        gsap.to(layerElement, {
          rotation: layer.rotation + 360 * layer.direction,
          duration: layer.duration,
          ease: "none",
          repeat: -1,
        });
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {setupDiamondLayers.map((layer, index) => (
        <div
          key={layer.size}
          ref={(element) => {
            layerRefs.current[index] = element;
          }}
          style={{
            width: `${layer.size}px`,
            height: `${layer.size}px`,
            opacity: layer.opacity,
          }}
          className="absolute left-1/2 top-1/2 box-border -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-[#A0A4AB] will-change-transform"
        />
      ))}
    </div>
  );
}
