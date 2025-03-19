# IRL: Interaction Research Lab Website

## Content Management Guide

This guide will help you add and update content on the IRL: Interaction Research Lab website.

### Table of Contents

- [Adding Team Members](#adding-team-members)
- [Adding Projects](#adding-projects)
- [Adding Publications](#adding-publications)
- [Adding and Optimizing Images](#adding-and-optimizing-images)

### Adding Team Members

Team members are stored as markdown files in the `src/content/team` directory.

#### Step-by-Step Guide:

1. Create a new markdown file in `src/content/team/` named after the person (e.g., `jane-doe.md`). Use lowercase and replace spaces with hyphens.

2. Add the following frontmatter (information between the `---` lines) at the top of the file:

   ```md
   ---
   name: "Jane Doe"
   role: "PhD Student"
   title: "Research Assistant"
   department: "Information Science"
   joinDate: "2023"
   endDate: ""
   active: true
   avatar: "../../assets/team/jane-doe.jpg"
   education:
     - degree: "PhD in Information Science"
       institution: "Cornell University"
       year: 2025
     - degree: "MS in Computer Science"
       institution: "University of Example"
       year: 2021
   email: "jd123@cornell.edu"
   website: "https://janedoe.com"
   socialLinks:
     github: "https://github.com/janedoe"
     twitter: "https://twitter.com/janedoe"
     linkedin: "https://linkedin.com/in/janedoe"
     googleScholar: "https://scholar.google.com/citations?user=USERID"
   bio: "Jane Doe is a PhD student at Cornell University studying..."
   research_interests:
     - "Human-Computer Interaction"
     - "Artificial Intelligence"
     - "Design Methods"
   ---
   ```

3. **Required Fields Explanation:**
   - `name`: Full name of the team member
   - `role`: Position in the lab (e.g., "PhD Student", "Professor", "Research Assistant")
   - `joinDate`: Year they joined the lab
   - `active`: Set to `true` for current members, `false` for alumni
   - `avatar`: Path to profile picture (see [Adding Images](#adding-and-optimizing-images) section)
   - `email`: Cornell email address
   - `bio`: A brief biography (1-2 paragraphs)

4. **Optional Fields:**
   - `endDate`: If the member has left the lab, add their end year
   - `title`: Official title if different from role
   - `department`: Home department at Cornell
   - `website`: Personal website URL (include `https://`)
   - `socialLinks`: Social media profiles (all optional)
   - `education`: Academic history with degree, institution, and year
   - `research_interests`: List of research topics (used for filtering and search)

5. Save the file. The new team member will appear in the team directory after the site rebuilds.

### Adding Projects

Projects are stored as markdown files in the `src/content/projects` directory.

#### Step-by-Step Guide:

1. Create a new markdown file in `src/content/projects/` with a descriptive name (e.g., `ai-ethics-toolkit.md`). Use lowercase and replace spaces with hyphens.

2. Add the following frontmatter at the top of the file:

   ```md
   ---
   title: "AI Ethics Toolkit for Designers"
   summary: "A toolkit to help designers evaluate ethical implications of AI interfaces"
   featured: true
   startDate: "2023-01"
   endDate: "2024-12"
   tags: 
     - "AI"
     - "Ethics"
     - "Design Tools"
   teamMemberIds: 
     - "jane-doe"
     - "john-smith"
   publicationIds: 
     - "10-1145-3290605-3300690"
   image: "../../assets/projects/ai-ethics-toolkit.jpg"
   fundingSource: 
     - "NSF Grant #12345"
     - "Cornell Research Initiative"
   externalLink: "https://project-website.com"
   ---

   ## Project Description

   Detailed description of the project goes here. You can use Markdown formatting such as:

   - Bullet points
   - **Bold text**
   - *Italics*

   ### Research Questions

   1. How do designers currently evaluate AI ethics?
   2. What tools would help improve ethical considerations in AI design?

   ### Methodology

   Our approach involves interviews with practitioners and iterative design of toolkit components.
   ```

3. **Required Fields Explanation:**
   - `title`: Project name
   - `summary`: Brief 1-2 sentence description
   - `startDate`: When the project began (YYYY-MM format)
   - `teamMemberIds`: List of team member file names (without .md extension)
   - `tags`: Keywords that describe the project (for filtering and search)

4. **Optional Fields:**
   - `featured`: Set to `true` to highlight on the home page
   - `endDate`: When the project ended or is expected to end (YYYY-MM format)
   - `publicationIds`: Related publications (DOIs or filenames)
   - `image`: Path to project image (see [Adding Images](#adding-and-optimizing-images) section)
   - `fundingSource`: List of funding organizations or grant numbers
   - `externalLink`: URL to project website or resource (include `https://`)
   - `description`: A brief overview that appears on listing pages (if different from summary)

5. Add the main content of your project after the frontmatter (after the second `---`). You can use Markdown formatting for headings, lists, links, etc.

6. Save the file. The new project will appear in the projects directory after the site rebuilds.

### Adding Publications

Publications are stored as markdown files in the `src/content/publications` directory and use a DOI-based metadata system.

#### Step-by-Step Guide:

1. Create a new markdown file in `src/content/publications/` using the DOI as the filename (e.g., `10-1145-3290605-3300690.md`). Replace slashes (/) with hyphens (-).

2. Add the following frontmatter at the top of the file:

   ```md
   ---
   doi: "10.1145/3290605.3300690"
   featured: false
   project: "ai-ethics-toolkit"
   manual_override:
     authors:
     publication_date: 
     journal:
     conference:
     abstract:
     citation:
   ---
   ```

3. **Required Fields Explanation:**
   - `doi`: The Digital Object Identifier for the publication (must match filename)

4. **Optional Fields:**
   - `featured`: Set to `true` to highlight on publications page
   - `project`: Related project filename (without .md extension)
   - `manual_override`: Use only if you need to override metadata from CrossRef:
     - `authors`: List of authors if CrossRef data is incorrect
     - `publication_date`: Publication date (YYYY-MM-DD) if CrossRef data is incorrect
     - `journal`: Journal name if CrossRef data is incorrect
     - `conference`: Conference name if CrossRef data is incorrect
     - `abstract`: Paper abstract if CrossRef data is incorrect
     - `citation`: Full citation if you want to override the automatically generated one

5. After adding publication files, run the update script to fetch metadata:
   ```
   npm run update-publications
   ```

6. Save the file. The new publication will appear in the publications directory after the site rebuilds and the publication cache is updated.

### Adding and Optimizing Images

Images should be stored in the appropriate directory under `src/assets/` and optimized for web use.

#### Step-by-Step Guide:

1. **Prepare your image:**
   - Use JPG format for photos and PNG for graphics with transparency
   - Resize images to appropriate dimensions before uploading:
     - Team avatars: 400x400 pixels (square)
     - Project images: 1200x675 pixels (16:9 ratio)
     - Blog post images: 1200x630 pixels (for social sharing)
   - Keep file sizes under 200KB when possible

2. **Optimize the image:**
   - Use a compression tool like [TinyPNG](https://tinypng.com/), [Squoosh](https://squoosh.app/), or [ImageOptim](https://imageoptim.com/) to reduce file size
   - Rename the file using lowercase letters, no spaces (use hyphens instead)

3. **Save to the correct location:**
   - Team member photos: `src/assets/team/`
   - Project images: `src/assets/projects/`
   - Blog post images: `src/assets/blog/`
   - General images: `src/assets/images/`

4. **Reference in content files:**
   - In markdown files, reference images using the relative path from the content file:
     ```md
     avatar: "../../assets/team/jane-doe.jpg"
     ```
     or
     ```md
     image: "../../assets/projects/ai-ethics-toolkit.jpg"
     ```

5. **Image best practices:**
   - Always include descriptive filenames (e.g., `jane-doe-presenting-2023.jpg` instead of `IMG_0123.jpg`)
   - Crop images appropriately to focus on the subject
   - Use consistent style and framing for team photos
   - For project images, choose visuals that clearly represent the project's focus

6. **For team member avatars:**
   - Use professional headshots with neutral backgrounds
   - Crop to square format with the face centered
   - Consistent lighting and style helps maintain a cohesive look

7. **For project images:**
   - Choose images that visually represent the project
   - Include project logo or key visual if available
   - Avoid overly busy images that won't look good when scaled down

8. **Troubleshooting image issues:**
   - If images aren't appearing, check:
     - File path is correct (case-sensitive)
     - File exists in the specified location
     - File extension matches (.jpg vs .png)
     - Image dimensions are appropriate

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
