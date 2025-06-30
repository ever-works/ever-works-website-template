import { FILTER_CONSTANTS } from '../constants';

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number = FILTER_CONSTANTS.TEXT_TRUNCATE_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Check if text was truncated
 */
export function isTextTruncated(text: string, maxLength: number = FILTER_CONSTANTS.TEXT_TRUNCATE_LENGTH): boolean {
  return text.length > maxLength;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
} 