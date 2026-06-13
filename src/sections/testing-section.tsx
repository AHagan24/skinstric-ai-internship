"use client";

import { FormEvent, useRef } from "react";

import { BackAction } from "@/components/back-action";
import { RotatingDiamonds } from "@/components/rotating-diamonds";

export function TestingSection() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-[#FCFCFC] px-5 text-center">
      <p className="absolute left-5 top-0 text-left text-[11px] font-semibold uppercase leading-4 sm:left-9 sm:text-xs">
        TO START ANALYSIS
      </p>

      <div className="relative flex size-[min(95vw,762px)] shrink-0 flex-col items-center justify-center sm:size-[min(82vw,762px)]">
        <RotatingDiamonds />

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
          aria-label="Introduce yourself"
        >
          <label htmlFor="name" className="sr-only">
            Introduce Yourself
          </label>
          <input
            ref={inputRef}
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Introduce Yourself"
            className="w-[min(82vw,432px)] appearance-none border-0 border-b border-[#1A1B1C] bg-transparent py-1 text-center text-[clamp(2rem,8vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.065em] text-[#1A1B1C] outline-none placeholder:text-[#9A9A9A] placeholder:opacity-100 focus:border-[#1A1B1C] focus:outline-none"
          />
          <button type="submit" className="sr-only">
            Submit
          </button>
        </form>
      </div>

      <div className="absolute bottom-6 left-5 sm:bottom-8 sm:left-9">
        <BackAction />
      </div>
    </section>
  );
}
