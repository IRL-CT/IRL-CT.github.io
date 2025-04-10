import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";
import projectOgImage from "./og-templates/project";
import teamMemberOgImage from "./og-templates/team";

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await postOgImage(post);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForProject(project: CollectionEntry<"projects">) {
  const svg = await projectOgImage(project);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForTeamMember(member: CollectionEntry<"team">) {
  const svg = await teamMemberOgImage(member);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForHome() {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}
