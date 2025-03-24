#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { generatePublicationFile, extractDoi } from './generatePublicationMd.js';

// ES Module way to check if file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Setup paths properly for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Extracting DOIs from publication files...");

  const inputs = [];
  const skipped = [];
  
  // Read DOIs or URLs line by line
  for await (const line of rl) {
    const input = line.trim();
    if (input && !input.startsWith('#') && !input.startsWith('//')) { // Skip empty lines and comments
      const doi = extractDoi(input);
      if (doi) {
        inputs.push(input);
      } else {
        skipped.push(input);
      }
    }
  }

  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} invalid DOI formats.`);
    skipped.forEach(item => console.log(`  - ${item}`));
  }
  
  console.log(`Found ${inputs.length} valid DOIs in file.`);
  
  // Process each input
  let successCount = 0;
  let failCount = 0;
  let currentIndex = 0;
  
  for (const input of inputs) {
    currentIndex++;
    process.stdout.write(`Processing DOI ${currentIndex}/${inputs.length}... `);
    
    try {
      const success = await generatePublicationFile(input);
      if (success) {
        successCount++;
        process.stdout.write("Success!\n");
      } else {
        failCount++;
        process.stdout.write("Failed.\n");
      }
    } catch (error) {
      failCount++;
      process.stdout.write(`Error: ${error.message}\n`);
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\nResults: ${successCount} successes, ${failCount} failures out of ${inputs.length} DOIs.`);
}

async function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log("Please provide a file path containing DOIs or DOI URLs (one per line).");
    console.log("Example: node bulkImportPublications.js ./dois.txt");
    return;
  }
  
  await importFromFile(filePath);
}

// Run if called directly
if (isMainModule) {
  main();
}