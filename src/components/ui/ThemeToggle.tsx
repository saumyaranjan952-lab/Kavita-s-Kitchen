"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-gold hover:text-brand-gold-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 cursor-pointer"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-brand-green" />
          ) : (
            <Sun className="w-5 h-5 text-brand-gold" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};
export default ThemeToggle;
