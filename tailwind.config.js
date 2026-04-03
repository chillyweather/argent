/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        argent: {
          bg: "var(--argent-bg)",
          "bg-secondary": "var(--argent-bg-secondary)",
          text: "var(--argent-text)",
          "text-muted": "var(--argent-text-muted)",
          border: "var(--argent-border)",
          accent: "var(--argent-accent)",
          success: "var(--argent-success)",
          error: "var(--argent-error)",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
