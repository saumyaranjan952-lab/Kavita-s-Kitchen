"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverEffect = true
}) => {
  const cardContent = (
    <div
      className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );

  if (hoverEffect) {
    return (
      <motion.div
        whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
        className="h-full"
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ""
}) => {
  return <div className={`p-5 pb-0 ${className}`}>{children}</div>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ""
}) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ""
}) => {
  return <div className={`p-5 pt-0 border-t border-[var(--card-border)] ${className}`}>{children}</div>;
};
