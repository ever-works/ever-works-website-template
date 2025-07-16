import { PageContainer } from "@/components/ui/container";
import { HeroLanding } from "./hero-landing";
import { TechStack } from "./tech-stack";
import { MonetizationSection } from "./monetization-section";
import { HowItWorks } from "./how-it-works";
import { InstallationGuide } from "./installation-guide";
import { UsageGuide } from "./usage-guide";

export const HelpContent = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse [animation-delay:4s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-spin [animation-duration:30s]"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      <PageContainer className="py-20 flex flex-col gap-20">
        <HeroLanding />
        <TechStack />
        <MonetizationSection />
        <HowItWorks />
        <InstallationGuide />
        <UsageGuide />
      </PageContainer>
    </div>
  );
};
