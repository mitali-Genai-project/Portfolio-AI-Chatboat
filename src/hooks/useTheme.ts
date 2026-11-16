import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

// The initial class is set by the inline script in index.html before first paint.
const readTheme = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage unavailable — theme still applies for this visit */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return { theme, toggle };
}
