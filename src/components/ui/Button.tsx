"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "gold" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  shimmer?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  shimmer = false,
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold rounded-full overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold cursor-pointer";
  
  const variants = {
    primary: "bg-brand-green text-brand-cream hover:bg-brand-green-light border border-transparent shadow-md focus:ring-brand-green",
    gold: "bg-brand-gold text-brand-green-dark hover:bg-brand-gold-light border border-transparent shadow-md focus:ring-brand-gold",
    secondary: "bg-brand-cream text-brand-green hover:bg-brand-cream-dark border border-brand-cream-dark",
    outline: "bg-transparent text-brand-green border-2 border-brand-green hover:bg-brand-green hover:text-brand-cream dark:text-brand-cream dark:border-brand-cream dark:hover:bg-brand-cream dark:hover:text-brand-green-dark",
    ghost: "bg-transparent text-brand-green hover:bg-brand-cream dark:text-brand-cream dark:hover:bg-brand-green-light"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {shimmer && (
        <span className="absolute inset-0 w-full h-full shimmer-effect animate-shimmer pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
export default Button;
