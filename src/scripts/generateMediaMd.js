#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
import { extractMetadataFromUrl, generateFilenameFromMetadata } from '../utils/urlMetadataExtractor.js';

// ES Module way to check if file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Setup paths properly for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDIA_DIR = path.join(__dirname, '../../src/content/media');
const DEFAULT_INPUT_FILE = path.join(__dirname, '../../press.txt');

/**
 * Generate a markdown file for a media entry from a URL
 */
async function generateMediaFile(url) {
  if (!url || !url.startsWith('http')) {
    console.error(`Invalid URL: ${url}`);
    return false;
  }

  // Ensure directory exists
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }

  // Extract metadata from URL
  const metadata = await extractMetadataFromUrl(url);
  if (!metadata) {
    console.error(`Failed to extract metadata from URL: ${url}`);
    return false;
  }

  // Generate filename based on metadata
  const filename = generateFilenameFromMetadata(metadata);
  const filePath = path.join(MEDIA_DIR, filename);

  // Create frontmatter that matches the schema (without image)
  const frontmatter = `---
title: "${metadata.title.replace(/"/g, '\\"')}"
source: "${metadata.source.replace(/"/g, '\\"')}"
pubDate: ${metadata.pubDate.toISOString()}
url: "${metadata.url}"
featured: false
description: "${metadata.description.replace(/"/g, '\\"').substring(0, 500)}"
tags: ${JSON.stringify(metadata.tags || ['press'])}
${metadata.projectIds && metadata.projectIds.length > 0 ? `projectIds: ${JSON.stringify(metadata.projectIds)}` : '# projectIds: []'}
---

<!-- You can add additional content about this media mention here if needed -->
`;

  // Write to file
  fs.writeFileSync(filePath, frontmatter);
  console.log(`Created media file: ${filePath}`);
  return true;
}

/**
 * Process a file containing URLs (one per line)
 */
async function processUrlFile(filePath = DEFAULT_INPUT_FILE) {
  if (!fs.existsSync(filePath)) {
    console.error(`Input file not found: ${filePath}`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const urls = fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')); // Skip empty lines and comments

  console.log(`Processing ${urls.length} URLs from ${filePath}...`);
  
  let successCount = 0;
  for (const url of urls) {
    const success = await generateMediaFile(url);
    if (success) successCount++;
  }
  
  console.log(`Generated ${successCount} of ${urls.length} media files.`);
}

// Main execution
async function main() {
  const customFilePath = process.argv[2];
  await processUrlFile(customFilePath || DEFAULT_INPUT_FILE);
}

// Export for use in other scripts
export { generateMediaFile, processUrlFile };

// Run if called directly
if (isMainModule) {
  main();
}
