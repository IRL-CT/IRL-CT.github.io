function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["selector", "[data-theme='dark']"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    // Remove the following screen breakpoint or add other breakpoints
    // if one breakpoint is not enough for you
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    extend: {
      textColor: {
        skin: {
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-fill"),
        },
      },
      backgroundColor: {
        skin: {
          fill: withOpacity("--color-fill"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-text-base"),
          card: withOpacity("--color-card"),
          "card-muted": withOpacity("--color-card-muted"),
        },
      },
      outlineColor: {
        skin: {
          fill: withOpacity("--color-accent"),
        },
      },
      borderColor: {
        skin: {
          line: withOpacity("--color-border"),
          fill: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
      },
      fill: {
        skin: {
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
        transparent: "transparent",
      },
      stroke: {
        skin: {
          accent: withOpacity("--color-accent")
        }
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
        // Set sans to use GT Walsheim Pro Thin as default
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        'walsheim-light': ['"GT Walsheim Pro Light"', 'sans-serif'],
        'walsheim-bold': ['"GT Walsheim Pro Bold"', 'sans-serif'],
        'walsheim-black': ['"GT Walsheim Pro Black"', 'sans-serif'],
        'walsheim-medium': ['"GT Walsheim Pro Medium"', 'sans-serif'],
        'walsheim-regular': ['"GT Walsheim Pro Regular"', 'sans-serif'],
        'walsheim-thin': ['"GT Walsheim Pro Thin"', 'sans-serif'],
        // condensed ones 
        'walsheim-condensed-light': ['"GT Walsheim Pro Condensed Light"', 'sans-serif'],
        'walsheim-condensed-bold': ['"GT Walsheim Pro Condensed Bold"', 'sans-serif'],
        'walsheim-condensed-black': ['"GT Walsheim Pro Condensed Black"', 'sans-serif'],
        'walsheim-condensed-medium': ['"GT Walsheim Pro Condensed Medium"', 'sans-serif'],
        'walsheim-condensed-regular': ['"GT Walsheim Pro Condensed Regular"', 'sans-serif'],
        'walsheim-condensed-thin': ['"GT Walsheim Pro Condensed Thin"', 'sans-serif'],
        // gtsuperdisplay bold, bolditalic, light, lightitalic, medium, mediumitalic, regular, regularitalic, superitalic 
        'gtsuperdisplay-bold': ['"GT Super Display Bold"', 'sans-serif'],
        'gtsuperdisplay-bolditalic': ['"GT Super Display Bold Italic"', 'sans-serif'],
        'gtsuperdisplay-light': ['"GT Super Display Light"', 'sans-serif'],
        'gtsuperdisplay-lightitalic': ['"GT Super Display Light Italic"', 'sans-serif'],
        'gtsuperdisplay-medium': ['"GT Super Display Medium"', 'sans-serif'],
        'gtsuperdisplay-mediumitalic': ['"GT Super Display Medium Italic"', 'sans-serif'],
        'gtsuperdisplay-regular': ['"GT Super Display Regular"', 'sans-serif'],
        'gtsuperdisplay-regularitalic': ['"GT Super Display Regular Italic"', 'sans-serif'],
        'gtsuperdisplay-superitalic': ['"GT Super Display Super Italic"', 'sans-serif'],
        // gt-america-bold, light-italic, light, medium, regular-italic, regular 
        'gt-america-bold': ['"GT America Bold"', 'sans-serif'],
        'gt-america-light-italic': ['"GT America Light Italic"', 'sans-serif'],
        'gt-america-light': ['"GT America Light"', 'sans-serif'],
        'gt-america-medium': ['"GT America Medium"', 'sans-serif'],
        'gt-america-regular-italic': ['"GT America Regular Italic"', 'sans-serif'],
        'gt-america-regular': ['"GT America Regular"', 'sans-serif'],
        
        

      },

      typography: {
        DEFAULT: {
          css: {
            pre: {
              color: false,
            },
            code: {
              color: false,
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
