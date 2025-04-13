import satori from "satori";
import type { CollectionEntry } from "astro:content";
import { SITE } from "@config";

// Create a minimal empty buffer for font - null doesn't work
const MINIMAL_FONT_BUFFER = new Uint8Array([0, 0, 0, 0]).buffer;

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
      <div
        style={{
          position: "absolute",
          top: "-1px",
          right: "-1px",
          border: "4px solid #000",
          background: "#ecebeb",
          opacity: "0.9",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2.5rem",
          width: "88%",
          height: "80%",
        }}
      />

      <div
        style={{
          border: "4px solid #000",
          background: "#fefbfb",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
        }}
      >
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "system-ui",
          data: MINIMAL_FONT_BUFFER,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
};
