import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/sections/hero-section";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FCFCFC] text-[#1A1B1C]">
      <SiteHeader />
      <HeroSection />
    </main>
  );
}
