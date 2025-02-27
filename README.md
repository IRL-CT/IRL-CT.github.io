## Publication Cache System

The website uses a local cache system for publication metadata to avoid frequent API calls to CrossRef. This ensures the site respects rate limits and loads faster.

### How it works

1. Publication metadata is stored in a local JSON cache file (`public/data/publications-cache.json`)
2. When adding new publications, update the cache by running:
   ```
   npm run update-publications
   ```
3. This script:
   - Scans all publication markdown files in `src/content/publications/`
   - Extracts DOIs and checks which ones need updating
   - Makes API calls to CrossRef to fetch metadata for new/outdated entries
   - Updates the cache file with new information

### Adding New Publications

1. Create a new markdown file in `src/content/publications/` with the DOI:
   ```md
   ---
   doi: "10.1145/3290605.3300690"
   featured: true
   project: "project-slug"
   manual_override:
     publication_date: 2023-05-01
   ---
   ```

2. Run the update script to fetch metadata:
   ```
   npm run update-publications
   ```

3. Build the site to include the new publication data.

The cache is valid for 7 days by default, after which entries will be refreshed on the next run of the update script.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

> **_Note!_** For `Docker` commands we must have it [installed](https://docs.docker.com/engine/install/) in your machine.

| Command                              | Action                                                                                                                           |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                        | Installs dependencies                                                                                                            |
| `pnpm dev`                        | Starts local dev server at `localhost:4321`                                                                                      |
| `pnpm build`                      | Build your production site to `./dist/`                                                                                          |
| `pnpm preview`                    | Preview your build locally, before deploying                                                                                     |
| `pnpm format:check`               | Check code format with Prettier                                                                                                  |
| `pnpm format`                     | Format codes with Prettier                                                                                                       |
| `pnpm sync`                       | Generates TypeScript types for all Astro modules. [Learn more](https://docs.astro.build/en/reference/cli-reference/#astro-sync). |
| `pnpm lint`                       | Lint with ESLint                                                                                                                 |
| `docker compose up -d`               | Run AstroPaper on docker, You can access with the same hostname and port informed on `dev` command.                              |
| `docker compose run app pnpm install` | You can run any command above into the docker container.                                                                         |
| `docker build -t astropaper .`       | Build Docker image for AstroPaper.                                                                                               |
| `docker run -p 4321:80 astropaper`   | Run AstroPaper on Docker. The website will be accessible at `http://localhost:4321`.                                             |

> **_Warning!_** Windows PowerShell users may need to install the [concurrently package](https://www.npmjs.com/package/concurrently) if they want to [run diagnostics](https://docs.astro.build/en/reference/cli-reference/#astro-check) during development (`astro check --watch & astro dev`). For more info, see [this issue](https://github.com/satnaing/astro-paper/issues/113).

## ✨ Feedback & Suggestions

If you have any suggestions/feedback, you can contact me via [my email](mailto:contact@satnaing.dev). Alternatively, feel free to open an issue if you find bugs or want to request new features.

## 📜 License

Licensed under the MIT License, Copyright © 2025

---

Made with 🤍 by [Sat Naing](https://satnaing.dev) 👨🏻‍💻 and [contributors](https://github.com/satnaing/astro-paper/graphs/contributors).
