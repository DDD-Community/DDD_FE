import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  shadow: {
    // No shadow — surface tonal layering handles depth
    none: "none",
    // Floating elements: modals, tooltips (24–40px blur, on-surface at 4%)
    floating:
      "0 8px 24px rgba(25, 28, 30, 0.04), 0 16px 40px rgba(25, 28, 30, 0.04)",
    // Subtle hover lift
    hover: "0 4px 12px rgba(25, 28, 30, 0.06)",
  },
  blur: {
    // Glassmorphism backdrop — modals, global search command
    glass: "12px",
  },
  opacity: {
    // surface-container-lowest at 80% for glassmorphism overlays
    glass: "0.8",
    // ghost border — outline-variant when border is strictly required
    ghostBorder: "0.2",
  },
});
