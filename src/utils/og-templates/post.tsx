import satori from "satori";
import type { CollectionEntry } from "astro:content";
import { SITE } from "@config";

export default async (post: CollectionEntry<"blog">) => {
  return satori(
    <div
      style={{
        background: "#fefbfb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
};
