import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: {
    // Primary
    primary: "#005bb2",
    primaryContainer: "#0073df",
    onPrimary: "#ffffff",

    // Secondary (cool violet tint)
    secondaryContainer: "#e8e3f0",
    onSecondaryContainer: "#1d1a2b",

    // Tertiary (warning)
    tertiaryContainer: "#bf5500",
    onTertiaryContainer: "#ffffff",

    // Error
    error: "#ba1a1a",
    errorContainer: "#ffdad6",
    onError: "#ffffff",
    onErrorContainer: "#410002",

    // Surface Hierarchy — violet-tinted paper stack
    surface: "#faf9fe",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f4f3f8",
    surfaceContainer: "#eeedf2",
    surfaceContainerHigh: "#e9e7ed",
    surfaceContainerHighest: "#e3e1e7",
    surfaceBright: "#fdfcff",

    // On-Surface
    onSurface: "#1a1b1f",
    onSurfaceVariant: "#414754",

    // Outline — ghost border only, max 15% opacity
    outline: "#6d7180",
    outlineVariant: "#c1c6d6",
  },
});
