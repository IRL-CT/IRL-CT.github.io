import { getCollection } from "astro:content";
import { 
  generateOgImageForPost, 
  generateOgImageForProject, 
  generateOgImageForTeamMember,
  generateOgImageForSite 
} from "@utils/generateOgImages";

export async function GET({ params }) {
  const { type, slug } = params;
  
  let buffer;
  
  try {
    if (type === 'site') {
      buffer = await generateOgImageForSite();
    } 
    else if (type === 'blog') {
      const posts = await getCollection('blog');
      const post = posts.find(post => post.slug === slug);
      if (!post) throw new Error(`Blog post not found: ${slug}`);
      buffer = await generateOgImageForPost(post);
    } 
    else if (type === 'project') {
      const projects = await getCollection('projects');
      const project = projects.find(project => project.slug === slug);
      if (!project) throw new Error(`Project not found: ${slug}`);
      buffer = await generateOgImageForProject(project);
    } 
    else if (type === 'team') {
      const members = await getCollection('team');
      const member = members.find(member => member.slug === slug);
      if (!member) throw new Error(`Team member not found: ${slug}`);
      buffer = await generateOgImageForTeamMember(member);
    } 
    else {
      throw new Error(`Unsupported OG image type: ${type}`);
    }
    
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable"
      },
    });
  } catch (error) {
    console.error(`Error generating OG image: ${error.message}`);
    return new Response(`Error generating OG image: ${error.message}`, {
      status: 500,
    });
  }
}
