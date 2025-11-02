/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        background: "#0b0b0d",
        foreground: "#f8fafc",
        muted: { DEFAULT: "#101114", foreground: "#a1a1aa" },
        card: { DEFAULT: "#0f1115", foreground: "#e5e7eb" },
        border: "#1c1f26",
        primary: { DEFAULT: "#3b82f6", foreground: "#0b0b0d" }, /* blue electric */
        accent: { DEFAULT: "#1e293b", foreground: "#e2e8f0" }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03)"
      },
      borderRadius: { xl2: "1.25rem" }
    }
  },
  plugins: []
}
