import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  font: {
    // Manrope — editorial authority for display & headlines
    display: "'Manrope', sans-serif",
    headline: "'Manrope', sans-serif",
    // Inter — functional precision for body text
    title: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    label: "'Inter', sans-serif",
  },
  fontSize: {
    displayLg: "3.5rem",    // 56px — large data milestones
    headlineSm: "1.5rem",   // 24px — section titles / dashboard headers
    titleMd: "1.125rem",    // 18px — card headings / list headers
    bodyMd: "0.875rem",     // 14px — standard data / descriptions
    labelSm: "0.6875rem",   // 11px — metadata / caps-lock tags
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.2",
    normal: "1.5",
    relaxed: "1.75",
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.05em",
    wider: "0.08em",
  },
});
