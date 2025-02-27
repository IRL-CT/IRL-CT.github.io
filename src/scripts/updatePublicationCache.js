#!/usr/bin/env node

/**
 * This script scans the publication markdown files, extracts DOIs,
 * and updates the publications cache by fetching metadata from the CrossRef API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import matter from 'gray-matter';
import { 
  readCache, 
  writeCache, 
  isPublicationCached,
  addToCache,
} from '../utils/publicationCache.ts'; // Change extension from .js to .ts

// Setup paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '../../src/content/publications');

// API fetch configuration
const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

/**
 * Extract DOIs from publication markdown files
 */
async function extractDOIsFromFiles() {
  const files = await glob(`${CONTENT_DIR}/**/*.md`);
  const dois = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const { data } = matter(content);
      
      if (data.doi) {
        dois.push(data.doi);
      }
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  }
  
  return dois;
}

/**
 * Fetch metadata from CrossRef API
 */
async function fetchPublicationMetadata(doi) {
  try {
    console.log(`Fetching metadata for DOI: ${doi}`);
    
    const response = await fetch(`https://api.crossref.org/works/${doi}`, {
      headers: {
        'User-Agent': 'CIDRL Publication Cache/1.0 (https://cidrl.cornell.edu; mailto:contact@cidrl.cornell.edu)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract relevant fields
    const paper = data.message;
    
    // Extract authors
    const authors = paper.author?.map(author => 
      `${author.given || ''} ${author.family || ''}`
    ).join(", ") || "Unknown Authors";
    
    // Extract publication date
    let pubDate = null;
    let pubYear = null;
    
    if (paper.published && paper.published['date-parts'] && paper.published['date-parts'][0]) {
      const dateParts = paper.published['date-parts'][0];
      const year = dateParts[0];
      const month = dateParts[1] ? dateParts[1] - 1 : 0; // JS months are 0-indexed
      const day = dateParts[2] || 1;
      
      const date = new Date(year, month, day);
      pubDate = date.toISOString();
      pubYear = year.toString();
    } else if (paper.created && paper.created['date-parts'] && paper.created['date-parts'][0]) {
      // Fall back to creation date
      const dateParts = paper.created['date-parts'][0];
      const year = dateParts[0];
      pubYear = year.toString();
    }
    
    // Extract venue (journal or conference)
    const venue = paper['container-title']?.[0] || 
                 paper['event']?.name || 
                 paper['publisher'] || 
                 "Unknown Venue";
    
    return {
      title: paper.title?.[0] || "Untitled Paper",
      authors,
      venue,
      pubDate,
      pubYear,
    };
  } catch (error) {
    console.error(`Error fetching metadata for DOI ${doi}:`, error);
    return null;
  }
}

/**
 * Process DOIs in batches with delay to avoid rate limiting
 */
async function processDoiInBatches(dois) {
  const cache = readCache();
  const toFetch = dois.filter(doi => !isPublicationCached(doi));
  
  console.log(`${toFetch.length} of ${dois.length} DOIs need to be fetched.`);
  
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batchDois = toFetch.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(toFetch.length/BATCH_SIZE)}`);
    
    const batchPromises = batchDois.map(async doi => {
      // Add some jitter to avoid exact same-time requests
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
      
      const metadata = await fetchPublicationMetadata(doi);
      
      if (metadata) {
        addToCache(doi, metadata);
        return { doi, success: true };
      }
      
      return { doi, success: false };
    });
    
    const results = await Promise.all(batchPromises);
    console.log(`Batch results: ${results.filter(r => r.success).length} succeeded, ${results.filter(r => !r.success).length} failed`);
    
    // Wait between batches to be nice to the API
    if (i + BATCH_SIZE < toFetch.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  // After all batches, update lastUpdated time
  const updatedCache = readCache();
  updatedCache.lastUpdated = new Date().toISOString();
  writeCache(updatedCache);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log("Extracting DOIs from publication files...");
    const dois = await extractDOIsFromFiles();
    console.log(`Found ${dois.length} DOIs in publication files.`);
    
    if (dois.length === 0) {
      console.log("No DOIs found. Exiting.");
      return;
    }
    
    console.log("Processing DOIs and updating cache...");
    await processDoiInBatches(dois);
    
    console.log("Cache update complete!");
  } catch (error) {
    console.error("Error updating publication cache:", error);
    process.exit(1);
  }
}

main();
