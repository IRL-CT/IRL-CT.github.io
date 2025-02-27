import { getCollection } from "astro:content";

/**
 * Retrieves paths for all projects or a specific project
 * @param slug Optional - specific project slug to fetch
 * @returns Object containing project paths or a single project
 */
export async function getProjectsPaths(slug?: string) {
  try {
    const projects = await getCollection("projects");

    if (slug) {
      const project = projects.find(p => p.slug === slug);
      if (!project) throw new Error(`Project with slug "${slug}" not found`);
      return { project };
    }

    return { 
      projects,
      paths: projects.map(project => ({
        params: { id: project.slug },
        props: { project }
      }))
    };
  } catch (error) {
    console.error("Error fetching project paths:", error);
    return { projects: [], paths: [] };
  }
}

export default getProjectsPaths;
