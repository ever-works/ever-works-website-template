"use client";

import { HeroLanding } from "./hero-landing";

// Exemple d'utilisation du composant HeroLanding repositionné
export function HeroLandingExamples() {
  return (
    <div className="space-y-8">
      {/* Exemple 1: Variante par défaut */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Variante par défaut</h2>
        <HeroLanding 
          variant="default"
          showSpecialOffer={true}
          showSocialProof={true}
          showProductPreview={true}
        />
      </div>

      {/* Exemple 2: Variante compacte */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Variante compacte</h2>
        <HeroLanding 
          variant="compact"
          showSpecialOffer={false}
          showSocialProof={false}
          showProductPreview={false}
          primaryCTA={{
            text: "Commencer maintenant",
            href: "/get-started"
          }}
          secondaryCTA={{
            text: "En savoir plus",
            href: "/about"
          }}
        />
      </div>

      {/* Exemple 3: Variante plein écran avec contenu personnalisé */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Variante plein écran avec contenu personnalisé</h2>
        <HeroLanding 
          variant="fullscreen"
          showSpecialOffer={true}
          showSocialProof={true}
          showProductPreview={false}
          customContent={
            <div className="text-center">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-8">
                Votre{" "}
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Application
                </span>
                <br />
                <span className="text-4xl md:text-5xl lg:text-6xl">
                  Personnalisée
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
                Créez quelque chose d&apos;extraordinaire avec notre plateforme moderne
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Démarrer le projet
                </button>
                <button className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105">
                  Voir la démo
                </button>
              </div>
            </div>
          }
        />
      </div>

      {/* Exemple 4: Hero avec titre et sous-titre personnalisés */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Hero avec contenu personnalisé</h2>
        <HeroLanding 
          variant="default"
          title="Application Web Moderne"
          subtitle="Développez des applications performantes et évolutives avec notre stack technologique de pointe"
          primaryCTA={{
            text: "Commencer",
            onClick: () => console.log("Commencer cliqué")
          }}
          secondaryCTA={{
            text: "Documentation",
            href: "/docs"
          }}
        />
      </div>

      {/* Exemple 5: Hero minimaliste */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Hero minimaliste</h2>
        <HeroLanding 
          variant="compact"
          showSpecialOffer={false}
          showSocialProof={false}
          showProductPreview={false}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
          title="Simple et Efficace"
          subtitle="Une solution moderne pour vos besoins de développement"
        />
      </div>
    </div>
  );
}

// Exemples d'utilisation dans différentes pages
export function HomePageHero() {
  return (
    <HeroLanding 
      variant="fullscreen"
      title="Transformez vos idées"
      subtitle="Créez des applications web modernes avec notre plateforme de développement révolutionnaire"
      primaryCTA={{
        text: "Commencer maintenant",
        href: "/get-started"
      }}
      secondaryCTA={{
        text: "Voir la démo",
        onClick: () => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
      }}
    />
  );
}

export function LandingPageHero() {
  return (
    <HeroLanding 
      variant="default"
      showSpecialOffer={true}
      showSocialProof={true}
      showProductPreview={true}
      primaryCTA={{
        text: "Essayer gratuitement",
        href: "/signup"
      }}
      secondaryCTA={{
        text: "En savoir plus",
        href: "/features"
      }}
    />
  );
}

export function DocumentationHero() {
  return (
    <HeroLanding 
      variant="compact"
      showSpecialOffer={false}
      showSocialProof={false}
      showProductPreview={false}
      title="Documentation"
      subtitle="Tout ce que vous devez savoir pour utiliser notre plateforme"
      primaryCTA={{
        text: "Guide de démarrage",
        href: "/docs/getting-started"
      }}
      secondaryCTA={{
        text: "Exemples",
        href: "/docs/examples"
      }}
    />
  );
} 