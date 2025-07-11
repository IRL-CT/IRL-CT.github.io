#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module setup
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_INPUT_FILE = path.join(__dirname, '../../press-metadata.json');
const MEDIA_DIR = path.join(__dirname, '../../src/content/media');

/**
 * Generate markdown file from metadata entry
 */
function generateMarkdownContent(metadata) {
  // Format tags
  const tags = Array.isArray(metadata.tags) ? metadata.tags : ['press'];
  const tagsString = JSON.stringify(tags);
  
  // Format project IDs
  const projectIds = Array.isArray(metadata.projectIds) ? metadata.projectIds : [];
  const projectIdsString = projectIds.length > 0 ? 
    `projectIds: ${JSON.stringify(projectIds)}` : 
    '# projectIds: []';

  // Build frontmatter
  let frontmatter = `---
title: "${metadata.title.replace(/"/g, '\\"')}"
source: "${metadata.source.replace(/"/g, '\\"')}"
pubDate: ${metadata.pubDate}
url: "${metadata.url}"
featured: ${metadata.featured || false}
description: "${metadata.description.replace(/"/g, '\\"').substring(0, 500)}"
tags: ${tagsString}
${projectIdsString}`;

  // Add YouTube-specific fields
  if (metadata.type === 'youtube') {
    frontmatter += `
youtubeId: "${metadata.youtubeId || ''}"
thumbnailUrl: "${metadata.thumbnailUrl || ''}"
channelName: "${metadata.channelName || ''}"`;
  }

  // Add author if available
  if (metadata.author) {
    frontmatter += `
author: "${metadata.author.replace(/"/g, '\\"')}"`;
  }

  frontmatter += '\n---\n\n';

  // Add content body
  let content = '<!-- You can add additional content about this media mention here if needed -->\n';
  
  // Add notes if this needed manual review
  if (metadata.needsManualReview && metadata.notes) {
    content += '\n<!-- NOTES FROM EXTRACTION:\n';
    if (Array.isArray(metadata.notes)) {
      metadata.notes.forEach(note => {
        content += `- ${note}\n`;
      });
    } else {
      content += `- ${metadata.notes}\n`;
    }
    content += '-->\n';
  }

  return frontmatter + content;
}

/**
 * Check if file already exists and compare content
 */
function shouldUpdateFile(filePath, newContent) {
  if (!fs.existsSync(filePath)) {
    return true; // File doesn't exist, create it
  }

  const existingContent = fs.readFileSync(filePath, 'utf-8');
  
  // Extract frontmatter from existing file
  const existingFrontmatterMatch = existingContent.match(/^---\n([\s\S]*?)\n---/);
  const newFrontmatterMatch = newContent.match(/^---\n([\s\S]*?)\n---/);
  
  if (!existingFrontmatterMatch || !newFrontmatterMatch) {
    return true; // Malformed file, update it
  }

  // Compare frontmatter only (allow manual content additions)
  return existingFrontmatterMatch[1].trim() !== newFrontmatterMatch[1].trim();
}

/**
 * Generate all markdown files from JSON metadata
 */
function generateAllMarkdown(inputFile = METADATA_INPUT_FILE) {
  if (!fs.existsSync(inputFile)) {
    console.error(`Metadata file not found: ${inputFile}`);
    console.log('Run "node src/scripts/extractMediaMetadata.js" first to extract metadata.');
    return;
  }

  // Ensure output directory exists
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }

  // Load metadata
  let metadata;
  try {
    metadata = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  } catch (error) {
    console.error(`Error reading metadata file: ${error.message}`);
    return;
  }

  if (!metadata.entries || Object.keys(metadata.entries).length === 0) {
    console.error('No entries found in metadata file');
    return;
  }

  console.log(`Generating markdown files from ${Object.keys(metadata.entries).length} entries...`);

  const stats = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };

  // Process each entry
  for (const [url, entry] of Object.entries(metadata.entries)) {
    stats.total++;
    
    try {
      const filename = entry.filename || generateDefaultFilename(entry);
      const filePath = path.join(MEDIA_DIR, filename);
      const markdownContent = generateMarkdownContent(entry);

      if (shouldUpdateFile(filePath, markdownContent)) {
        fs.writeFileSync(filePath, markdownContent);
        
        if (fs.existsSync(filePath)) {
          stats.updated++;
          console.log(`📝 Updated: ${filename}`);
        } else {
          stats.created++;
          console.log(`✅ Created: ${filename}`);
        }

        // Show warnings for manual review items
        if (entry.needsManualReview) {
          console.log(`   ⚠️  Needs manual review - check the markdown file`);
        }
      } else {
        stats.skipped++;
        console.log(`⏭️  Skipped: ${filename} (no changes)`);
      }

    } catch (error) {
      stats.errors++;
      console.error(`❌ Error processing ${url}: ${error.message}`);
    }
  }

  console.log('\n📊 Generation Summary:');
  console.log(`Total entries: ${stats.total}`);
  console.log(`Created: ${stats.created}`);
  console.log(`Updated: ${stats.updated}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);

  // Check for entries that still need review
  const needsReview = Object.values(metadata.entries).filter(entry => entry.needsManualReview);
  if (needsReview.length > 0) {
    console.log(`\n⚠️  ${needsReview.length} entries still need manual review:`);
    needsReview.forEach(entry => {
      console.log(`   - ${entry.title} (${entry.url})`);
    });
    console.log('\nPlease review and edit the markdown files or update the JSON metadata.');
  }

  console.log(`\n📁 Generated files saved to: ${MEDIA_DIR}`);
}

/**
 * Generate default filename if not provided
 */
function generateDefaultFilename(metadata) {
  const date = new Date(metadata.pubDate).toISOString().split('T')[0];
  const titleSlug = (metadata.title || 'article')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
    
  return `${date}-${titleSlug}.md`;
}

/**
 * Show statistics about the metadata file
 */
function showMetadataStats(inputFile = METADATA_INPUT_FILE) {
  if (!fs.existsSync(inputFile)) {
    console.error(`Metadata file not found: ${inputFile}`);
    return;
  }

  const metadata = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  
  console.log('📊 Metadata Statistics:');
  console.log(`Last updated: ${metadata.lastUpdated}`);
  console.log(`Total entries: ${metadata.stats?.total || Object.keys(metadata.entries || {}).length}`);
  console.log(`Processed: ${metadata.stats?.processed || 0}`);
  console.log(`Errors: ${metadata.stats?.errors || 0}`);
  console.log(`Need review: ${metadata.stats?.needsReview || 0}`);

  const entries = Object.values(metadata.entries || {});
  const byType = entries.reduce((acc, entry) => {
    acc[entry.type || 'unknown'] = (acc[entry.type || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  console.log('\nBy type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

// Main execution
if (isMainModule) {
  const command = process.argv[2];
  const inputFile = process.argv[3];

  if (command === '--stats') {
    showMetadataStats(inputFile);
  } else {
    generateAllMarkdown(inputFile);
  }
}

export { generateAllMarkdown, showMetadataStats }; 