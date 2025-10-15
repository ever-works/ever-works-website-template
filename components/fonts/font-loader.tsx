"use client";

import { useEffect } from 'react';

export function FontLoader() {
  useEffect(() => {
    // Load Geist fonts via CSS import to avoid hydration mismatch
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Set CSS custom properties for font families
    document.documentElement.style.setProperty('--font-geist-sans', 'Geist, ui-sans-serif, system-ui, sans-serif');
    document.documentElement.style.setProperty('--font-geist-mono', 'Geist Mono, ui-monospace, SFMono-Regular, Consolas, monospace');

    return () => {
      // Cleanup on unmount
      if (fontLink.parentNode) {
        fontLink.parentNode.removeChild(fontLink);
      }
    };
  }, []);

  return null;
}