import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";

import { darkColors, lightColors, type AppColors } from "./tokens";

type ThemeMode = "dark" | "light";

type ThemeContextValue = {
  colors: AppColors;
  mode: ThemeMode;
  navigationTheme: Theme;
  toggleTheme: () => void;
};

const STORAGE_KEY = "@schedra/theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(Appearance.getColorScheme() === "light" ? "light" : "dark");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((storedMode) => {
      if (storedMode === "dark" || storedMode === "light") {
        setMode(storedMode);
      }
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = mode === "dark" ? darkColors : lightColors;
    const baseTheme = mode === "dark" ? DarkTheme : DefaultTheme;

    return {
      colors,
      mode,
      navigationTheme: {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      },
      toggleTheme: () => {
        setMode((currentMode) => {
          const nextMode = currentMode === "dark" ? "light" : "dark";
          void AsyncStorage.setItem(STORAGE_KEY, nextMode);
          return nextMode;
        });
      },
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }

  return context;
}
