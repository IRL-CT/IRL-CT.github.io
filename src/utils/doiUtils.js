/**
 * Extracts a clean DOI from either a plain DOI or a DOI URL
 * @param {string} input - Either a DOI or DOI URL
 * @returns {string} - Clean DOI
 */
export function extractDoi(input) {
  if (!input) return null;
  
  // Clean up the input
  const trimmed = input.trim();
  
  // Check if it's a URL
  if (trimmed.startsWith('http')) {
    // Extract DOI from URL patterns like https://doi.org/10.1145/3173574.3173739
    const doiRegex = /(?:doi\.org\/|dx\.doi\.org\/)(10\.\d+\/[^\/\s]+)/i;
    const match = trimmed.match(doiRegex);
    
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Check if it's already a plain DOI (starts with 10.)
  if (trimmed.startsWith('10.')) {
    // Extract just the DOI part if there's any trailing text
    const doiRegex = /(10\.\d+\/[^\/\s]+)/;
    const match = trimmed.match(doiRegex);
    
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // If we couldn't parse it as a DOI, return null
  return null;
}