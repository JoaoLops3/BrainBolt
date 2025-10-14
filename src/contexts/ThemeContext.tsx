import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  actualTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("brainbolt-theme");
    return (saved as Theme) || "auto";
  });

  const [actualTheme, setActualTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = window.document.documentElement;

    // Determinar tema real baseado na preferência
    const getActualTheme = (): "light" | "dark" => {
      if (theme === "auto") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return theme;
    };

    const newActualTheme = getActualTheme();
    setActualTheme(newActualTheme);

    // Aplicar tema
    root.classList.remove("light", "dark");
    root.classList.add(newActualTheme);
    root.setAttribute("data-theme", newActualTheme);

    // Salvar preferência
    localStorage.setItem("brainbolt-theme", theme);
  }, [theme]);

  // Ouvir mudanças na preferência do sistema
  useEffect(() => {
    if (theme !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newTheme = mediaQuery.matches ? "dark" : "light";
      setActualTheme(newTheme);
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      root.setAttribute("data-theme", newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) => {
      if (current === "light") return "dark";
      if (current === "dark") return "auto";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, actualTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
