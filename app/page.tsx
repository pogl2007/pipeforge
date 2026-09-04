import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroCanvas } from "@/components/landing/HeroCanvas";
import { TechMarquee } from "@/components/landing/TechMarquee";
import { StatsBand } from "@/components/landing/StatsBand";
import { DemoSection } from "@/components/landing/DemoSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { CodeShowcase } from "@/components/landing/CodeShowcase";
import { PricingSection } from "@/components/landing/PricingSection";
import { HeroContent } from "@/components/landing/HeroContent";
import { PipelineFlythroughLoader } from "@/components/landing/PipelineFlythroughLoader";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-14 pb-10">
          <HeroCanvas />
          <HeroContent />
        </section>

        <TechMarquee />
        <StatsBand />

        <PipelineFlythroughLoader />

        <div id="demo">
          <DemoSection />
        </div>
        <FeaturesGrid />
        <CodeShowcase />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
