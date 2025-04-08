import type { APIRoute } from 'astro';
import { extractMetadataFromUrl } from '../../utils/urlMetadataExtractor';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400 }
      );
    }
    
    const metadata = await extractMetadataFromUrl(url);
    
    if (!metadata) {
      return new Response(
        JSON.stringify({ error: 'Failed to extract metadata' }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ data: metadata }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500 }
    );
  }
};
