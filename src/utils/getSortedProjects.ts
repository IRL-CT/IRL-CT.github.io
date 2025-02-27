import type { CollectionEntry } from "astro:content";

/**
 * Sorts project entries by their start date (newest first)
 * and optionally filters out draft projects.
 * @param {CollectionEntry<"projects">[]} projects - Array of project collection entries
 * @returns {CollectionEntry<"projects">[]} - Sorted array of project collection entries
 */
export default function getSortedProjects(projects: CollectionEntry<"projects">[]) {
  return projects
    .filter(({ data }) => !data.draft)
    .sort(
      (a, b) =>
        new Date(b.data.startDate).valueOf() -
        new Date(a.data.startDate).valueOf()
    );
}