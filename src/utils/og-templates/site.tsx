import { SITE } from "@config";
import { getCollection } from "astro:content";
import satori, { type SatoriOptions } from "satori";

export default async function siteOgImage(): Promise<string> {
  // Get some recent data to make the image more dynamic
  let featuredProjects = [];
  let teamSize = 0;
  let publicationsCount = 0;

  try {
    // Get featured projects
    const projects = await getCollection("projects");
    featuredProjects = projects
      .filter(project => project.data.featured)
      .sort((a, b) => new Date(b.data.startDate).valueOf() - new Date(a.data.startDate).valueOf())
      .slice(0, 3)
      .map(p => p.data.title);
      
    // Count team members
    const team = await getCollection("team");
    teamSize = team.filter(m => m.data.active !== false).length;
    
    // Count publications
    const publications = await getCollection("publications");
    publicationsCount = publications.filter(p => !p.data.draft).length;
  } catch (error) {
    console.error("Error fetching dynamic data for OG image:", error);
  }

  return await satori(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        letterSpacing: "-.02em",
        fontWeight: 700,
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "40px 50px",
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom right, #f0f0f0, #ffffff)",
          letterSpacing: "-.02em",
          border: "12px solid #b31b1b",
          fontWeight: 700,
          borderRadius: "10px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <p
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#b31b1b",
              margin: 0,
            }}
          >
            {SITE.title}
          </p>
          <div style={{ flexGrow: 1 }} />
          <img
            src="https://brand.cornell.edu/assets/images/logos/cornell-reduced-red.svg" 
            width={120}
            height={40}
            alt="Cornell Logo"
          />
        </div>
        
        <div style={{
          flexGrow: 1,
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center",
          marginTop: 20
        }}>
          <p style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#2B3A55",
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 24
          }}>
            Interaction Research Lab
          </p>
           
          <p style={{
            fontSize: 28,
            color: "#444",
            lineHeight: 1.5,
            margin: 0,
          }}>
            Designing interactions with exploratory, frontier methods and extracting insights
            about interaction using cutting-edge computational methods.
          </p>
          {featuredProjects.length > 0 && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 32,
              gap: "8px"
            }}>
              <p style={{
                fontSize: 20,
                color: "#666",
                margin: 0
              }}>
                Featured Research: {featuredProjects.join(" • ")}
              </p>
            </div>
          )}
          <div style={{
            display: "flex",
            flexDirection: "row",
            marginTop: 32,
            gap: "24px"
          }}>
            {teamSize > 0 && (
              <p style={{
                fontSize: 20,
                color: "#666",
                margin: 0
              }}>
                {teamSize} Researchers
              </p>
            )}
            {publicationsCount > 0 && (
              <p style={{
                fontSize: 20,
                color: "#666",
                margin: 0
              }}>
                {publicationsCount} Publications
              </p>
            )}
            <p style={{
              fontSize: 20,
              color: "#666",
              margin: 0
            }}>
              Cornell Tech • New York City
            </p>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    } as SatoriOptions
  );
}
