import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  shadow: {
    none: "none",
    // Floating elements — large blur, low opacity, tinted (not pure black)
    sm: "0 4px 16px rgba(26, 27, 31, 0.04)",
    md: "0 8px 32px rgba(26, 27, 31, 0.06)",
    lg: "0 16px 64px rgba(26, 27, 31, 0.08)",
  },
  blur: {
    // Glassmorphism — 20–40px range
    sm: "20px",
    md: "32px",
    lg: "40px",
  },
  opacity: {
    // Floating elements: surface_container_lowest at 80%
    glass: "0.8",
    // Nav / modal overlays: surface_bright at 70%
    overlay: "0.7",
    // Ghost border fallback — outline_variant at 15%
    ghostBorder: "0.15",
  },
});
