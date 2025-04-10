import type { APIRoute } from "astro";
import { generateOgImageForHome } from "@utils/generateOgImages";

export const GET: APIRoute = async function get({ params, request }) {
  try {
    const pngBuffer = await generateOgImageForHome();
    
    return new Response(pngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400"
      }
    });
  } catch (error) {
    console.error("Error generating home OG image:", error);
    return new Response(`Error generating home OG image: ${error instanceof Error ? error.message : String(error)}`, {
      status: 500
    });
  }
}
