"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const diamondLayers = [
  {
    src: "/testing-rectangle-3.png",
    alt: "Large dotted diamond",
    width: 762,
    height: 762,
    size: "size-[280px] min-[380px]:size-[360px] min-[480px]:size-[480px] md:size-[762px]",
    opacity: "opacity-[0.58]",
    rotation: 8,
    duration: 90,
    direction: 1,
  },
  {
    src: "/testing-rectangle-2.png",
    alt: "Medium dotted diamond",
    width: 682,
    height: 682,
    size: "size-[232px] min-[380px]:size-[300px] min-[480px]:size-[400px] md:size-[682px]",
    opacity: "opacity-60",
    rotation: 5,
    duration: 110,
    direction: -1,
  },
  {
    src: "/testing-rectangle-1.png",
    alt: "Small dotted diamond",
    width: 602,
    height: 602,
    size: "size-[184px] min-[380px]:size-[240px] min-[480px]:size-[320px] md:size-[602px]",
    opacity: "opacity-75",
    rotation: 0,
    duration: 130,
    direction: 1,
  },
] as const;

export function RotatingDiamonds() {
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const context = gsap.context(() => {
      diamondLayers.forEach((layer, index) => {
        const imageElement = imageRefs.current[index];

        if (!imageElement) {
          return;
        }

        gsap.set(imageElement, { rotation: layer.rotation });

        if (prefersReducedMotion) {
          return;
        }

        gsap.to(imageElement, {
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
      {diamondLayers.map((layer, index) => (
        <div
          key={layer.size}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${layer.size}`}
        >
          <Image
            ref={(element) => {
              imageRefs.current[index] = element;
            }}
            src={layer.src}
            alt=""
            width={layer.width}
            height={layer.height}
            className={`size-full object-contain will-change-transform ${layer.opacity}`}
            priority
          />
        </div>
      ))}
    </div>
  );
}
