import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: {
    // Primary
    primary: "#005bb2",
    primaryContainer: "#0073df",
    onPrimary: "#ffffff",
    primaryFixed: "#d6e3ff",

    // Secondary
    secondaryContainer: "#dde6f5",
    onSecondaryContainer: "#001e36",

    // Tertiary (Warning / IT Alert)
    tertiaryContainer: "#bf5500",
    onTertiaryContainer: "#ffffff",

    // Error
    error: "#ba1a1a",
    errorContainer: "#ffdad6",
    onError: "#ffffff",
    onErrorContainer: "#410002",

    // Surface Hierarchy — paper stack, no lines, only tonal shifts
    surface: "#f7f9fb",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f2f4f6",
    surfaceContainer: "#eaecee",
    surfaceContainerHigh: "#e6e8ea",
    surfaceContainerHighest: "#e0e2e4",

    // On-Surface
    onSurface: "#191c1e",
    onSurfaceVariant: "#41474d",

    // Outline — ghost border only when strictly necessary
    outline: "#72787e",
    outlineVariant: "#c4c7c9",
  },
});
