"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/ui/container";
import {
  HowItWorks,
  InstallationGuide,
  UsageGuide,
  TechStack,
  MonetizationSection,
  HeroLanding,
  Support
} from "./components";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface NavigationStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  component: React.ReactNode;
  completed: boolean;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export default function HelpPage() {
  const t = useTranslations("help");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showProgress, setShowProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigationSteps: NavigationStep[] = [
    {
      id: "quick-start",
      title: t("QUICK_START"),
      description: t("QUICK_START_DESC"),
      icon: "🚀",
      color: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500 to-cyan-500",
      component: <HowItWorks />,
      completed: false,
      estimatedTime: "5 min",
      difficulty: "beginner"
    },
    {
      id: "installation",
      title: t("INSTALLATION"),
      description: t("INSTALLATION_DESC"),
      icon: "📚",
      color: "text-green-600 dark:text-green-400",
      gradient: "from-green-500 to-emerald-500",
      component: <InstallationGuide />,
      completed: false,
      estimatedTime: "10 min",
      difficulty: "beginner"
    },
    {
      id: "usage",
      title: t("USAGE_GUIDE"),
      description: t("USAGE_GUIDE_DESC"),
      icon: "🎨",
      color: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500 to-pink-500",
      component: <UsageGuide />,
      completed: false,
      estimatedTime: "15 min",
      difficulty: "intermediate"
    },
    {
      id: "tech-stack",
      title: t("TECH_STACK"),
      description: t("TECH_STACK_DESC"),
      icon: "🔧",
      color: "text-orange-600 dark:text-orange-400",
      gradient: "from-orange-500 to-red-500",
      component: <TechStack />,
      completed: false,
      estimatedTime: "8 min",
      difficulty: "intermediate"
    },
    {
      id: "monetization",
      title: t("MONETIZATION"),
      description: t("MONETIZATION_DESC"),
      icon: "💰",
      color: "text-yellow-600 dark:text-yellow-400",
      gradient: "from-yellow-500 to-orange-500",
      component: <MonetizationSection />,
      completed: false,
      estimatedTime: "12 min",
      difficulty: "advanced"
    },
    {
      id: "support",
      title: t("SUPPORT"),
      description: t("SUPPORT_DESC"),
      icon: "🆘",
      color: "text-red-600 dark:text-red-400",
      gradient: "from-red-500 to-pink-500",
      component: <Support />,
      completed: false,
      estimatedTime: "3 min",
      difficulty: "beginner"
    }
  ];

  const filteredSteps = navigationSteps.filter(step =>
    step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSteps = navigationSteps.length;
  const completedCount = completedSteps.size;
  const progressPercentage = (completedCount / totalSteps) * 100;

  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const nextStep = () => {
    if (currentStep < navigationSteps.length - 1) {
      markStepCompleted(navigationSteps[currentStep].id);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "intermediate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "advanced": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowProgress(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-black text-slate-900 dark:text-white transition-all duration-300">
      {/* Progress Bar */}
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Progress: {completedCount}/{totalSteps}
                </span>
                <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {Math.round(progressPercentage)}% Complete
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroLanding />

      <PageContainer className="max-w-7xl mx-auto px-4 py-12">
        {/* Interactive Navigation */}
        <div className="mb-16">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📋</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Interactive Guide
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Follow the steps to get started
                    </p>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 px-4 py-2 pl-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Steps Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSteps.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:transform hover:scale-105 ${
                      currentStep === index
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/25"
                        : completedSteps.has(step.id)
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    {/* Completion Check */}
                    {completedSteps.has(step.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}

                    {/* Step Number */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep === index
                          ? "bg-blue-500 text-white"
                          : completedSteps.has(step.id)
                          ? "bg-green-500 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}>
                        {index + 1}
                      </div>
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${step.gradient} flex items-center justify-center text-white text-lg shadow-lg`}>
                        {step.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className={`font-bold text-lg mb-2 ${step.color}`}>
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      
                      {/* Meta Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(step.difficulty)}`}>
                            {step.difficulty}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ⏱️ {step.estimatedTime}
                          </span>
                        </div>
                        {currentStep === index && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-16">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
            {/* Step Header */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${navigationSteps[currentStep].gradient} flex items-center justify-center text-white text-xl shadow-lg`}>
                    {navigationSteps[currentStep].icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {navigationSteps[currentStep].title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Step {currentStep + 1} of {totalSteps}
                    </p>
                  </div>
                </div>
                
                {/* Navigation Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    ← Previous
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={currentStep === totalSteps - 1}
                    className="bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 hover:from-theme-primary-600 hover:to-theme-primary-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {currentStep === totalSteps - 1 ? 'Complete' : 'Next →'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
              {navigationSteps[currentStep].component}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Navigation
          </h3>
          <div className="flex flex-wrap gap-2">
            {navigationSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentStep === index
                    ? "bg-theme-primary-600 text-white shadow-lg shadow-blue-500/25"
                    : completedSteps.has(step.id)
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                <span>{step.icon}</span>
                {step.title}
                {completedSteps.has(step.id) && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
