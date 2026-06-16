"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";

const defaultDiamondLayers = [
  {
    size: 482,
    inset: 0,
    opacity: 0.3,
    rotation: 8,
    duration: 90,
    direction: 1,
  },
  {
    size: 444.34,
    inset: 18.83,
    opacity: 0.6,
    rotation: 5,
    duration: 110,
    direction: -1,
  },
  {
    size: 405.18,
    inset: 38.41,
    opacity: 1,
    rotation: 0,
    duration: 130,
    direction: 1,
  },
] as const;

/** Layered dashed diamonds that animate behind a single upload option. */
export function OptionDiamonds({
  variant = "default",
}: {
  variant?: "default" | "gallery" | "camera";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const diamondLayers = useMemo(() => defaultDiamondLayers, []);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const context = gsap.context(() => {
      const activeLayerRefs = layerRefs.current.filter(
        (element): element is HTMLDivElement => element !== null,
      );

      diamondLayers.forEach((layer, index) => {
        const layerElement = activeLayerRefs[index];

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
  }, [diamondLayers, variant]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {diamondLayers.map((layer, index) => (
        <div
          key={`${variant}-${layer.size}`}
          ref={(element) => {
            layerRefs.current[index] = element;
          }}
          style={{
            width: `${layer.size}px`,
            height: `${layer.size}px`,
            left: `${layer.inset}px`,
            top: `${layer.inset}px`,
            opacity: layer.opacity,
          }}
          className="absolute box-border border-2 border-dashed border-[#A0A4AB] will-change-transform"
        />
      ))}
    </div>
  );
}
