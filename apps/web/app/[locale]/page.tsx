import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import BenefitsSection from '@/components/landing/BenefitsSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
    </main>
  );
}
