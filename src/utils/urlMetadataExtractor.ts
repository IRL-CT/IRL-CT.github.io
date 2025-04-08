import metascraper from 'metascraper';
import metascraperAuthor from 'metascraper-author';
import metascraperDate from 'metascraper-date';
import metascraperDescription from 'metascraper-description';
// Remove image scraper
import metascraperPublisher from 'metascraper-publisher';
import metascraperTitle from 'metascraper-title';
import metascraperUrl from 'metascraper-url';
import { got } from 'got';

// Initialize metascraper with the rules we want
const scraper = metascraper([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  // Remove image scraper
  metascraperPublisher(),
  metascraperTitle(),
  metascraperUrl(),
]);

export async function extractMetadataFromUrl(targetUrl: string) {
  try {
    // Fetch the HTML from the URL
    const { body: html, url } = await got(targetUrl);
    
    // Extract metadata using metascraper
    const metadata = await scraper({ html, url });
    
    // Return formatted data ready for a media content entry
    return {
      title: metadata.title || '',
      source: metadata.publisher || '',
      pubDate: metadata.date ? new Date(metadata.date) : new Date(),
      url: metadata.url || targetUrl,
      // Remove image field
      description: metadata.description || '',
      // Default tags and other fields
      tags: ['press'],
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return null;
  }
}

/**
 * Generate a suggested filename from extracted metadata
 */
export function generateFilenameFromMetadata(metadata: any) {
  const date = metadata.pubDate instanceof Date ? 
    metadata.pubDate.toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0];
    
  // Create a simple slug from the title
  const titleSlug = metadata.title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
    
  return `${date}-${titleSlug}.md`;
}
