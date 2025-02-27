import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define the publication data structure
interface PublicationData {
  doi: string;
  title: string;
  authors: string;
  venue: string;
  pubDate?: string;
  pubYear?: string;
  fetchedAt: string;
}

// Directory for storing cache data
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '../../public/data');
const CACHE_FILE = path.join(CACHE_DIR, 'publications-cache.json');
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Ensure cache directory exists
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// Initialize empty cache if not exists
function initCache() {
  ensureCacheDir();
  if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      publications: {}
    }));
  }
}

// Read from cache
export function readCache(): { 
  lastUpdated: string; 
  publications: Record<string, PublicationData>;
} {
  initCache();
  try {
    const cacheData = fs.readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(cacheData);
  } catch (error) {
    console.error('Error reading publication cache:', error);
    return {
      lastUpdated: new Date().toISOString(),
      publications: {}
    };
  }
}

// Write to cache
export function writeCache(data: { 
  lastUpdated: string; 
  publications: Record<string, PublicationData>;
}) {
  ensureCacheDir();
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to publication cache:', error);
  }
}

// Add a publication to cache
export function addToCache(doi: string, publicationData: Omit<PublicationData, 'doi' | 'fetchedAt'>) {
  const cache = readCache();
  
  cache.publications[doi] = {
    doi,
    ...publicationData,
    fetchedAt: new Date().toISOString()
  };
  
  cache.lastUpdated = new Date().toISOString();
  writeCache(cache);
}

// Get all cached publications
export function getAllCachedPublications(): PublicationData[] {
  const cache = readCache();
  return Object.values(cache.publications);
}

// Get a specific publication from cache by DOI
export function getPublicationFromCache(doi: string): PublicationData | null {
  const cache = readCache();
  return cache.publications[doi] || null;
}

// Check if a publication exists in the cache and is not too old
export function isPublicationCached(doi: string): boolean {
  const pub = getPublicationFromCache(doi);
  if (!pub) return false;
  
  const fetchedAt = new Date(pub.fetchedAt).getTime();
  const now = Date.now();
  
  return now - fetchedAt < CACHE_MAX_AGE;
}

// Delete a publication from cache
export function removeFromCache(doi: string) {
  const cache = readCache();
  if (cache.publications[doi]) {
    delete cache.publications[doi];
    cache.lastUpdated = new Date().toISOString();
    writeCache(cache);
    return true;
  }
  return false;
}

// Return the cache's age in milliseconds
export function getCacheAge(): number {
  const cache = readCache();
  const lastUpdated = new Date(cache.lastUpdated).getTime();
  return Date.now() - lastUpdated;
}
