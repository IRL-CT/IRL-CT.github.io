import type socialIcons from "@assets/socialIcons";

export type Site = {
  website: string;
  author: string;
  profile: string;
  desc: string;
  title: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  postPerIndex: number;
  postPerPage: number;
  projectsPerPage?: number; // Added for project pagination
  scheduledPostMargin?: number;
  showArchives?: boolean;
  editPost?: {
    url?: string;
    text?: string;
    appendFilePath?: boolean;
  };
  analytics?: {
    googleAnalyticsId?: string;
  };
};

export type SocialObjects = {
  name: keyof typeof socialIcons;
  href: string;
  active: boolean;
  linkTitle: string;
}[];

// Add specific OG image types for better TypeScript support
export type OgImageOptions = {
  title?: string;
  description?: string;
  imageSrc?: string;
  tags?: string[];
};
