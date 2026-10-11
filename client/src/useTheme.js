import { useState } from "react";

export function useTheme() {
  // The inline script in index.html already set the class before first paint
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage blocked: the choice just won't persist
    }
    setDark(next);
  };

  return { dark, toggle };
}