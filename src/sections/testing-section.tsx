"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { BackAction } from "@/components/back-action";
import { ProceedAction } from "@/components/proceed-action";
import { RotatingDiamonds } from "@/components/rotating-diamonds";
import {
  isValidProfileValue,
  normalizeProfileValue,
} from "@/lib/profile-validation";

type TestingStep = "name" | "location" | "processing" | "complete";

type ProfileResponse = {
  success?: boolean;
  message?: string;
  SUCCESS?: string;
};

const emptySubscribe = () => () => {};

function readStoredValue(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function TestingSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<TestingStep>("name");
  const [nameInput, setNameInput] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<ProfileResponse | null>(null);
  const storedName = useSyncExternalStore(
    emptySubscribe,
    () => readStoredValue("skinstric-user-name"),
    () => "",
  );
  const storedLocation = useSyncExternalStore(
    emptySubscribe,
    () => readStoredValue("skinstric-user-location"),
    () => "",
  );
  const name = nameInput ?? storedName;
  const location = locationInput ?? storedLocation;

  const isInputStep = step === "name" || step === "location";
  const isProcessing = step === "processing";

  useEffect(() => {
    if (isInputStep) {
      inputRef.current?.focus();
    }
  }, [isInputStep, step]);

  const validate = (value: string, label: string) => {
    if (!isValidProfileValue(value)) {
      setError(
        `Enter a valid ${label} using letters, spaces, hyphens, or apostrophes.`,
      );
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === "name") {
      if (!validate(name, "name")) {
        return;
      }

      const normalizedName = normalizeProfileValue(name);
      setNameInput(normalizedName);
      try {
        localStorage.setItem("skinstric-user-name", normalizedName);
      } catch {
        // Keep the form usable when browser storage is unavailable.
      }
      setStep("location");
      return;
    }

    if (step !== "location" || !validate(location, "location")) {
      return;
    }

    const normalizedName = normalizeProfileValue(name);
    const normalizedLocation = normalizeProfileValue(location);
    setNameInput(normalizedName);
    setLocationInput(normalizedLocation);
    setResponse(null);
    setStep("processing");

    try {
      localStorage.setItem("skinstric-user-name", normalizedName);
      localStorage.setItem("skinstric-user-location", normalizedLocation);
    } catch {
      // Keep the form usable when browser storage is unavailable.
    }

    try {
      const apiResponse = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          location: normalizedLocation,
        }),
      });
      const result: ProfileResponse = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(
          result.message ?? "We could not start your analysis. Please try again.",
        );
      }

      setResponse(result);
      setStep("complete");
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : "We could not start your analysis. Please try again.",
      );
      setStep("location");
    }
  };

  const handleBack = () => {
    setError("");
    setResponse(null);

    if (step === "location" || step === "complete") {
      setStep(step === "complete" ? "location" : "name");
    }
  };

  const prompt =
    step === "name"
      ? "Introduce Yourself"
      : step === "location"
        ? "Where are you from?"
        : "";

  return (
    <section className="absolute inset-0 overflow-hidden bg-[#FCFCFC] text-center">
      <p className="absolute left-5 top-16 text-left text-[11px] font-semibold uppercase leading-4 sm:left-9 sm:text-xs">
        TO START ANALYSIS
      </p>

      <div className="absolute left-1/2 top-1/2 flex size-[min(95vw,762px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center sm:size-[min(82vw,762px)]">
        <RotatingDiamonds />

        {isInputStep && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="relative z-10 mb-1 bg-transparent text-xs font-normal uppercase tracking-[0.08em] text-[#8F8F8F] sm:text-sm"
            >
              CLICK TO TYPE
            </button>

            <form
              onSubmit={handleSubmit}
              className="relative z-10"
              aria-label={step === "name" ? "Introduce yourself" : "Your city"}
            >
              <label htmlFor={step} className="sr-only">
                {prompt}
              </label>
              <input
                key={step}
                ref={inputRef}
                id={step}
                name={step}
                type="text"
                autoComplete={step === "name" ? "name" : "address-level2"}
                value={step === "name" ? name : location}
                onChange={(event) => {
                  setError("");
                  if (step === "name") {
                    setNameInput(event.target.value);
                  } else {
                    setLocationInput(event.target.value);
                  }
                }}
                placeholder={prompt}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "testing-error" : undefined}
                className="w-[min(84vw,520px)] appearance-none border-0 border-b border-[#1A1B1C] bg-transparent py-1 text-center text-[clamp(2rem,8vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.065em] text-[#1A1B1C] outline-none placeholder:text-[#9A9A9A] placeholder:opacity-100 focus:border-[#1A1B1C] focus:outline-none"
              />
              <button type="submit" className="sr-only">
                Continue
              </button>
            </form>
          </>
        )}

        {isProcessing && (
          <div
            role="status"
            aria-label="Processing submission"
            className="relative z-10 flex flex-col items-center gap-12 text-center"
          >
            <p className="text-xl font-normal leading-none tracking-[-0.02em] text-[#657086] sm:text-2xl">
              Processing submission
            </p>
            <span aria-hidden="true" className="flex items-center gap-6">
              <span className="testing-loading-dot" />
              <span className="testing-loading-dot" />
              <span className="testing-loading-dot" />
            </span>
          </div>
        )}

        {step === "complete" && (
          <div
            role="status"
            aria-label={
              response?.message ??
              response?.SUCCESS ??
              "Profile submitted successfully"
            }
            className="relative z-10 flex flex-col items-center gap-4 text-center sm:gap-5"
          >
            <p className="text-xl font-normal leading-none tracking-[-0.02em] text-[#1A1B1C] sm:text-2xl">
              Thank you!
            </p>
            <p className="text-sm font-normal leading-5 text-[#657086] sm:text-base">
              Proceed for the next step
            </p>
          </div>
        )}

        <p
          id="testing-error"
          aria-live="polite"
          className="absolute top-[calc(50%+5rem)] z-10 max-w-[30rem] text-xs font-semibold text-red-700 sm:text-sm"
        >
          {error}
        </p>
      </div>

      <div className="absolute bottom-8 left-8 z-30 flex">
        {step === "name" ? (
          <BackAction />
        ) : (
          <BackAction onClick={handleBack} disabled={isProcessing} />
        )}
      </div>

      {step === "complete" && (
        <div className="absolute bottom-8 right-8 z-30 flex">
          <ProceedAction href="/testing/upload" />
        </div>
      )}
    </section>
  );
}
