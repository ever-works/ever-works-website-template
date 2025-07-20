"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { PageContainer } from "@/components/ui/container";

export function HeroLanding() {
  const t = useTranslations('help');
  const [isVisible, setIsVisible] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const fullText = t('HERO_IN_MINUTES');

  useEffect(() => {
    setIsVisible(true);
    
    // Typing animation
    const timer = setTimeout(() => {
      if (currentIndex < fullText.length) {
        setTypingText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsTypingComplete(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentIndex, fullText]);

  const makers = [
    { name: "Alex Chen", avatar: "👨‍💻", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { name: "Sarah Johnson", avatar: "👩‍💼", color: "bg-gradient-to-br from-pink-500 to-pink-600" },
    { name: "Mike Rodriguez", avatar: "👨‍🎨", color: "bg-gradient-to-br from-purple-500 to-purple-600" },
    { name: "Emma Wilson", avatar: "👩‍🔬", color: "bg-gradient-to-br from-green-500 to-green-600" },
    { name: "David Kim", avatar: "👨‍🚀", color: "bg-gradient-to-br from-yellow-500 to-yellow-600" },
    { name: "Lisa Anderson", avatar: "👩‍💻", color: "bg-gradient-to-br from-red-500 to-red-600" },
    { name: "Chris Thompson", avatar: "👨‍🔧", color: "bg-gradient-to-br from-cyan-500 to-cyan-600" },
    { name: "Anna Garcia", avatar: "👩‍🎨", color: "bg-gradient-to-br from-indigo-500 to-indigo-600" },
    { name: "Ryan Miller", avatar: "👨‍💼", color: "bg-gradient-to-br from-orange-500 to-orange-600" },
    { name: "Jessica Brown", avatar: "👩‍🚀", color: "bg-gradient-to-br from-teal-500 to-teal-600" },
  ];

  const handleScroll = () => {
    const element = document.getElementById('product-preview');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black text-gray-900 dark:text-white transition-all duration-300">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-theme-primary-500/10 dark:bg-theme-primary-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-theme-secondary-500/10 dark:bg-theme-secondary-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-theme-accent-500/10 dark:bg-theme-accent-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <PageContainer className="relative z-10  px-4 py-8">
        {/* Special Offer Banner */}
        <div className={`text-center pt-8 mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer group shadow-lg dark:shadow-gray-900/50">
            <span className="animate-bounce group-hover:animate-pulse">🔥</span>
            <span className="font-medium">{t('HERO_SPECIAL_OFFER')}</span>
            <span className="animate-bounce group-hover:animate-pulse">🔥</span>
            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Title */}
          <h1 className={`text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 dark:text-white mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {t('HERO_CREATE_YOUR')}
            <br />
            {t('HERO_DIRECTORY')}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-theme-primary-500 via-theme-secondary-500 to-theme-accent-500 bg-clip-text text-transparent">
                {typingText}
                {!isTypingComplete && (
                  <span className="animate-pulse">|</span>
                )}
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-theme-primary-500 via-theme-secondary-500 to-theme-accent-500 rounded-xl blur opacity-20 animate-pulse"></div>
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {t('HERO_SUBTITLE')}{" "}
            <span className="text-theme-primary-600 dark:text-theme-primary-400 font-semibold">{t('HERO_AI')}</span>,{" "}
            <span className="text-theme-secondary-600 dark:text-theme-secondary-400 font-semibold">{t('HERO_LISTINGS')}</span>,{" "}
            <span className="text-theme-accent-600 dark:text-theme-accent-400 font-semibold">{t('HERO_PAYMENT')}</span>,
            <br />
            {t('HERO_SUBTITLE_FEATURES')}
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 hover:from-theme-primary-600 hover:to-theme-primary-700 dark:from-theme-primary-400 dark:to-theme-primary-500 dark:hover:from-theme-primary-500 dark:hover:to-theme-primary-600 text-white font-semibold px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-theme-primary-500/25 dark:hover:shadow-theme-primary-400/25 group"
            >
              <span className="flex items-center gap-2">
                {t('HERO_CTA_START')}
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleScroll}
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white font-semibold px-10 py-6 rounded-xl transition-all duration-300 transform hover:scale-105 group"
            >
              <span className="flex items-center gap-2">
                {t('HERO_CTA_PREVIEW')}
                <svg className="w-5 h-5 transform group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </span>
            </Button>
          </div>

          {/* Social Proof */}
          <div className={`mb-20 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex justify-center items-center gap-1 mb-6 flex-wrap">
              {makers.map((maker, index) => (
                <div
                  key={index}
                  className={`w-14 h-14 ${maker.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer border-2 border-white/30 dark:border-gray-700/30 hover:border-white/50 dark:hover:border-gray-600/50`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  title={maker.name}
                >
                  {maker.avatar}
                </div>
              ))}
              <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer border-2 border-white/30 dark:border-gray-700/30 hover:border-white/50 dark:hover:border-gray-600/50">
                260+
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              <span className="font-semibold text-gray-900 dark:text-white">260+</span> {t('HERO_SOCIAL_PROOF')}
            </p>
          </div>
        </div>

        {/* Product Preview */}
        <div 
          id="product-preview"
          className={`relative max-w-7xl mx-auto transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="relative">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-theme-primary-400 via-theme-secondary-400 to-theme-accent-400 dark:from-theme-primary-300 dark:via-theme-secondary-300 dark:to-theme-accent-300 rounded-3xl blur-xl opacity-20 dark:opacity-15 animate-pulse"></div>
            
            {/* Main Preview Container */}
            <div className="relative bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
              {/* Mock Browser Interface */}
              <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                {/* Browser Header */}
                <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-750 px-6 py-4 flex items-center gap-3 border-b border-gray-300 dark:border-gray-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"></div>
                  </div>
                  <div className="flex-1 max-w-md mx-auto bg-white dark:bg-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>https://ever.works</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-theme-primary-500 hover:bg-theme-primary-600 dark:bg-theme-primary-400 dark:hover:bg-theme-primary-500 text-white transition-colors">
                    Sign in
                  </Button>
                </div>

                {/* Mock Website Content */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-8 min-h-[500px]">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-theme-primary-500/20 dark:bg-theme-primary-400/20 rounded-full text-theme-primary-700 dark:text-theme-primary-300 text-sm mb-6 hover:bg-theme-primary-500/30 dark:hover:bg-theme-primary-400/30 transition-colors cursor-pointer">
                      <span className="animate-pulse">🎯</span>
                      <span>Introducing ever.works on</span>
                      <span className="font-bold">𝕏</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                      Modern{" "}
                      <span className="bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 bg-clip-text text-transparent">
                        Web Platform Foundation
                      </span>
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                      Transform your ideas into digital reality with our revolutionary web development foundation built for performance, scalability, and developer experience.
                    </p>

                    {/* Mock Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                      {[
                        { icon: "🚀", title: "Fast Setup", desc: "Launch in minutes", color: "from-theme-primary-500 to-theme-primary-600" },
                        { icon: "💰", title: "Monetization", desc: "Built-in payments", color: "from-theme-secondary-500 to-theme-secondary-600" },
                        { icon: "📱", title: "Responsive", desc: "Works everywhere", color: "from-theme-accent-500 to-theme-accent-600" },
                      ].map((feature, index) => (
                        <div key={index} className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-6 hover:bg-white dark:hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 shadow-lg">
                          <div className="text-3xl mb-3 hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                          <h3 className="text-gray-900 dark:text-white font-semibold mb-2">{feature.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
                          <div className={`w-full h-1 bg-gradient-to-r ${feature.color} rounded-full mt-3 opacity-70`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
} 