import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0c0a08",
        surface: "#141210",
        surface2: "#1c1916",
        surface3: "#242019",
        border: {
          DEFAULT: "#2a2218",
          strong: "#3d3020",
        },
        text: {
          primary: "#f5f0e8",
          secondary: "#a09070",
          muted: "#5a4f3a",
        },
        accent: {
          DEFAULT: "#f97316",
          hover: "#fb923c",
          strong: "#ea6c0a",
          subtle: "#1f1208",
          text: "#fdba74",
        },
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        node: {
          data: "#0f2027",
          prep: "#1a1f0a",
          model: "#1f1208",
          eval: "#1a0f2a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        base: "14px",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        lg: "8px",
      },
      boxShadow: {
        "accent-glow": "0 0 0 1px rgba(249, 115, 22, 0.25)",
        "accent-glow-lg": "0 0 0 1px rgba(249, 115, 22, 0.25), 0 8px 24px -8px rgba(249, 115, 22, 0.35)",
        card: "0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 32px -16px rgba(0, 0, 0, 0.55)",
        "card-hover": "0 2px 4px rgba(0, 0, 0, 0.45), 0 20px 44px -16px rgba(0, 0, 0, 0.6)",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle, #2a2218 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-grid": "24px 24px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(249,115,22,0.3)" },
          "50%": { boxShadow: "0 0 0 3px rgba(249,115,22,0.5)" },
        },
        gridPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 1.6s ease-in-out infinite",
        "grid-pulse": "gridPulse 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
