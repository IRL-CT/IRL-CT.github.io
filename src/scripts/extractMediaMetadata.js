#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import metascraper from 'metascraper';
import metascraperAuthor from 'metascraper-author';
import metascraperDate from 'metascraper-date';
import metascraperDescription from 'metascraper-description';
import metascraperPublisher from 'metascraper-publisher';
import metascraperTitle from 'metascraper-title';
import metascraperUrl from 'metascraper-url';
import { got } from 'got';

// ES Module setup
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_INPUT_FILE = path.join(__dirname, '../../press.txt');
const METADATA_OUTPUT_FILE = path.join(__dirname, '../../press-metadata.json');

// Initialize metascraper
const scraper = metascraper([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  metascraperPublisher(),
  metascraperTitle(),
  metascraperUrl(),
]);

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url) {
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube\.com\/watch\?.*v=)([^?&"'>]+)/,
    /youtube\.com\/watch\?.*v=([^?&"'>]+)/,
    /youtube\.com\/shorts\/([^?&"'>]+)/
  ];

  for (const regex of regexPatterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extract metadata from YouTube video using oEmbed API
 */
async function extractYouTubeMetadata(url) {
  try {
    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      throw new Error('Could not extract YouTube ID');
    }

    // Use oEmbed API
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`YouTube oEmbed failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      title: data.title || 'YouTube Video',
      source: data.author_name || 'YouTube',
      pubDate: new Date().toISOString(), // YouTube oEmbed doesn't provide publish date
      url: url,
      description: `Video by ${data.author_name || 'Unknown Channel'}`,
      tags: ['press', 'video'],
      type: 'youtube',
      youtubeId: youtubeId,
      thumbnailUrl: data.thumbnail_url,
      channelName: data.author_name,
      needsManualReview: true, // YouTube dates need manual verification
      notes: 'YouTube publish date needs manual verification'
    };
  } catch (error) {
    console.error(`Error extracting YouTube metadata: ${error.message}`);
    return null;
  }
}

/**
 * Extract metadata from regular web article
 */
async function extractWebMetadata(url) {
  try {
    console.log(`Extracting metadata from: ${url}`);
    
    const { body: html, url: finalUrl } = await got(url, {
      timeout: { request: 15000 },
      headers: {
        'User-Agent': 'IRL-CT.github.io/1.0 (mailto:contact@irl.tech.cornell.edu)'
      }
    });
    
    const metadata = await scraper({ html, url: finalUrl });
    
    // Parse and validate date
    let pubDate = new Date();
    let needsDateReview = false;
    
    if (metadata.date) {
      const parsedDate = new Date(metadata.date);
      if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 2000) {
        pubDate = parsedDate;
      } else {
        needsDateReview = true;
      }
    } else {
      needsDateReview = true;
    }
    
    return {
      title: metadata.title || 'Article Title (Needs Manual Edit)',
      source: metadata.publisher || extractDomainFromUrl(url),
      pubDate: pubDate.toISOString(),
      url: finalUrl || url,
      description: metadata.description || 'Description needs manual edit',
      tags: ['press'],
      type: 'article',
      author: metadata.author || '',
      needsManualReview: !metadata.title || !metadata.description || needsDateReview,
      notes: buildNotesArray(metadata, needsDateReview)
    };
  } catch (error) {
    console.error(`Error extracting metadata from ${url}: ${error.message}`);
    
    return {
      title: 'Article Title (Manual Edit Required)',
      source: extractDomainFromUrl(url),
      pubDate: new Date().toISOString(),
      url: url,
      description: 'Description needs manual edit - extraction failed',
      tags: ['press'],
      type: 'article',
      needsManualReview: true,
      notes: [`Extraction failed: ${error.message}`, 'All fields need manual verification']
    };
  }
}

/**
 * Build notes array for manual review
 */
function buildNotesArray(metadata, needsDateReview) {
  const notes = [];
  if (!metadata.title) notes.push('Title needs manual edit');
  if (!metadata.description) notes.push('Description needs manual edit');
  if (needsDateReview) notes.push('Publication date needs verification');
  if (!metadata.publisher) notes.push('Source/publisher needs verification');
  return notes;
}

/**
 * Extract domain from URL for fallback source
 */
function extractDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (error) {
    return 'Unknown Source';
  }
}

/**
 * Generate filename from metadata
 */
function generateFilename(metadata) {
  const date = new Date(metadata.pubDate).toISOString().split('T')[0];
  const titleSlug = metadata.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
    
  return `${date}-${titleSlug || 'article'}.md`;
}

/**
 * Main extraction function
 */
async function extractAllMetadata(inputFile = DEFAULT_INPUT_FILE) {
  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    return;
  }

  // Read URLs from file
  const content = fs.readFileSync(inputFile, 'utf-8');
  const urls = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  console.log(`Processing ${urls.length} URLs...`);

  // Load existing metadata if available
  let existingMetadata = {};
  if (fs.existsSync(METADATA_OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(METADATA_OUTPUT_FILE, 'utf-8'));
      existingMetadata = existing.entries || {};
    } catch (error) {
      console.warn('Could not load existing metadata, starting fresh');
    }
  }

  const results = {
    lastUpdated: new Date().toISOString(),
    stats: {
      total: urls.length,
      processed: 0,
      errors: 0,
      needsReview: 0
    },
    entries: {}
  };

  // Process each URL
  for (const url of urls) {
    console.log(`\nProcessing: ${url}`);
    
    // Skip if already processed (unless forced)
    if (existingMetadata[url] && !process.argv.includes('--force')) {
      console.log('  Skipping (already processed, use --force to reprocess)');
      results.entries[url] = existingMetadata[url];
      results.stats.processed++;
      if (existingMetadata[url].needsManualReview) results.stats.needsReview++;
      continue;
    }

    try {
      let metadata;
      
      // Check if it's a YouTube URL
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        metadata = await extractYouTubeMetadata(url);
      } else {
        metadata = await extractWebMetadata(url);
      }

      if (metadata) {
        metadata.filename = generateFilename(metadata);
        metadata.processed = new Date().toISOString();
        
        results.entries[url] = metadata;
        results.stats.processed++;
        
        if (metadata.needsManualReview) {
          results.stats.needsReview++;
          console.log('  ⚠️  Needs manual review');
        } else {
          console.log('  ✅ Successfully processed');
        }
      } else {
        results.stats.errors++;
        console.log('  ❌ Failed to process');
      }
    } catch (error) {
      console.error(`  Error: ${error.message}`);
      results.stats.errors++;
    }

    // Small delay to be polite to servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save results
  fs.writeFileSync(METADATA_OUTPUT_FILE, JSON.stringify(results, null, 2));
  
  console.log('\n📊 Processing Summary:');
  console.log(`Total URLs: ${results.stats.total}`);
  console.log(`Successfully processed: ${results.stats.processed}`);
  console.log(`Errors: ${results.stats.errors}`);
  console.log(`Need manual review: ${results.stats.needsReview}`);
  console.log(`\n💾 Metadata saved to: ${METADATA_OUTPUT_FILE}`);
  
  if (results.stats.needsReview > 0) {
    console.log('\n⚠️  Some entries need manual review. Please edit the JSON file before generating markdown.');
    console.log('   Look for entries with "needsManualReview": true');
  }
}

// Main execution
if (isMainModule) {
  const inputFile = process.argv[2];
  extractAllMetadata(inputFile);
}

export { extractAllMetadata, extractYouTubeMetadata, extractWebMetadata }; 