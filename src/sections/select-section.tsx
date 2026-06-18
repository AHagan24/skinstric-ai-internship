"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { STORAGE_KEYS } from "@/lib/demographics";

type AnalysisSection =
  | "demographics"
  | "skin-type-details"
  | "cosmetic-concerns"
  | "weather";

const SELECTABLE_SECTIONS: Array<{
  id: AnalysisSection;
  label: string;
  clipPath: string;
  rectangleIndex: number;
  src: string;
  left: number;
  top: number;
}> = [
  {
    id: "demographics",
    label: "Demographics",
    clipPath: "polygon(50% 0%, 75% 25%, 50% 50%, 25% 25%)",
    rectangleIndex: 0,
    src: "/assets/select-square-demographics.svg",
    left: 113,
    top: 0,
  },
  {
    id: "skin-type-details",
    label: "Skin Type Details",
    clipPath: "polygon(25% 25%, 50% 50%, 25% 75%, 0% 50%)",
    rectangleIndex: 1,
    src: "/assets/select-square-skin-type-details.svg",
    left: 0,
    top: 113,
  },
  {
    id: "cosmetic-concerns",
    label: "Cosmetic Concerns",
    clipPath: "polygon(75% 25%, 100% 50%, 75% 75%, 50% 50%)",
    rectangleIndex: 1,
    src: "/assets/select-square-cosmetic-concerns.svg",
    left: 226,
    top: 113,
  },
  {
    id: "weather",
    label: "Weather",
    clipPath: "polygon(50% 50%, 75% 75%, 50% 100%, 25% 75%)",
    rectangleIndex: 2,
    src: "/assets/select-square-weather.svg",
    left: 113,
    top: 226,
  },
];

const RECTANGLE_LAYERS = [
  {
    src: "/assets/select-rectangle-1.svg",
    size: 604,
  },
  {
    src: "/assets/select-rectangle-2.svg",
    size: 684,
  },
  {
    src: "/assets/select-rectangle-3.svg",
    size: 764,
  },
] as const;

const emptySubscribe = () => () => {};

function readStoredValue(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function SelectSection() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] =
    useState<AnalysisSection | null>(null);
  const [hoveredSection, setHoveredSection] = useState<AnalysisSection | null>(
    null,
  );
  const storedDemographics = useSyncExternalStore(
    emptySubscribe,
    () => readStoredValue(STORAGE_KEYS.demographics),
    () => "",
  );
  const storedUploadPreview = useSyncExternalStore(
    emptySubscribe,
    () => readStoredValue(STORAGE_KEYS.uploadPreview),
    () => "",
  );
  const hasSelectionData = Boolean(storedDemographics && storedUploadPreview);

  useEffect(() => {
    if (!hasSelectionData) {
      router.replace("/testing/upload");
    }
  }, [hasSelectionData, router]);

  if (!hasSelectionData) {
    return (
      <section className="absolute inset-0 flex items-center justify-center bg-[#FCFCFC]">
        <p
          role="status"
          className="text-sm font-normal uppercase tracking-[0.08em] text-[#657086]"
        >
          Loading analysis
        </p>
      </section>
    );
  }

  const activeSection = hoveredSection;
  const activeRectangleIndex =
    SELECTABLE_SECTIONS.find((section) => section.id === hoveredSection)
      ?.rectangleIndex ?? null;

  return (
    <section className="absolute inset-0 overflow-x-hidden overflow-y-auto bg-[#FCFCFC] text-[#1A1B1C] min-[1200px]:overflow-hidden">
      <div className="mx-auto flex min-h-full w-full flex-col items-center px-4 pb-32 pt-28 sm:px-6 min-[1200px]:block min-[1200px]:px-0 min-[1200px]:pb-0 min-[1200px]:pt-0">
        <div className="w-full max-w-[320px] self-start min-[1200px]:absolute min-[1200px]:left-9 min-[1200px]:top-[72px]">
          <div className="flex flex-col gap-[1px]">
            <p
              id="1qu2b2"
              className="font-roobert text-[16px] font-semibold uppercase leading-[24px] tracking-[-0.02em] text-[#1A1B1C]"
            >
              A.I. ANALYSIS
            </p>
            <p
              id="mbkl3j"
              className="font-roobert text-[14px] font-normal uppercase leading-[24px] tracking-[0] text-[#1A1B1C]"
            >
              A.I. has estimated the following.
              <br />
              Fix estimated information if needed.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-1 items-center justify-center min-[1200px]:absolute min-[1200px]:left-1/2 min-[1200px]:top-1/2 min-[1200px]:mt-0 min-[1200px]:-translate-x-1/2 min-[1200px]:-translate-y-1/2">
          <div className="relative h-[764px] w-[764px] origin-center scale-[0.5] min-[360px]:scale-[0.56] min-[420px]:scale-[0.64] sm:scale-[0.74] lg:scale-[0.92] min-[1200px]:scale-100">
            {RECTANGLE_LAYERS.map((layer, index) => (
              <div
                key={layer.src}
                className={`absolute left-1/2 top-1/2 transform-gpu transition-all duration-300 ease-out ${
                  activeRectangleIndex === index
                    ? "-translate-y-3 scale-[1.02] opacity-100"
                    : "translate-y-0 scale-100"
                }`}
                style={{
                  width: `${layer.size}px`,
                  height: `${layer.size}px`,
                  marginLeft: `${-layer.size / 2}px`,
                  marginTop: `${-layer.size / 2}px`,
                  opacity: activeRectangleIndex === index ? 1 : 0,
                }}
              >
                <Image
                  src={layer.src}
                  alt=""
                  aria-hidden="true"
                  width={layer.size}
                  height={layer.size}
                  priority
                  className="size-full object-contain"
                />
              </div>
            ))}

            <DiamondSelector
              activeSection={activeSection}
              selectedSection={selectedSection}
              onHoverSection={setHoveredSection}
              onSelectSection={(section) => {
                setSelectedSection(section);
                if (section === "demographics") {
                  router.push("/summary");
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-4 z-30 flex sm:bottom-8 sm:left-8">
        <SelectEdgeAction
          direction="left"
          label="Back"
          onClick={() => router.push("/testing/upload")}
        />
      </div>

      <div className="absolute bottom-6 right-4 z-30 flex sm:bottom-8 sm:right-8">
        <SelectEdgeAction
          direction="right"
          href="/summary"
          label="Get Summary"
        />
      </div>
    </section>
  );
}

function DiamondSelector({
  activeSection,
  selectedSection,
  onHoverSection,
  onSelectSection,
}: {
  activeSection: AnalysisSection | null;
  selectedSection: AnalysisSection | null;
  onHoverSection: (section: AnalysisSection | null) => void;
  onSelectSection: (section: AnalysisSection) => void;
}) {
  return (
    <div className="absolute left-1/2 top-1/2 h-[444px] w-[444px] -translate-x-1/2 -translate-y-1/2">
      <div className="absolute inset-0 z-10">
        {SELECTABLE_SECTIONS.map((section) => {
          const isActive = section.id === activeSection;
          const isSelected = section.id === selectedSection;
          const isClickable = section.id === "demographics";
          const scale = isActive ? 1.012 : 1;
          const shouldLift = isActive && section.id === "demographics";
          const baseOpacity = 1;
          return (
            <div
              key={section.id}
              className={`absolute h-[218px] w-[218px] transform-gpu transition-all duration-300 ease-out ${
                isClickable ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              style={{
                left: `${section.left}px`,
                top: `${section.top}px`,
                transform: shouldLift
                  ? `translateY(-10px) scale(${scale})`
                  : `translateY(0px) scale(${scale})`,
                opacity: isActive ? 1 : baseOpacity,
                filter: isActive
                  ? "brightness(1.01) drop-shadow(0 12px 16px rgba(26, 27, 28, 0.05))"
                  : isSelected
                    ? "drop-shadow(0 6px 10px rgba(26, 27, 28, 0.03))"
                    : "none",
              }}
            >
              <div className="relative size-full cursor-inherit">
                <Image
                  src={section.src}
                  alt=""
                  aria-hidden="true"
                  width={218}
                  height={218}
                  priority
                  className="size-full cursor-inherit object-contain"
                />
                <div
                  className="absolute inset-0 cursor-inherit transition-opacity duration-300 ease-out"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    backgroundColor: "#D1D5DB",
                    opacity: isActive ? 0.34 : 0,
                  }}
                />
                <div className="pointer-events-none absolute inset-0 flex cursor-inherit items-center justify-center px-9 text-center">
                  <span className="font-roobert max-w-[122px] text-center text-[16px] font-semibold uppercase leading-[24px] tracking-[-0.02em] text-[#1A1B1C] transition-opacity duration-300 ease-out opacity-100">
                    {section.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 z-30">
        {SELECTABLE_SECTIONS.map((section) => {
          const isSelected = section.id === selectedSection;
          const isClickable = section.id === "demographics";
          return (
            <button
              key={section.id}
              type="button"
              aria-pressed={isSelected}
              aria-disabled={!isClickable}
              aria-label={section.label}
              onMouseEnter={() => onHoverSection(section.id)}
              onMouseLeave={() => onHoverSection(null)}
              onFocus={() => onHoverSection(section.id)}
              onBlur={() => onHoverSection(null)}
              onClick={
                isClickable ? () => onSelectSection(section.id) : undefined
              }
              className={`absolute inset-0 outline-none ${
                isClickable ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              style={{ clipPath: section.clipPath }}
            >
              <span className="sr-only">{section.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectEdgeAction({
  direction,
  href,
  label,
  onClick,
}: {
  direction: "left" | "right";
  href?: string;
  label: string;
  onClick?: () => void;
}) {
  const isLeft = direction === "left";
  const widthClass = isLeft ? "w-[97px]" : "w-[155px]";
  const textClass = isLeft ? "min-w-[44px]" : "min-w-[102px]";
  const content = (
    <>
      {isLeft ? (
        <Image
          src="/assets/button-icon-shrunk-left.svg"
          alt=""
          aria-hidden="true"
          width={44}
          height={44}
          priority
          className="h-[44px] w-[44px] shrink-0 object-contain"
        />
      ) : null}
      <span
        className={`font-roobert ${textClass} text-center text-[14px] font-semibold uppercase leading-[16px] tracking-[-0.02em] text-[#1A1B1C]`}
      >
        {label}
      </span>
      {!isLeft ? (
        <Image
          src="/assets/button-icon-shrunk-right.svg"
          alt=""
          aria-hidden="true"
          width={44}
          height={44}
          priority
          className="h-[44px] w-[44px] shrink-0 object-contain"
        />
      ) : null}
    </>
  );

  const className = `inline-flex h-[44px] ${widthClass} items-center justify-between transition-opacity duration-300 hover:opacity-70`;

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {content}
    </button>
  );
}
