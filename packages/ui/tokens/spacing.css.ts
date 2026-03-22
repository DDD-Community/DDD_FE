import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  space: {
    "0": "0",
    "1": "0.25rem",  // 4px
    "2": "0.5rem",   // 8px
    "3": "0.75rem",  // 12px
    "4": "1.4rem",   // ~22px — list item separation
    "5": "1.7rem",   // ~27px — min container internal padding
    "6": "2.25rem",  // 36px — content block gap
    "8": "3rem",     // 48px — section divider
    "10": "4rem",    // 64px
    "12": "4.5rem",  // 72px
    "16": "5.5rem",  // 88px — top-level section breathing room
    "20": "7rem",    // 112px
    "24": "8rem",    // 128px
  },
  radius: {
    sm: "0.25rem",   // 4px
    md: "0.5rem",    // 8px
    lg: "1rem",      // 16px — buttons / cards
    xl: "1.5rem",    // 24px — large containers
    full: "9999px",  // chips / pills
  },
});
