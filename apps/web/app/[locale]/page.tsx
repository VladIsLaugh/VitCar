import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import CasesSection from '@/components/landing/CasesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <CasesSection />
      <TestimonialsSection />
    </main>
  );
}
