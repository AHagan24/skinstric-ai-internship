import { SiteHeader } from "@/components/site-header";
import { ResultSection } from "@/sections/result-section";

export default function ResultPage() {
  return (
    <main className="relative h-screen min-h-screen overflow-hidden bg-[#FCFCFC] text-[#1A1B1C]">
      <div className="absolute inset-x-0 top-0 z-50">
        <SiteHeader />
      </div>
      <ResultSection />
    </main>
  );
}
