import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { 
  generateOgImageForProject, 
  generateOgImageForTeamMember,
  generateOgImageForPost
} from "@utils/generateOgImages";

// This function is required for static builds with dynamic routes
export async function getStaticPaths() {
  const projects = await getCollection("projects");
  const teamMembers = await getCollection("team");
  const blogPosts = await getCollection("blog");
  
  // Generate paths for all our dynamic content
  const paths = [
    // Generate project paths
    ...projects.map(project => ({
      params: { type: "project", slug: project.slug },
      props: { item: project, type: "project" }
    })),
    // Generate team member paths
    ...teamMembers.map(member => ({
      params: { type: "team", slug: member.slug },
      props: { item: member, type: "team" }
    })),
    // Generate blog post paths
    ...blogPosts.map(post => ({
      params: { type: "post", slug: post.slug },
      props: { item: post, type: "post" }
    }))
  ];
  
  return paths;
}

export const GET: APIRoute = async function get({ params, props }) {
  try {
    const { type, slug } = params;
    const { item } = props;
    
    let pngBuffer;
    
    // Generate the appropriate OG image based on content type
    switch (type) {
      case "project":
        pngBuffer = await generateOgImageForProject(item);
        break;
      case "team":
        pngBuffer = await generateOgImageForTeamMember(item);
        break;
      case "post":
        pngBuffer = await generateOgImageForPost(item);
        break;
      default:
        return new Response(`Unsupported content type: ${type}`, { status: 400 });
    }
    
    return new Response(pngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400"
      }
    });
  } catch (error) {
    console.error(`Error generating OG image for ${params.type}/${params.slug}:`, error);
    return new Response(`Error generating OG image: ${error instanceof Error ? error.message : String(error)}`, {
      status: 500
    });
  }
}
