"use client";
import React from "react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-700/30 dark:border-gray-200/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition-colors relative"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        // Sun icon
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-yellow-400"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      ) : (
        // Moon icon
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-gray-500"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="1.5"/></svg>
      )}
    </button>
  );
} 