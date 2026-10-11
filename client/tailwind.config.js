import typography from "@tailwindcss/typography";

const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: c("paper"),
        card: c("card"),
        line: c("line"),
        ink: c("ink"),
        muted: c("muted"),
        accent: c("accent"),
        "on-accent": c("on-accent"),
        "accent-ink": c("accent-ink"),
        link: c("link"),
        data: c("data"),
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["'IBM Plex Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "rgb(var(--c-ink) / 0.88)",
            "--tw-prose-headings": "rgb(var(--c-ink))",
            "--tw-prose-lead": "rgb(var(--c-muted))",
            "--tw-prose-links": "rgb(var(--c-accent-ink))",
            "--tw-prose-bold": "rgb(var(--c-ink))",
            "--tw-prose-counters": "rgb(var(--c-muted))",
            "--tw-prose-bullets": "rgb(var(--c-muted))",
            "--tw-prose-hr": "rgb(var(--c-line))",
            "--tw-prose-quotes": "rgb(var(--c-ink))",
            "--tw-prose-quote-borders": "rgb(var(--c-line))",
            "--tw-prose-captions": "rgb(var(--c-muted))",
            "--tw-prose-code": "rgb(var(--c-ink))",
            "--tw-prose-pre-code": "#E8EDF6",
            "--tw-prose-pre-bg": "#0B1220",
            "--tw-prose-th-borders": "rgb(var(--c-line))",
            "--tw-prose-td-borders": "rgb(var(--c-line))",
            h2: { fontFamily: "'Bricolage Grotesque', ui-sans-serif, sans-serif", letterSpacing: "-0.01em" },
            h3: { fontFamily: "'Bricolage Grotesque', ui-sans-serif, sans-serif" },
          },
        },
      },
    },
  },
  plugins: [typography],
};