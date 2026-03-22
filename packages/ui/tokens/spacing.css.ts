import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  space: {
    "0": "0",
    "1": "0.25rem",  // 4px
    "2": "0.5rem",   // 8px
    "3": "0.75rem",  // 12px
    "4": "0.9rem",   // ~14px — item separation (invisible gutter)
    "5": "1.1rem",   // ~18px — dense section gap
    "6": "1.5rem",   // 24px
    "8": "2rem",     // 32px
    "10": "2.5rem",  // 40px — min interactive target
    "12": "3rem",    // 48px
    "16": "3.5rem",  // 56px — major section breathing room
    "20": "5rem",    // 80px
    "24": "6rem",    // 96px
  },
  radius: {
    sm: "0.25rem",   // 4px
    md: "0.375rem",  // 6px
    lg: "0.5rem",    // 8px — buttons / cards
    xl: "0.75rem",   // 12px
    full: "9999px",  // chips / pills
  },
});
