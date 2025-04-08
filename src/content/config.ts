import { SITE } from "@config";
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Blog collection (existing)
const blog = defineCollection({
  type: "content_layer",
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          message: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      editPost: z
        .object({
          disabled: z.boolean().optional(),
          url: z.string().optional(),
          text: z.string().optional(),
          appendFilePath: z.boolean().optional(),
        })
        .optional(),
    }),
});

// Project collection - Remove redundant id field
const projects = defineCollection({
  type: "content_layer",
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      featured: z.boolean().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      tags: z.array(z.string()).default([]),
      teamMemberIds: z.array(z.string()), // References team member IDs (filenames)
      publicationIds: z.array(z.string()).optional(), // References publication IDs (filenames)
      image: image().optional(),
      fundingSource: z.array(z.string()).optional(),
      externalLink: z.string().url().optional(),
      description: z.string().optional(),
    }),
});

// Team member collection - Remove redundant id field
const team = defineCollection({
  type: "content_layer",
  loader: glob({ pattern: "**/*.md", base: "./src/content/team" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      title: z.string().optional(),
      department: z.string().optional(),
      joinDate: z.string(),
      endDate: z.string().optional(),
      active: z.boolean().default(true),
      avatar: image(),
      education: z.array(
        z.object({
          degree: z.string(),
          institution: z.string(),
          year: z.number(),
        })
      ).optional(),
      email: z.string().email(),
      website: z.string().url().optional(),
      socialLinks: z
        .object({
          github: z.string().url().optional(),
          twitter: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          googleScholar: z.string().url().optional(),
        })
        .optional(),
      bio: z.string(),
      research_interests: z.array(z.string()).optional(),
    }),
});

// Simplified publications collection - Remove title field, rely entirely on DOI
const publications = defineCollection({
  type: "content_layer",
  loader: glob({ pattern: "**/*.md", base: "./src/content/publications" }),
  schema: z.object({
    doi: z.string(),
    featured: z.boolean().optional(),
    project: z.string().optional(), // Optional reference to related project (filename)
    manual_override: z.object({
      authors: z.array(z.string()).optional(),
      publication_date: z.date().optional(),
      journal: z.string().optional(),
      conference: z.string().optional(),
      abstract: z.string().optional(),
      citation: z.string().optional(),
    }).optional(),
  }),
});

// Media collection for press coverage
const media = defineCollection({
  type: "content_layer",
  loader: glob({ pattern: "**/*.md", base: "./src/content/media" }),
  schema: z.object({
    title: z.string(),
    source: z.string(), // Publication/outlet name
    pubDate: z.date(),
    url: z.string().url(),
    featured: z.boolean().optional(),
    description: z.string(),
    projectIds: z.array(z.string()).optional(), // References to related projects
    tags: z.array(z.string()).default(["press"]),
  }),
});

// Collaborator collection for partner organizations
const collaborators = defineCollection({
  type: "content_layer",
  loader: glob({ pattern: "**/*.md", base: "./src/content/collaborators" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      website: z.string().url(),
      logo: image(),
      description: z.string().optional(),
      active: z.boolean().default(true),
      startDate: z.string(),
      endDate: z.string().optional(),
      projectIds: z.array(z.string()).optional(), // References to related projects
      contactPerson: z.string().optional(), // Contact person at the collaborating organization
      location: z.string().optional(), // Location/address of collaborator
      type: z.enum(["academic", "industry", "government", "nonprofit", "other"]).optional(),
    }),
});

// Videos collection for YouTube content
const videos = defineCollection({
  type: "content_layer",
  loader: glob({ pattern: "**/*.md", base: "./src/content/videos" }),
  schema: z.object({
    title: z.string(),
    youtubeId: z.string(),
    publishedAt: z.date(),
    description: z.string(),
    thumbnailUrl: z.string().url().optional(),
    duration: z.string().optional(), // Format: "PT1H2M3S" (1 hour, 2 minutes, 3 seconds)
    featured: z.boolean().optional().default(false),
    projectIds: z.array(z.string()).optional(), // References to related projects
    tags: z.array(z.string()).default(["video"]),
  }),
});

export const collections = { blog, projects, team, publications, media, collaborators, videos };
