#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
import fetch from 'node-fetch';

// ES Module way to check if file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Setup paths properly for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIDEOS_DIR = path.join(__dirname, '../../src/content/videos');
const DEFAULT_INPUT_FILE = path.join(__dirname, '../../videos.txt');

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
function extractYouTubeId(url) {
  if (!url) return null;
  
  // Handle various YouTube URL formats
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
 * Fetch video metadata from YouTube oEmbed API
 */
async function getYouTubeMetadata(url) {
  try {
    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      throw new Error(`Could not extract YouTube ID from URL: ${url}`);
    }
    
    // Use oEmbed API to get basic info
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Get current date as fallback for publishedAt
    const currentDate = new Date();
    
    return {
      title: data.title || 'Untitled Video',
      youtubeId,
      publishedAt: currentDate.toISOString(),
      description: data.author_name ? `Video by ${data.author_name}` : 'YouTube video',
      thumbnailUrl: data.thumbnail_url,
      url: url,
    };
  } catch (error) {
    console.error(`Error fetching YouTube metadata: ${error.message}`);
    return null;
  }
}

/**
 * Generate a filename based on the video metadata
 */
function generateFilenameFromMetadata(metadata) {
  const dateStr = new Date(metadata.publishedAt).toISOString().split('T')[0];
  const slug = slugify(metadata.title, { lower: true, strict: true });
  return `${dateStr}-${slug}.md`;
}

/**
 * Generate a markdown file for a YouTube video from a URL
 */
async function generateVideoFile(url) {
  if (!url || !url.trim().startsWith('http')) {
    console.error(`Invalid URL: ${url}`);
    return false;
  }

  // Ensure directory exists
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }

  // Extract metadata from URL
  const metadata = await getYouTubeMetadata(url);
  if (!metadata) {
    console.error(`Failed to extract metadata from URL: ${url}`);
    return false;
  }

  // Generate filename based on metadata
  const filename = generateFilenameFromMetadata(metadata);
  const filePath = path.join(VIDEOS_DIR, filename);

  // Create frontmatter
  const frontmatter = `---
title: "${metadata.title.replace(/"/g, '\\"')}"
youtubeId: "${metadata.youtubeId}"
publishedAt: ${metadata.publishedAt}
description: "${metadata.description?.replace(/"/g, '\\"')?.substring(0, 500) || ''}"
thumbnailUrl: "${metadata.thumbnailUrl || ''}"
featured: false
tags: ["video"]
# projectIds: []
---

<!-- You can add additional notes about this video here -->
`;

  // Write to file
  fs.writeFileSync(filePath, frontmatter);
  console.log(`Created video file: ${filePath}`);
  return true;
}

/**
 * Process a file containing YouTube URLs (one per line)
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

  console.log(`Processing ${urls.length} YouTube URLs from ${filePath}...`);
  
  let successCount = 0;
  for (const url of urls) {
    const success = await generateVideoFile(url);
    if (success) successCount++;
  }
  
  console.log(`Generated ${successCount} of ${urls.length} video files.`);
}

// Main execution
async function main() {
  const customFilePath = process.argv[2];
  await processUrlFile(customFilePath || DEFAULT_INPUT_FILE);
}

// Export for use in other scripts
export { generateVideoFile, processUrlFile };

// Run if called directly
if (isMainModule) {
  main();
}
