import { SiteHeader } from "@/components/site-header";
import { SummarySection } from "@/sections/summary-section";

export default function SummaryPage() {
  return (
    <main className="relative h-[100dvh] min-h-[100dvh] overflow-x-hidden bg-[#FCFCFC] text-[#1A1B1C]">
      <div className="absolute inset-x-0 top-0 z-50">
        <SiteHeader pageLabel="ANALYSIS" />
      </div>
      <SummarySection />
    </main>
  );
}
