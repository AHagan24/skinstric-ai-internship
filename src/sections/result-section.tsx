"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { BackAction } from "@/components/back-action";
import {
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  type CategoryKey,
  type DemographicsData,
  type Score,
  actualStorageKey,
  formatLabel,
  parseDemographics,
  STORAGE_KEYS,
  toSortedScores,
} from "@/lib/demographics";

const emptySubscribe = () => () => {};

function readStoredValue(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function useStoredValue(key: string) {
  return useSyncExternalStore(
    emptySubscribe,
    () => readStoredValue(key),
    () => "",
  );
}

export function ResultSection() {
  const router = useRouter();

  const rawDemographics = useStoredValue(STORAGE_KEYS.demographics);
  const storedRace = useStoredValue(actualStorageKey("race"));
  const storedAge = useStoredValue(actualStorageKey("age"));
  const storedGender = useStoredValue(actualStorageKey("gender"));

  const data = useMemo<DemographicsData | null>(() => {
    if (!rawDemographics) {
      return null;
    }
    try {
      return parseDemographics(JSON.parse(rawDemographics));
    } catch {
      return null;
    }
  }, [rawDemographics]);

  const topKeys = useMemo<Record<CategoryKey, string>>(
    () => ({
      race: data ? (toSortedScores(data.race)[0]?.key ?? "") : "",
      age: data ? (toSortedScores(data.age)[0]?.key ?? "") : "",
      gender: data ? (toSortedScores(data.gender)[0]?.key ?? "") : "",
    }),
    [data],
  );

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("race");
  // User corrections layered over the persisted/predicted values.
  const [overrides, setOverrides] = useState<
    Partial<Record<CategoryKey, string>>
  >({});

  useEffect(() => {
    if (!data) {
      router.replace("/testing/upload");
    }
  }, [data, router]);

  const scores = useMemo<Score[]>(
    () => (data ? toSortedScores(data[activeCategory]) : []),
    [data, activeCategory],
  );

  if (!data) {
    return (
      <section className="absolute inset-0 flex items-center justify-center bg-[#FCFCFC]">
        <p
          role="status"
          className="text-sm font-normal uppercase tracking-[0.08em] text-[#657086]"
        >
          Loading results
        </p>
      </section>
    );
  }

  const storedActual: Record<CategoryKey, string> = {
    race: storedRace,
    age: storedAge,
    gender: storedGender,
  };

  // `||` (not `??`) so the empty-string default from unset storage falls
  // through to the AI's top prediction.
  const actualKey = (category: CategoryKey) =>
    overrides[category] || storedActual[category] || topKeys[category];

  const selectedKey = actualKey(activeCategory);
  const selected =
    scores.find((score) => score.key === selectedKey) ?? scores[0];

  const selectOption = (key: string) => {
    setOverrides((current) => ({ ...current, [activeCategory]: key }));
    try {
      localStorage.setItem(actualStorageKey(activeCategory), key);
    } catch {
      // Keep selections usable when browser storage is unavailable.
    }
  };

  const resetSelections = () => {
    setOverrides({ ...topKeys });
    CATEGORY_KEYS.forEach((category) => {
      try {
        localStorage.removeItem(actualStorageKey(category));
      } catch {
        // Ignore storage failures.
      }
    });
  };

  const confirmSelections = () => {
    CATEGORY_KEYS.forEach((category) => {
      try {
        localStorage.setItem(actualStorageKey(category), actualKey(category));
      } catch {
        // Ignore storage failures.
      }
    });
  };

  return (
    <section className="absolute inset-0 overflow-hidden bg-[#FCFCFC] text-[#1A1B1C]">
      <Image
        src="/assets/chevron-left.png"
        alt=""
        aria-hidden="true"
        width={300}
        height={600}
        className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 opacity-40 lg:block"
      />
      <Image
        src="/assets/chevron-right.png"
        alt=""
        aria-hidden="true"
        width={300}
        height={600}
        className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 opacity-40 lg:block"
      />

      <div className="absolute left-5 top-16 text-left sm:left-9">
        <p className="text-[11px] font-semibold uppercase leading-4 sm:text-xs">
          A. I. ANALYSIS
        </p>
        <h1 className="mt-1 text-2xl font-semibold uppercase leading-none tracking-[-0.04em] sm:text-3xl">
          Demographics
        </h1>
        <p className="mt-1 text-[11px] font-normal uppercase leading-4 tracking-[0.04em] text-[#657086]">
          Predicted race &amp; age
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-24 top-32 flex flex-col gap-8 overflow-y-auto px-5 sm:px-9 lg:bottom-28 lg:top-28 lg:flex-row lg:items-stretch lg:justify-center lg:gap-6 lg:overflow-hidden">
        <CategoryColumn
          actualKey={actualKey}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <div className="flex flex-1 items-center justify-center">
          <RadialGauge
            label={selected?.label ?? "—"}
            percentageText={selected?.percentageText ?? "0.00"}
            percentage={selected?.percentage ?? 0}
          />
        </div>

        <OptionList
          category={activeCategory}
          scores={scores}
          selectedKey={selectedKey}
          onSelectOption={selectOption}
        />
      </div>

      <div className="absolute bottom-8 left-8 z-30 flex">
        <BackAction onClick={() => router.push("/testing/upload")} />
      </div>

      <div className="absolute bottom-8 right-8 z-30 flex items-center gap-4">
        <button
          type="button"
          onClick={resetSelections}
          className="text-sm font-normal uppercase tracking-[0.04em] text-[#1A1B1C] transition-opacity duration-300 hover:opacity-60"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={confirmSelections}
          className="bg-[#1A1B1C] px-6 py-2 text-sm font-normal uppercase tracking-[0.04em] text-[#FCFCFC] transition-colors duration-300 hover:bg-black"
        >
          Confirm
        </button>
      </div>
    </section>
  );
}

function CategoryColumn({
  actualKey,
  activeCategory,
  onSelectCategory,
}: {
  actualKey: (category: CategoryKey) => string;
  activeCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
}) {
  return (
    <div className="flex gap-2 lg:w-[16rem] lg:flex-col lg:gap-3">
      {CATEGORY_KEYS.map((category) => {
        const isActive = category === activeCategory;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectCategory(category)}
            className={`flex flex-1 flex-col justify-between gap-6 px-4 py-3 text-left transition-colors duration-300 lg:flex-none ${
              isActive
                ? "bg-[#1A1B1C] text-[#FCFCFC]"
                : "bg-[#F3F3F4] text-[#1A1B1C] hover:bg-[#E9E9EA]"
            }`}
          >
            <span className="text-lg font-normal leading-tight tracking-[-0.02em] sm:text-xl">
              {formatLabel(actualKey(category)) || "—"}
            </span>
            <span className="text-[11px] font-semibold uppercase leading-4">
              {CATEGORY_LABELS[category]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RadialGauge({
  label,
  percentageText,
  percentage,
}: {
  label: string;
  percentageText: string;
  percentage: number;
}) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="relative flex aspect-square w-[min(80vw,420px)] items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="size-full -rotate-90"
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#E8E8E9"
          strokeWidth="1"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#1A1B1C"
          strokeWidth="1"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-light leading-none tracking-[-0.04em] sm:text-7xl">
          {percentageText}
          <span className="align-top text-2xl font-light sm:text-3xl">%</span>
        </span>
        <span className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#657086] sm:text-sm">
          {label}
        </span>
      </div>
    </div>
  );
}

function OptionList({
  category,
  scores,
  selectedKey,
  onSelectOption,
}: {
  category: CategoryKey;
  scores: Score[];
  selectedKey: string;
  onSelectOption: (key: string) => void;
}) {
  return (
    <div className="lg:w-[24rem]">
      <div className="mb-1 flex items-center justify-between border-b border-[#1A1B1C]/30 pb-2 text-[11px] font-semibold uppercase leading-4">
        <span>{CATEGORY_LABELS[category]}</span>
        <span>A. I. Confidence</span>
      </div>

      <ul role="radiogroup" aria-label={`${CATEGORY_LABELS[category]} options`}>
        {scores.map((score) => {
          const isSelected = score.key === selectedKey;
          return (
            <li key={score.key} className="border-b border-[#1A1B1C]/10">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectOption(score.key)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors duration-300 ${
                  isSelected
                    ? "bg-[#F3F3F4]"
                    : "hover:bg-[#1A1B1C]/3"
                }`}
              >
                <span className="flex items-center gap-3">
                  <SelectionDiamond filled={isSelected} />
                  <span
                    className={`text-sm sm:text-base ${
                      isSelected ? "font-medium" : "font-normal"
                    }`}
                  >
                    {score.label}
                  </span>
                </span>
                <span className="text-sm tabular-nums sm:text-base">
                  {score.percentageText}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SelectionDiamond({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3 shrink-0">
      <path
        d="M8 1 15 8 8 15 1 8Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
