import HeroCopy from './HeroCopy';
import HeroStats from './HeroStats';
import DemoTracker from './DemoTracker';
import MiniCalculator from './MiniCalculator';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-2 lg:items-start">
          {/* Left column: copy, stats, tracker */}
          <div className="flex flex-col gap-8">
            <HeroCopy />
            {/* MiniCalculator: mobile only (between copy and stats) */}
            <div className="lg:hidden">
              <MiniCalculator />
            </div>
            <HeroStats />
            <DemoTracker />
          </div>

          {/* Right column: MiniCalculator on desktop */}
          <div className="hidden lg:flex lg:items-start lg:pt-2">
            <MiniCalculator />
          </div>
        </div>
      </div>
    </section>
  );
}
