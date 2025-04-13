/**
 * A simple utility to get a reliable system font for Satori
 */

// We'll use the Noto Sans font from Google Fonts - it's widely compatible
export async function getBasicFont() {
  try {
    const fontData = await fetch(
      "https://api.fontsource.org/v1/fonts/noto-sans/latin-400-normal.ttf"
    ).then((res) => res.arrayBuffer());
    
    return [
      {
        name: "Noto Sans",
        data: fontData,
        weight: 400,
        style: "normal",
      }
    ];
  } catch (error) {
    console.error("Error loading font for OG image:", error);
    throw new Error("Failed to load font for OG image generation");
  }
}
