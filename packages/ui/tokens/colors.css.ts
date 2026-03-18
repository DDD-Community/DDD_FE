import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: {
    // Primary
    primary50: "#eef2ff",
    primary100: "#e0e7ff",
    primary500: "#6366f1",
    primary600: "#4f46e5",
    primary700: "#4338ca",

    // Neutral
    neutral0: "#ffffff",
    neutral50: "#f9fafb",
    neutral100: "#f3f4f6",
    neutral200: "#e5e7eb",
    neutral300: "#d1d5db",
    neutral400: "#9ca3af",
    neutral500: "#6b7280",
    neutral600: "#4b5563",
    neutral700: "#374151",
    neutral800: "#1f2937",
    neutral900: "#111827",

    // Semantic
    success: "#22c55e",
    successSubtle: "#dcfce7",
    warning: "#f59e0b",
    warningSubtle: "#fef3c7",
    error: "#ef4444",
    errorSubtle: "#fee2e2",
    info: "#3b82f6",
    infoSubtle: "#dbeafe",
  },
});
