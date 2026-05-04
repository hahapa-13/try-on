import { HeroSection } from "./components/HeroSection";
import { HowItWorks } from "./components/HowItWorks";
import { FeaturesSection } from "./components/FeaturesSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
    </main>
  );
}