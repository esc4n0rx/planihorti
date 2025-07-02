import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#276342",
          foreground: "#F0E3D3",
        },
        secondary: {
          DEFAULT: "#5DB58B",
          foreground: "#4A3525",
        },
        destructive: {
          DEFAULT: "#D8412B",
          foreground: "#F0E3D3",
        },
        muted: {
          DEFAULT: "#F0E3D3",
          foreground: "#4A3525",
        },
        accent: {
          DEFAULT: "#E26A2C",
          foreground: "#F0E3D3",
        },
        popover: {
          DEFAULT: "#F0E3D3",
          foreground: "#4A3525",
        },
        card: {
          DEFAULT: "#F0E3D3",
          foreground: "#4A3525",
        },
        // Cores específicas do Planilhorti
        planilhorti: {
          brown: "#4A3525",
          red: "#D8412B",
          green: "#276342",
          "green-light": "#5DB58B",
          orange: "#E26A2C",
          yellow: "#F9B233",
          cream: "#F0E3D3",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
