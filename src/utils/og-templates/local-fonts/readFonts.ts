import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the directory where this file is located
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function readLocalFonts() {
  try {
    const fontRegular = await fs.readFile(
      path.join(__dirname, 'Inter-Regular.woff2')
    );
    
    const fontBold = await fs.readFile(
      path.join(__dirname, 'Inter-Bold.woff2')
    );
    
    return {
      fontRegular,
      fontBold
    };
  } catch (error) {
    console.error('Error reading local fonts:', error);
    // Fallback to remote fonts if local fonts fail
    return await fetchRemoteFonts();
  }
}

// Fallback function to fetch remote fonts
async function fetchRemoteFonts() {
  const fontRegular = await fetch(
    "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2"
  ).then(res => res.arrayBuffer());
    
  const fontBold = await fetch(
    "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2"
  ).then(res => res.arrayBuffer());
    
  return { fontRegular, fontBold };
}
