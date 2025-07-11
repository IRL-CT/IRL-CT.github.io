import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    resolve: {
      alias: {
        "@/": new URL("./src/", import.meta.url).pathname,
        "@assets/": new URL("./src/assets/", import.meta.url).pathname,
        "@config": new URL("./src/config.ts", import.meta.url).pathname,
        "@components/": new URL("./src/components/", import.meta.url).pathname,
        "@content/": new URL("./src/content/", import.meta.url).pathname,
        "@icons/": new URL("./src/icons/", import.meta.url).pathname,
        "@layouts/": new URL("./src/layouts/", import.meta.url).pathname,
        "@pages/": new URL("./src/pages/", import.meta.url).pathname,
        "@styles/": new URL("./src/styles/", import.meta.url).pathname,
        "@utils/": new URL("./src/utils/", import.meta.url).pathname,
      },
    },
  },
  scopedStyleStrategy: "where",
  experimental: {
    contentLayer: true,
  },
});
