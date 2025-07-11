#!/usr/bin/env node

import fetch from 'node-fetch';

/**
 * Fetch publication metadata from CrossRef API
 * @param {string} doi - The DOI of the publication
 * @returns {Object|null} - Publication metadata or null if failed
 */
export async function fetchPublicationMetadata(doi) {
  if (!doi) {
    console.error('No DOI provided');
    return null;
  }

  try {
    // Use CrossRef API to fetch metadata
    const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IRL-CT.github.io/1.0 (mailto:contact@irl.tech.cornell.edu)', // Polite user agent
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`CrossRef API error for DOI ${doi}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const work = data.message;

    if (!work) {
      console.error(`No work data found for DOI: ${doi}`);
      return null;
    }

    // Extract and format the metadata
    const metadata = {
      title: work.title?.[0] || 'Untitled',
      authors: formatAuthors(work.author || []),
      pubDate: formatDate(work.published),
      pubYear: extractYear(work.published),
      venue: work['container-title']?.[0] || work.publisher || '',
      abstract: work.abstract || '',
      url: work.URL || `https://doi.org/${doi}`,
      type: work.type || 'article'
    };

    return metadata;

  } catch (error) {
    console.error(`Error fetching metadata for DOI ${doi}:`, error.message);
    return null;
  }
}

/**
 * Format authors array into a comma-separated string
 * @param {Array} authors - Array of author objects from CrossRef
 * @returns {string} - Formatted author string
 */
function formatAuthors(authors) {
  if (!Array.isArray(authors) || authors.length === 0) {
    return '';
  }

  return authors
    .map(author => {
      const given = author.given || '';
      const family = author.family || '';
      
      if (given && family) {
        return `${given} ${family}`;
      } else if (family) {
        return family;
      } else if (given) {
        return given;
      } else {
        return author.name || '';
      }
    })
    .filter(name => name.trim().length > 0)
    .join(', ');
}

/**
 * Format date from CrossRef date parts
 * @param {Object} dateObj - Date object from CrossRef (with date-parts)
 * @returns {string|null} - ISO date string or null
 */
function formatDate(dateObj) {
  if (!dateObj || !dateObj['date-parts'] || !Array.isArray(dateObj['date-parts'][0])) {
    return null;
  }

  const dateParts = dateObj['date-parts'][0];
  const year = dateParts[0];
  const month = dateParts[1] || 1;
  const day = dateParts[2] || 1;

  try {
    return new Date(year, month - 1, day).toISOString();
  } catch (error) {
    console.warn('Invalid date parts:', dateParts);
    return null;
  }
}

/**
 * Extract year from CrossRef date object
 * @param {Object} dateObj - Date object from CrossRef
 * @returns {number|null} - Year or null
 */
function extractYear(dateObj) {
  if (!dateObj || !dateObj['date-parts'] || !Array.isArray(dateObj['date-parts'][0])) {
    return null;
  }

  return dateObj['date-parts'][0][0] || null;
} 