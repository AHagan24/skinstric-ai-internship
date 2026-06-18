"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

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

function formatPercentage(value: number) {
  return `${Math.round(value)}`;
}

export function SummarySection() {
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
  const [overrides, setOverrides] = useState<
    Partial<Record<CategoryKey, string>>
  >({});

  useEffect(() => {
    if (!data) {
      router.replace("/testing/upload");
    }
  }, [data, router]);

  if (!data) {
    return (
      <section className="absolute inset-0 flex items-center justify-center bg-[#FCFCFC]">
        <p
          role="status"
          className="text-sm font-normal uppercase tracking-[0.08em] text-[#657086]"
        >
          Loading analysis data...
        </p>
      </section>
    );
  }

  const storedActual: Record<CategoryKey, string> = {
    race: storedRace,
    age: storedAge,
    gender: storedGender,
  };

  const actualKey = (category: CategoryKey) =>
    overrides[category] || storedActual[category] || topKeys[category];

  const scores = toSortedScores(data[activeCategory]);
  const selectedKey = actualKey(activeCategory);
  const selected = scores.find((score) => score.key === selectedKey) ?? scores[0];

  const selectOption = (key: string) => {
    setOverrides((current) => ({ ...current, [activeCategory]: key }));
    try {
      localStorage.setItem(actualStorageKey(activeCategory), key);
    } catch {
      // Keep summary selections usable when storage is unavailable.
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
    router.push("/");
  };

  return (
    <section className="absolute inset-0 overflow-x-hidden overflow-y-auto bg-[#FCFCFC] text-[#1A1B1C] min-[1200px]:overflow-hidden">
      <div className="mx-auto flex min-h-full w-full flex-col px-4 pb-40 pt-24 sm:px-6 sm:pt-28 min-[1200px]:block min-[1200px]:px-8 min-[1200px]:pb-0 min-[1200px]:pt-0">
        <div className="min-[1200px]:absolute min-[1200px]:left-8 min-[1200px]:top-[92px]">
          <p className="font-roobert text-[16px] font-semibold uppercase leading-[24px] tracking-[-0.02em] text-[#1A1B1C]">
            A. I. ANALYSIS
          </p>
          <h1 className="font-roobert mt-1 text-[44px] font-light uppercase leading-[0.9] tracking-[-0.06em] text-[#1A1B1C] min-[400px]:text-[56px] sm:text-[72px] min-[1200px]:text-[78px]">
            DEMOGRAPHICS
          </h1>
          <p className="font-roobert mt-3 text-[14px] font-normal uppercase leading-[24px] tracking-[0] text-[#1A1B1C]">
            PREDICTED RACE &amp; AGE
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:mt-14 min-[1200px]:absolute min-[1200px]:inset-x-8 min-[1200px]:bottom-[96px] min-[1200px]:top-[324px] min-[1200px]:mt-0 min-[1200px]:flex-row min-[1200px]:gap-4">
          <CategorySummaryCards
            activeCategory={activeCategory}
            actualKey={actualKey}
            onSelectCategory={setActiveCategory}
          />

          <MainSummaryPanel
            selected={selected}
            activeCategory={activeCategory}
          />

          <RankingPanel
            activeCategory={activeCategory}
            scores={scores}
            selectedKey={selectedKey}
            onSelectOption={selectOption}
          />
        </div>

        <p className="font-roobert mt-8 text-center text-[14px] font-normal leading-[24px] tracking-[0] text-[#A6ABB5] min-[1200px]:hidden">
          If A.I. estimate is wrong, select the correct one.
        </p>

        <div className="mt-8 flex flex-col gap-4 min-[680px]:flex-row min-[680px]:items-end min-[680px]:justify-between min-[1200px]:hidden">
          <SummaryBackAction onClick={() => router.push("/select")} />
          <div className="flex items-center gap-3 self-end">
            <SummaryTextButton label="Reset" onClick={resetSelections} />
            <SummaryTextButton label="Confirm" onClick={confirmSelections} dark />
          </div>
        </div>
      </div>

      <p className="font-roobert absolute bottom-[72px] left-1/2 hidden -translate-x-1/2 text-center text-[14px] font-normal leading-[24px] tracking-[0] text-[#A6ABB5] min-[1200px]:block">
        If A.I. estimate is wrong, select the correct one.
      </p>

      <div className="absolute bottom-8 left-8 z-30 hidden min-[1200px]:flex">
        <SummaryBackAction onClick={() => router.push("/select")} />
      </div>

      <div className="absolute bottom-8 right-8 z-30 hidden min-[1200px]:flex items-center gap-4">
        <SummaryTextButton label="Reset" onClick={resetSelections} />
        <SummaryTextButton label="Confirm" onClick={confirmSelections} dark />
      </div>
    </section>
  );
}

function CategorySummaryCards({
  activeCategory,
  actualKey,
  onSelectCategory,
}: {
  activeCategory: CategoryKey;
  actualKey: (category: CategoryKey) => string;
  onSelectCategory: (category: CategoryKey) => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-[1200px]:w-[220px]">
      {CATEGORY_KEYS.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectCategory(category)}
            className={`flex h-[120px] flex-col justify-between border border-[#1A1B1C]/10 px-4 py-4 text-left transition-colors duration-300 min-[1200px]:h-[148px] ${
              isActive
                ? "bg-[#1A1B1C] text-[#FCFCFC]"
                : "bg-[#F3F3F4] text-[#1A1B1C] hover:bg-[#EBEBEC]"
            }`}
          >
            <span className="font-roobert text-[20px] font-semibold uppercase leading-[24px] tracking-[-0.03em] min-[1200px]:text-[18px]">
              {formatLabel(actualKey(category)) || "—"}
            </span>
            <span className="font-roobert text-[14px] font-semibold uppercase leading-[16px] tracking-[-0.02em]">
              {CATEGORY_LABELS[category]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MainSummaryPanel({
  selected,
  activeCategory,
}: {
  selected: Score;
  activeCategory: CategoryKey;
}) {
  return (
    <div className="min-h-[360px] border-t border-[#1A1B1C]/35 bg-[#F8F8F8] px-4 py-6 sm:min-h-[420px] min-[1200px]:flex min-[1200px]:min-h-0 min-[1200px]:flex-1 min-[1200px]:items-start min-[1200px]:justify-between min-[1200px]:px-4 min-[1200px]:py-5">
      <div>
        <p className="font-roobert text-[18px] font-semibold uppercase leading-[16px] tracking-[-0.02em] text-[#5F646D] min-[1200px]:hidden">
          {CATEGORY_LABELS[activeCategory]}
        </p>
        <h2 className="font-roobert mt-2 text-[34px] font-light leading-[0.92] tracking-[-0.05em] text-[#1A1B1C] min-[1200px]:mt-0 min-[1200px]:text-[48px]">
          {selected.label}
        </h2>
      </div>

      <div className="mt-8 flex justify-center min-[1200px]:mt-[92px] min-[1200px]:pr-[18px]">
        <ConfidenceCircle percentage={selected.percentage} />
      </div>
    </div>
  );
}

function ConfidenceCircle({ percentage }: { percentage: number }) {
  const radius = 145;
  const size = 320;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="relative h-[240px] w-[240px] min-[480px]:h-[280px] min-[480px]:w-[280px] min-[1200px]:h-[420px] min-[1200px]:w-[420px]">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="size-full -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EA"
          strokeWidth="1.4"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1A1B1C"
          strokeWidth="1.4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-roobert text-[44px] font-light leading-none tracking-[-0.05em] text-[#1A1B1C] min-[1200px]:text-[60px]">
          {formatPercentage(percentage)}
          <span className="align-top text-[22px] min-[1200px]:text-[30px]">%</span>
        </span>
      </div>
    </div>
  );
}

function RankingPanel({
  activeCategory,
  scores,
  selectedKey,
  onSelectOption,
}: {
  activeCategory: CategoryKey;
  scores: Score[];
  selectedKey: string;
  onSelectOption: (key: string) => void;
}) {
  return (
    <div className="border-t border-[#1A1B1C]/35 bg-[#F8F8F8] min-[1200px]:w-[476px]">
      <div className="flex items-center justify-between border-b border-[#1A1B1C]/10 px-4 py-4">
        <span className="font-roobert text-[14px] font-semibold uppercase leading-[16px] tracking-[-0.02em] text-[#5F646D]">
          {CATEGORY_LABELS[activeCategory]}
        </span>
        <span className="font-roobert text-[14px] font-normal uppercase leading-[16px] tracking-[-0.02em] text-[#5F646D]">
          A. I. CONFIDENCE
        </span>
      </div>

      <ul role="radiogroup" aria-label={`${CATEGORY_LABELS[activeCategory]} options`}>
        {scores.map((score) => {
          const isSelected = score.key === selectedKey;
          return (
            <li key={score.key}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectOption(score.key)}
                className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-300 ${
                  isSelected
                    ? "bg-[#1A1B1C] text-[#FCFCFC]"
                    : "text-[#1A1B1C] hover:bg-[#EFEFF0]"
                }`}
              >
                <span className="flex items-center gap-4">
                  <SelectionDiamond filled={isSelected} />
                  <span className="font-roobert text-[14px] font-normal leading-[24px] tracking-[0] min-[1200px]:text-[15px]">
                    {score.label}
                  </span>
                </span>
                <span className="font-roobert text-[14px] font-normal leading-[24px] tracking-[0]">
                  {formatPercentage(score.percentage)} %
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
  const stroke = filled ? "#FCFCFC" : "#1A1B1C";
  const fill = filled ? "#FCFCFC" : "none";

  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3 shrink-0">
      <path d="M6 1 11 6 6 11 1 6Z" fill={fill} stroke={stroke} strokeWidth="1" />
      {filled ? (
        <path
          d="M6 3.25 8.75 6 6 8.75 3.25 6Z"
          fill="#1A1B1C"
        />
      ) : null}
    </svg>
  );
}

function SummaryBackAction({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="inline-flex h-[44px] w-[108px] items-center justify-between transition-opacity duration-300 hover:opacity-70"
    >
      <Image
        src="/assets/button-icon-shrunk-left.svg"
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
        priority
        className="h-[44px] w-[44px] shrink-0 object-contain"
      />
      <span className="font-roobert min-w-[52px] text-center text-[14px] font-semibold uppercase leading-[16px] tracking-[-0.02em] text-[#1A1B1C]">
        Back
      </span>
    </button>
  );
}

function SummaryTextButton({
  label,
  onClick,
  dark = false,
}: {
  label: string;
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-roobert inline-flex h-[38px] min-w-[102px] items-center justify-center border px-5 text-[14px] font-semibold uppercase leading-[16px] tracking-[-0.02em] transition-opacity duration-300 hover:opacity-70 ${
        dark
          ? "border-[#1A1B1C] bg-[#1A1B1C] text-[#FCFCFC]"
          : "border-[#1A1B1C] bg-transparent text-[#1A1B1C]"
      }`}
    >
      {label}
    </button>
  );
}
