/**
 * Validates if a string is a valid hex color code
 * @param hex - The hex color string to validate
 * @returns true if valid hex color, false otherwise
 */
export function isValidHex(hex: string): boolean {
  // Check if it's a valid hex color (#RRGGBB or #RGB)
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hex);
}

/**
 * Normalizes a hex color to 6-digit format (#RRGGBB)
 * @param hex - The hex color string to normalize
 * @returns Normalized 6-digit hex color or null if invalid
 */
export function normalizeHex(hex: string): string | null {
  if (!isValidHex(hex)) return null;
  
  // If it's a 3-digit hex, expand it to 6 digits
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  
  return hex.toUpperCase();
}

/**
 * Generates a contrasting text color (black or white) for a given background color
 * @param hex - The background hex color
 * @returns '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
 */
export function getContrastColor(hex: string): string {
  if (!isValidHex(hex)) return '#FFFFFF';
  
  // Remove the # and convert to RGB
  const hexWithoutHash = hex.replace('#', '');
  const r = parseInt(hexWithoutHash.substr(0, 2), 16);
  const g = parseInt(hexWithoutHash.substr(2, 2), 16);
  const b = parseInt(hexWithoutHash.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
