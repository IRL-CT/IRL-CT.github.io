#!/usr/bin/env node

import metascraper from 'metascraper';
import metascraperAuthor from 'metascraper-author';
import metascraperDate from 'metascraper-date';
import metascraperDescription from 'metascraper-description';
import metascraperPublisher from 'metascraper-publisher';
import metascraperTitle from 'metascraper-title';
import metascraperUrl from 'metascraper-url';
import { got } from 'got';

// Initialize metascraper with the rules we want
const scraper = metascraper([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  metascraperPublisher(),
  metascraperTitle(),
  metascraperUrl(),
]);

/**
 * Extract metadata from a URL using metascraper
 * @param {string} targetUrl - The URL to extract metadata from
 * @returns {Object|null} - Extracted metadata or null if failed
 */
export async function extractMetadataFromUrl(targetUrl) {
  try {
    console.log(`Extracting metadata from: ${targetUrl}`);
    
    // Fetch the HTML from the URL
    const { body: html, url } = await got(targetUrl, {
      timeout: {
        request: 10000 // 10 second timeout
      },
      headers: {
        'User-Agent': 'IRL-CT.github.io/1.0 (mailto:contact@irl.tech.cornell.edu)'
      }
    });
    
    // Extract metadata using metascraper
    const metadata = await scraper({ html, url });
    
    // Return formatted data ready for a media content entry
    return {
      title: metadata.title || 'Untitled Article',
      source: metadata.publisher || extractDomainFromUrl(targetUrl),
      pubDate: metadata.date ? new Date(metadata.date) : new Date(),
      url: metadata.url || targetUrl,
      description: metadata.description || '',
      tags: ['press'],
      projectIds: [] // Can be manually added later
    };
  } catch (error) {
    console.error(`Error extracting metadata from ${targetUrl}:`, error.message);
    
    // Return basic metadata if extraction fails
    return {
      title: 'Article Title (Manual Edit Required)',
      source: extractDomainFromUrl(targetUrl),
      pubDate: new Date(),
      url: targetUrl,
      description: 'Description needs to be added manually',
      tags: ['press'],
      projectIds: []
    };
  }
}

/**
 * Generate a suggested filename from extracted metadata
 * @param {Object} metadata - The metadata object
 * @returns {string} - Suggested filename
 */
export function generateFilenameFromMetadata(metadata) {
  const date = metadata.pubDate instanceof Date ? 
    metadata.pubDate.toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0];
    
  // Create a simple slug from the title
  const titleSlug = metadata.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Keep letters, numbers, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
    
  return `${date}-${titleSlug || 'article'}.md`;
}

/**
 * Extract domain name from URL for fallback source
 * @param {string} url - The URL to extract domain from
 * @returns {string} - Domain name
 */
function extractDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return 'Unknown Source';
  }
} 