import { SITE } from "@config";
import { CollectionEntry } from "astro:content";
import satori, { type SatoriOptions } from "satori";

const fetchFonts = async () => {
  const fontRegular = await fetch(
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
  ).then(res => res.arrayBuffer());
  const fontBold = await fetch(
    "https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap"
  ).then(res => res.arrayBuffer());
  return { fontRegular, fontBold };
};

export default async function teamMemberOgImage(
  member: CollectionEntry<"team">
): Promise<string> {
  // Handle avatar image
  let avatarSrc = '';
  if (member.data.avatar) {
    try {
      avatarSrc = member.data.avatar.src;
    } catch (error) {
      console.error("Error processing avatar image:", error);
    }
  }

  // Format research interests if they exist
  const interests = member.data.research_interests || [];
  
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
        
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "row", marginTop: 20, alignItems: "center" }}>
          {avatarSrc && (
            <div style={{
              width: 240,
              height: 240,
              marginRight: 40,
              borderRadius: "50%",
              backgroundImage: `url(${avatarSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "4px solid #f0f0f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }} />
          )}
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#2B3A55",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 12
            }}>
              {member.data.name}
            </p>
            
            <p style={{
              fontSize: 32,
              color: "#444",
              margin: 0,
              marginBottom: 20
            }}>
              {member.data.role}
              {member.data.title && ` • ${member.data.title}`}
            </p>
            
            {interests.length > 0 && (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "8px",
                marginTop: 10
              }}>
                <p style={{
                  fontSize: 22,
                  color: "#666",
                  margin: 0,
                  marginBottom: 4
                }}>
                  Research Interests:
                </p>
                
                <div style={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: "8px"
                }}>
                  {interests.slice(0, 5).map(interest => (
                    <div style={{
                      padding: "6px 12px",
                      background: "#E4E6E9",
                      color: "#2B3A55",
                      borderRadius: "4px",
                      fontSize: 17
                    }}>
                      {interest}
                    </div>
                  ))}
                </div>
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
          name: "sans-serif",
          data: null,
          weight: 400,
          style: "normal",
        },
      ],
    } as SatoriOptions
  );
}
