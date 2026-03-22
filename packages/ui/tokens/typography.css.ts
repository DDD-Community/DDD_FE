import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  font: {
    // Inter — single typeface, hierarchy via weight & scale only
    sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  fontSize: {
    displayLg: "4rem",      // 64px — hero moments
    displayMd: "3rem",      // 48px
    displaySm: "2.5rem",    // 40px
    headlineLg: "2rem",     // 32px — primary section headers
    headlineMd: "1.5rem",   // 24px
    headlineSm: "1.25rem",  // 20px
    titleLg: "1.125rem",    // 18px
    titleMd: "1rem",        // 16px
    bodyLg: "1rem",         // 16px
    bodyMd: "0.875rem",     // 14px
    labelMd: "0.75rem",     // 12px — metadata, kept quiet
    labelSm: "0.6875rem",   // 11px
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.2",
    normal: "1.5",   // body minimum
    relaxed: "1.75",
  },
  letterSpacing: {
    tight: "-0.02em",  // display — magazine headline feel
    normal: "0em",
    wide: "0.05em",
    wider: "0.08em",
  },
});
