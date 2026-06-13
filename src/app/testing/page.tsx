import { SiteHeader } from "@/components/site-header";
import { TestingSection } from "@/sections/testing-section";

export default function TestingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FCFCFC] text-[#1A1B1C]">
      <SiteHeader />
      <TestingSection />
    </main>
  );
}
