import { SiteHeader } from "@/components/site-header";
import { SelectSection } from "@/sections/select-section";

export default function SelectPage() {
  return (
    <main className="relative h-[100dvh] min-h-[100dvh] overflow-x-hidden bg-[#FCFCFC] text-[#1A1B1C]">
      <div className="absolute inset-x-0 top-0 z-50">
        <SiteHeader pageLabel="ANALYSIS" />
      </div>
      <SelectSection />
    </main>
  );
}
