/**
 * Utility functions for cleaning and validating URLs
 */

/**
 * Clean and validate a URL string
 * Removes surrounding quotes, whitespace, and ensures proper protocol
 */
export function cleanUrl(url: string): string {
  if (!url) return '';
  
  // Remove any surrounding quotes or whitespace
  let cleaned = url.trim().replace(/^["']|["']$/g, '');
  
  // Check for existing protocol (case-insensitive)
  const protocolMatch = cleaned.match(/^([a-z]+):\/\//i);
  
  if (protocolMatch) {
    // Protocol exists - normalize to lowercase
    const protocol = protocolMatch[1].toLowerCase();
    const rest = cleaned.substring(protocolMatch[0].length);
    return `${protocol}://${rest}`;
  } else {
    // No protocol - add https:// as default for security
    return `https://${cleaned}`;
  }
}

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://demo.ever.works");

/**
 * Get the base URL for API calls with proper cleaning
 */
export function getBaseUrl(): string {  
  return cleanUrl(rawAppUrl);
}

/**
 * Construct a full URL from a path
 */
export function buildUrl(path: string, baseUrl?: string): string {
  const base = baseUrl ? cleanUrl(baseUrl) : getBaseUrl();
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${base}${cleanPath}`;
}
