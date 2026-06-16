export const STORAGE_KEYS = {
  demographics: "skinstric-demographics",
  uploadPreview: "skinstric-upload-preview",
  actualRace: "skinstric-actual-race",
  actualAge: "skinstric-actual-age",
  actualGender: "skinstric-actual-gender",
} as const;

export const PHASE_TWO_ENDPOINT =
  "https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseTwo";

export type CategoryKey = "race" | "age" | "gender";

export type ScoreMap = Record<string, number>;

export type DemographicsData = {
  race: ScoreMap;
  age: ScoreMap;
  gender: ScoreMap;
};

export type Score = {
  key: string;
  label: string;
  /** Confidence as a 0–100 number. */
  percentage: number;
  /** Confidence formatted to two decimal places, e.g. "53.21". */
  percentageText: string;
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  race: "RACE",
  age: "AGE",
  gender: "SEX",
};

export const CATEGORY_KEYS: CategoryKey[] = ["race", "age", "gender"];

const ACTUAL_STORAGE_KEYS: Record<CategoryKey, string> = {
  race: STORAGE_KEYS.actualRace,
  age: STORAGE_KEYS.actualAge,
  gender: STORAGE_KEYS.actualGender,
};

export function actualStorageKey(category: CategoryKey): string {
  return ACTUAL_STORAGE_KEYS[category];
}

/** Title-case a raw API label while leaving tokens like "70+" untouched. */
export function formatLabel(key: string): string {
  return key
    .split(" ")
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word,
    )
    .join(" ");
}

function isScoreMap(value: unknown): value is ScoreMap {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "number");
}

/** Validate an unknown payload (e.g. parsed from storage or the API) as demographics. */
export function parseDemographics(value: unknown): DemographicsData | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<Record<CategoryKey, unknown>>;

  if (
    !isScoreMap(candidate.race) ||
    !isScoreMap(candidate.age) ||
    !isScoreMap(candidate.gender)
  ) {
    return null;
  }

  return {
    race: candidate.race,
    age: candidate.age,
    gender: candidate.gender,
  };
}

/** Convert a score map into a list sorted by descending confidence. */
export function toSortedScores(map: ScoreMap): Score[] {
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({
      key,
      label: formatLabel(key),
      percentage: value * 100,
      percentageText: (value * 100).toFixed(2),
    }));
}
