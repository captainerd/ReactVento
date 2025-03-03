import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ className }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className={className + " flex text-gray-500 dark:text-gray-400 items-center justify-center gap-2 rounded-md p-2  hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}

    </button>
  );
};

export default ThemeToggle;
