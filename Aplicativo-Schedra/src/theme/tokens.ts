export const darkColors = {
  background: "#121115",
  surface: "#1B191E",
  surfaceRaised: "#242128",
  border: "#343039",
  text: "#F8F6F8",
  textMuted: "#AAA4AF",
  accent: "#DF5784",
  accentStrong: "#B8265C",
  accentSoft: "#3D202D",
  lime: "#CDFB45",
  amber: "#F8B84E",
  coral: "#FF6F5A",
  teal: "#42AAA5",
  success: "#55C98C",
  danger: "#F06A73",
  overlay: "rgba(12, 10, 14, 0.72)",
} as const;

export const lightColors = {
  background: "#F4F1F4",
  surface: "#FFFFFF",
  surfaceRaised: "#F8F5F7",
  border: "#DDD7DE",
  text: "#201C22",
  textMuted: "#706A73",
  accent: "#C72F67",
  accentStrong: "#9D204D",
  accentSoft: "#F6DDE7",
  lime: "#9CC61C",
  amber: "#D38A12",
  coral: "#E95542",
  teal: "#238E88",
  success: "#218A5B",
  danger: "#C8424D",
  overlay: "rgba(32, 28, 34, 0.42)",
} as const;

export type AppColors = { [Key in keyof typeof darkColors]: string };

export const fonts = {
  body: "Roboto_400Regular",
  bodyMedium: "Roboto_500Medium",
  bodyBold: "Roboto_700Bold",
  display: "Oswald_600SemiBold",
  displayBold: "Oswald_700Bold",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
} as const;
