import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Market Lane palette
        ml: {
          navy: "#030326",
          "navy-light": "#0B0B2D",
          "navy-mid": "#141438",
          "navy-surface": "#1C1C4A",
          white: "#FFFFFF",
          cream: "#F8F6F3",
          gold: "#C9A96E",
          "gold-light": "#E2CFA5",
          "gold-dark": "#A8853D",
        },
        // RAG risk colors (refined)
        rag: {
          red: "#B91C1C",
          amber: "#B45309",
          green: "#15803D",
        },
        // Confidence colors (refined)
        confidence: {
          high: "#15803D",
          medium: "#B45309",
          low: "#B91C1C",
        },
        // Brand colors (refined, muted)
        brand: {
          barn: "#8B6914",
          goat: "#6B21A8",
          kokomo: "#0F766E",
          squaremile: "#3730A3",
          fairlight: "#1D4ED8",
          backbay: "#475569",
          mlspecialty: "#7E22CE",
          mlx: "#991B1B",
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "display": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "heading-1": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "heading-2": ["1.75rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        "heading-3": ["1.25rem", { lineHeight: "1.3" }],
      },
    },
  },
  plugins: [],
};
export default config;
