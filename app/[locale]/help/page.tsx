import { HowItWorks, InstallationGuide, UsageGuide, TechStack, MonetizationSection } from "./components";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            📚 Ever Works{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Help Center
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Complete step-by-step guide to install, configure, and use Ever Works directory platform. 
            Everything you need to launch your directory in minutes.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            📋 Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="#quick-start"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-blue-400 text-2xl">🚀</span>
              <div>
                <h3 className="font-semibold text-white">Quick Start</h3>
                <p className="text-gray-400 text-sm">Get started in 3 simple steps</p>
              </div>
            </a>
            <a
              href="#installation"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-green-400 text-2xl">📚</span>
              <div>
                <h3 className="font-semibold text-white">Installation</h3>
                <p className="text-gray-400 text-sm">Detailed setup guide</p>
              </div>
            </a>
            <a
              href="#usage"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-purple-400 text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-white">Usage Guide</h3>
                <p className="text-gray-400 text-sm">Learn how to use features</p>
              </div>
            </a>
            <a
              href="#tech-stack"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-cyan-400 text-2xl">🔧</span>
              <div>
                <h3 className="font-semibold text-white">Tech Stack</h3>
                <p className="text-gray-400 text-sm">Technologies we use</p>
              </div>
            </a>
            <a
              href="#monetization"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-yellow-400 text-2xl">💰</span>
              <div>
                <h3 className="font-semibold text-white">Monetization</h3>
                <p className="text-gray-400 text-sm">How to make money</p>
              </div>
            </a>
            <a
              href="#support"
              className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-pink-400 text-2xl">🆘</span>
              <div>
                <h3 className="font-semibold text-white">Support</h3>
                <p className="text-gray-400 text-sm">Get help when you need it</p>
              </div>
            </a>
          </div>
        </div>

        {/* Quick Start Section */}
        <section id="quick-start">
          <HowItWorks />
        </section>

        {/* Installation Guide Section */}
        <section id="installation">
          <InstallationGuide />
        </section>

        {/* Usage Guide Section */}
        <section id="usage">
          <UsageGuide />
        </section>

        {/* Tech Stack Section */}
        <section id="tech-stack">
          <TechStack />
        </section>

        {/* Monetization Section */}
        <section id="monetization">
          <MonetizationSection />
        </section>

        {/* Support Section */}
        <section id="support" className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                🆘 Need Help?
              </h2>
              <p className="text-gray-400 text-lg">
                Can't find what you're looking for? We're here to help!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Documentation */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Documentation</h3>
                <p className="text-gray-400 mb-4">
                  Comprehensive docs and API reference
                </p>
                <a 
                  href="/docs" 
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  View Documentation →
                </a>
              </div>

              {/* Community */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
                <p className="text-gray-400 mb-4">
                  Join our Discord community for support
                </p>
                <a 
                  href="https://discord.gg/ever-works" 
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Join Discord →
                </a>
              </div>

              {/* Contact */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Contact Support</h3>
                <p className="text-gray-400 mb-4">
                  Direct support for premium users
                </p>
                <a 
                  href="mailto:support@ever.works" 
                  className="text-green-400 hover:text-green-300 font-medium"
                >
                  Email Support →
                </a>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-12 bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">❓ Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">How long does it take to set up?</h4>
                  <p className="text-gray-400 text-sm">
                    With our quick start guide, you can have Ever Works running in under 10 minutes.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Do I need coding experience?</h4>
                  <p className="text-gray-400 text-sm">
                    Basic knowledge of web development helps, but our detailed guides make it accessible to beginners.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Can I customize the design?</h4>
                  <p className="text-gray-400 text-sm">
                    Yes! Ever Works is built with Tailwind CSS and offers extensive customization options.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">What hosting do you recommend?</h4>
                  <p className="text-gray-400 text-sm">
                    We recommend Vercel for the best performance, but Ever Works works with any Node.js hosting provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-800">
          <p className="text-gray-400">
            Made with ❤️ by the{" "}
            <a href="https://ever.works" className="text-blue-400 hover:text-blue-300">
              Ever Works
            </a>{" "}
            team
          </p>
        </div>
      </div>
    </div>
  );
}