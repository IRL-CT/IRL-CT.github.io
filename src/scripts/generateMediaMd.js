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
import slugify from 'slugify';

// ES Module setup
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_DIR = path.join(__dirname, '../../src/content/media');
const DEFAULT_INPUT_FILE = path.join(__dirname, '../../press.txt');

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

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`YouTube oEmbed failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      title: data.title || 'YouTube Video',
      source: data.author_name || 'YouTube',
      pubDate: new Date(), // YouTube oEmbed doesn't provide publish date - user can edit manually
      url: url,
      description: `Video by ${data.author_name || 'Unknown Channel'}`,
      tags: ['press', 'video'],
      youtubeId: youtubeId,
      thumbnailUrl: data.thumbnail_url,
      channelName: data.author_name
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
    
    // Parse date with validation
    let pubDate = new Date();
    if (metadata.date) {
      const parsedDate = new Date(metadata.date);
      if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 2000) {
        pubDate = parsedDate;
      }
    }
    
    return {
      title: metadata.title || 'Article Title',
      source: metadata.publisher || extractDomainFromUrl(url),
      pubDate: pubDate,
      url: finalUrl || url,
      description: metadata.description || '',
      tags: ['press'],
      author: metadata.author || ''
    };
  } catch (error) {
    console.error(`Error extracting metadata from ${url}: ${error.message}`);
    
    return {
      title: 'Article Title',
      source: extractDomainFromUrl(url),
      pubDate: new Date(),
      url: url,
      description: '',
      tags: ['press']
    };
  }
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
function generateFilenameFromMetadata(metadata) {
  const date = metadata.pubDate.toISOString().split('T')[0];
  const titleSlug = slugify(metadata.title, { lower: true, strict: true });
  return `${date}-${titleSlug.substring(0, 50)}.md`;
}

/**
 * Generate markdown file from metadata
 */
async function generateMediaFile(url) {
  if (!url || !url.trim().startsWith('http')) {
    console.error(`Invalid URL: ${url}`);
    return false;
  }

  // Ensure directory exists
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }

  // Extract metadata based on URL type
  let metadata;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    metadata = await extractYouTubeMetadata(url);
  } else {
    metadata = await extractWebMetadata(url);
  }

  if (!metadata) {
    console.error(`Failed to extract metadata from URL: ${url}`);
    return false;
  }

  // Generate filename
  const filename = generateFilenameFromMetadata(metadata);
  const filePath = path.join(MEDIA_DIR, filename);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`File already exists: ${filename} (skipping)`);
    return false;
  }

  // Build frontmatter
  let frontmatter = `---
title: "${metadata.title.replace(/"/g, '\\"')}"
source: "${metadata.source.replace(/"/g, '\\"')}"
pubDate: ${metadata.pubDate.toISOString()}
url: "${metadata.url}"
featured: false
description: "${metadata.description.replace(/"/g, '\\"').substring(0, 500)}"
tags: ${JSON.stringify(metadata.tags)}
# projectIds: []`;

  // Add YouTube-specific fields
  if (metadata.youtubeId) {
    frontmatter += `
youtubeId: "${metadata.youtubeId}"
thumbnailUrl: "${metadata.thumbnailUrl || ''}"
channelName: "${metadata.channelName || ''}"`;
  }

  // Add author if available
  if (metadata.author) {
    frontmatter += `
author: "${metadata.author.replace(/"/g, '\\"')}"`;
  }

  frontmatter += '\n---\n\n';

  // Add content
  let content = '<!-- You can add additional content about this media mention here if needed -->\n';
  
  // Add note for YouTube videos about manual date verification
  if (metadata.youtubeId) {
    content += '\n<!-- NOTE: YouTube publish date may need manual verification -->\n';
  }

  const markdownContent = frontmatter + content;

  // Write to file
  fs.writeFileSync(filePath, markdownContent);
  console.log(`Created media file: ${filename}`);
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
  let skippedCount = 0;
  
  for (const url of urls) {
    console.log(`\nProcessing: ${url}`);
    
    const success = await generateMediaFile(url);
    if (success) {
      successCount++;
    } else {
      skippedCount++;
    }
    
    // Small delay to be polite to servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`Total URLs: ${urls.length}`);
  console.log(`Successfully created: ${successCount}`);
  console.log(`Skipped (duplicates/errors): ${skippedCount}`);
  
  if (successCount > 0) {
    console.log(`\n✅ Media files created in: ${MEDIA_DIR}`);
    console.log(`💡 Tip: You can directly edit the generated markdown files to fix any titles, dates, or descriptions!`);
  }
}

// Main execution
if (isMainModule) {
  const customFilePath = process.argv[2];
  processUrlFile(customFilePath);
}

// Export for use in other scripts
export { generateMediaFile, processUrlFile };
