#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
// Remove cache imports
import { fetchPublicationMetadata } from './updatePublicationCache.js';

// ES Module way to check if file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Setup paths properly for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLICATIONS_DIR = path.join(__dirname, '../../src/content/publications');

/**
 * Extract a clean DOI from either a plain DOI or a DOI URL
 */
function extractDoi(input) {
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

/**
 * Generate a markdown file from publication metadata
 */
async function generatePublicationFile(rawInput) {
  // Extract clean DOI from input (handles both DOIs and DOI URLs)
  const doi = extractDoi(rawInput);
  
  if (!doi) {
    console.error(`Invalid DOI format: ${rawInput}`);
    return false;
  }

  // Ensure directory exists
  if (!fs.existsSync(PUBLICATIONS_DIR)) {
    fs.mkdirSync(PUBLICATIONS_DIR, { recursive: true });
  }

  // Always fetch from API, no caching
  const metadata = await fetchPublicationMetadata(doi);
  if (!metadata) {
    console.error(`Failed to fetch metadata for DOI: ${doi}`);
    return false;
  }

  // Create a filename from the DOI (sanitize for filesystem)
  const filename = `${slugify(doi, { lower: true, strict: true })}.md`;
  const filePath = path.join(PUBLICATIONS_DIR, filename);

  // Format authors for frontmatter if available
  let authorsList = '';
  if (metadata.authors) {
    const authorsArray = metadata.authors.split(',').map(a => a.trim());
    authorsList = authorsArray.map(author => `    - "${author}"`).join('\n');
  }

  // Create frontmatter
  const frontmatter = `---
doi: "${doi}"
featured: false
manual_override:
  publication_date: ${metadata.pubDate ? new Date(metadata.pubDate).toISOString() : null}
  ${metadata.venue ? `journal: "${metadata.venue}"` : ''}
  abstract: ""
  citation: "${metadata.title || 'Publication'} (${metadata.pubYear || 'n.d.'})"
  ${authorsList ? `authors:\n${authorsList}` : ''}
---

<!-- You can add additional content about this publication here if needed -->
`;

  // Write to file
  fs.writeFileSync(filePath, frontmatter);
  console.log(`Created publication file: ${filePath}`);
  return true;
}

/**
 * Main execution
 */
async function main() {
  // Get DOIs or DOI URLs from command line arguments
  const inputs = process.argv.slice(2);
  
  if (inputs.length === 0) {
    console.log("Please provide at least one DOI or DOI URL as an argument.");
    console.log("Examples: ");
    console.log("  node generatePublicationMd.js 10.1145/3173574.3173739");
    console.log("  node generatePublicationMd.js https://doi.org/10.1145/3173574.3173739");
    return;
  }
  
  console.log(`Processing ${inputs.length} DOIs...`);
  
  let successCount = 0;
  for (const input of inputs) {
    const success = await generatePublicationFile(input);
    if (success) successCount++;
  }
  
  console.log(`Generated ${successCount} of ${inputs.length} publication files.`);
}

// Export for use in bulk import
export { generatePublicationFile, extractDoi };

// Run if called directly
if (isMainModule) {
  main();
}