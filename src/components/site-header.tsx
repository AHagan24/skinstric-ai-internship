"use client";

import Link from "next/link";

import { landingContent } from "@/lib/landing-content";

function Bracket({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className="relative h-[17px] w-1 text-[#1A1B1C]/50"
    >
      <span
        className={`absolute inset-y-0 w-px bg-current ${
          side === "left" ? "left-0" : "right-0"
        }`}
      />
      <span
        className={`absolute top-0 h-px w-1 bg-current ${
          side === "left" ? "left-0" : "right-0"
        }`}
      />
      <span
        className={`absolute bottom-0 h-px w-1 bg-current ${
          side === "left" ? "left-0" : "right-0"
        }`}
      />
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="relative z-50 mb-3 flex h-16 w-full items-start justify-between py-3">
      <div className="flex scale-75 items-center justify-center pt-1">
        <Link
          href="/"
          className="mr-2 inline-flex h-9 items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-semibold leading-4"
        >
          {landingContent.brand}
        </Link>
        <Bracket side="left" />
        <span className="mx-1.5 text-sm font-semibold text-[#1A1B1C]/50">
          {landingContent.pageLabel}
        </span>
        <Bracket side="right" />
      </div>

      <button
        type="button"
        style={{ transform: "scale(0.8)" }}
        className="mx-4 inline-flex h-9 items-center justify-center whitespace-nowrap bg-[#1A1B1C] px-4 py-2 text-[10px] font-semibold leading-4 text-[#FCFCFC] shadow-sm transition-colors duration-300 hover:bg-black"
      >
        {landingContent.enterCode}
      </button>
    </header>
  );
}
