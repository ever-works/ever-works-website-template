/**
 * Dynamic image domain configuration
 * This utility helps manage external image domains dynamically
 */

export const COMMON_IMAGE_DOMAINS = [
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'platform-lookaside.fbsbx.com',
  'pbs.twimg.com',
  'images.unsplash.com',
  'cdnjs.cloudflare.com',
  'jsdelivr.net',
  'cdnjs.com',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'example-images.com', 
];

export const ICON_DOMAINS = [
  'flaticon.com',
  'iconify.design',
  'icons8.com',
  'feathericons.com',
  'heroicons.com',
  'tabler-icons.io',
];

/**
 * Generate remote patterns for Next.js image configuration
 */
export function generateImageRemotePatterns() {
  const patterns = [
    {
      protocol: "https" as const,
      hostname: "lh3.googleusercontent.com",
      pathname: "/a/**",
    },
    {
      protocol: "https" as const,
      hostname: "avatars.githubusercontent.com",
      pathname: "/u/**",
    },
    {
      protocol: "https" as const,
      hostname: "platform-lookaside.fbsbx.com",
      pathname: "/platform/**",
    },
    {
      protocol: "https" as const,
      hostname: "pbs.twimg.com",
      pathname: "/**",
    },
    {
      protocol: "https" as const,
      hostname: "images.unsplash.com",
      pathname: "/**",
    },
  ];

  // Add wildcard patterns for common domains
  [ ...COMMON_IMAGE_DOMAINS, ...ICON_DOMAINS ].forEach(domain => {
    patterns.push({
      protocol: "https" as const,
      hostname: `*.${domain}`,
      pathname: "/**",
    });
  });

  return patterns;
}

/**
 * Check if a URL is from an allowed image domain
 */
export function isAllowedImageDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Check exact matches
    if (COMMON_IMAGE_DOMAINS.includes(hostname)) return true;
    if (ICON_DOMAINS.includes(hostname)) return true;

    // Check wildcard matches
    for (const domain of [ ...COMMON_IMAGE_DOMAINS, ...ICON_DOMAINS ]) {
      if (hostname.endsWith(`.${domain}`)) return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Add a new domain to the allowed list dynamically
 * This function can be used to add domains at runtime
 */
export function addImageDomain(domain: string, isIconDomain: boolean = false): void {
  if (isIconDomain) {
    if (!ICON_DOMAINS.includes(domain)) {
      ICON_DOMAINS.push(domain);
    }
  } else {
    if (!COMMON_IMAGE_DOMAINS.includes(domain)) {
      COMMON_IMAGE_DOMAINS.push(domain);
    }
  }
}

/**
 * Remove a domain from the allowed list
 */
export function removeImageDomain(domain: string): void {
  const iconIndex = ICON_DOMAINS.indexOf(domain);
  if (iconIndex > -1) {
    ICON_DOMAINS.splice(iconIndex, 1);
  }

  const commonIndex = COMMON_IMAGE_DOMAINS.indexOf(domain);
  if (commonIndex > -1) {
    COMMON_IMAGE_DOMAINS.splice(commonIndex, 1);
  }
}

/**
 * Get all currently allowed domains
 */
export function getAllowedDomains(): { common: string[]; icons: string[] } {
  return {
    common: [ ...COMMON_IMAGE_DOMAINS ],
    icons: [ ...ICON_DOMAINS ]
  };
}



export function isProblematicUrl(url: string) {
  return url.includes('flaticon.com/fr/icone-gratuite/') ||
    url.includes('?related_id=') ||
    url.includes('&origin=') ||
    !url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
};

// If no URL, URL is problematic, or image failed to load, show default icon
export function shouldShowFallback(url: string) {
  const shouldShowFallback = !url || isProblematicUrl(url);
  return shouldShowFallback;
}