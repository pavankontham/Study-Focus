import { useState, useEffect } from "react";
import { safeLocalStorage } from "@/lib/local-storage";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => safeLocalStorage.getItem('darkMode', false));

  useEffect(() => {
    safeLocalStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return { darkMode, toggleDarkMode };
}
