import { SITE } from "@config";
import { CollectionEntry } from "astro:content";
import { getImage } from "astro:assets";
import satori, { type SatoriOptions } from "satori";
import { readFileSync } from "fs";
import { join } from "path";

// Create a minimal empty buffer for font - null doesn't work
const MINIMAL_FONT_BUFFER = new Uint8Array([0, 0, 0, 0]).buffer;

export default async function projectOgImage(
  project: CollectionEntry<"projects">
): Promise<string> {
  // Format date range
  const startYear = new Date(project.data.startDate).getFullYear();
  const endDateDisplay = project.data.endDate 
    ? new Date(project.data.endDate).getFullYear()
    : 'Present';
  const dateRange = `${startYear} - ${endDateDisplay}`;
  
  // Handle project image
  let projectImageSrc = '';
  if (project.data.image) {
    try {
      projectImageSrc = project.data.image.src;
    } catch (error) {
      console.error("Error processing project image:", error);
    }
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
          border: "12px solid #b31b1b",
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
        
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "row", marginTop: 20 }}>
          {projectImageSrc && (
            <div style={{ 
              width: "40%", 
              height: "auto",
              backgroundImage: `url(${projectImageSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "8px",
              marginRight: "30px"
            }} />
          )}
          
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            width: projectImageSrc ? "60%" : "100%" 
          }}>
            <p style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#2B3A55",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 16
            }}>
              {project.data.title}
            </p>
            
            <p style={{
              fontSize: 28,
              color: "#555",
              margin: 0,
              marginBottom: 24
            }}>
              {dateRange}
            </p>
            
            <p style={{
              fontSize: 22,
              color: "#444",
              lineHeight: 1.4,
              margin: 0
            }}>
              {project.data.summary}
            </p>
            
            {project.data.tags?.length > 0 && (
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "8px",
                marginTop: 20
              }}>
                {project.data.tags.slice(0, 5).map(tag => (
                  <div style={{
                    padding: "6px 10px",
                    background: "#E4E6E9",
                    color: "#2B3A55",
                    borderRadius: "4px",
                    fontSize: 16
                  }}>
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
    } as SatoriOptions
  );
}
