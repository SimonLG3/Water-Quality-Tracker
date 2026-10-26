/**
 * Shared colours, fonts and layout constants for the app.
 */

import "@/global.css";

import { Platform } from "react-native";

export const SectionColors = {
  chemistry: "#3563A9",
  nitrogen: "#299D75",
  salinity: "#19A7C6",
  temperature: "#E59B38",
  settings: "#8B78C6",
} as const;

export const Colors = {
  light: {
    text: "#293241",
    background: "#BDC3C7",
    backgroundElement: "#D5D9DC",
    backgroundSelected: "#AAB2B9",
    textSecondary: "#505B66",
  },
  dark: {
    text: "#F4F7FB",
    background: "#293241",
    backgroundElement: "#344052",
    backgroundSelected: "#40516A",
    textSecondary: "#C0CAD8",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

export const MaxContentWidth = 800;
