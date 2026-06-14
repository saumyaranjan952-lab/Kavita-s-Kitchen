"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/Card";

export const WhyChooseUs: React.FC = () => {
  const cards = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ),
      emoji: "🍃",
      title: "Fresh Ingredients",
      description: "Directly sourced from local markets in Puri. Fresh vegetables, rich spices, and zero preservation methods.",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      emoji: "❤️",
      title: "Made With Love",
      description: "Every item is cooked in small batches under home-kitchen settings to preserve maximum warmth and care.",
      color: "bg-red-500/10 text-red-600 dark:text-red-400"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      emoji: "🥗",
      title: "Healthy Choice",
      description: "Low oil, light tempering, and no heavy processing. Healthy home food you can eat daily without issues.",
      color: "bg-teal-500/10 text-teal-600 dark:text-teal-400"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      emoji: "🏠",
      title: "Homemade Taste",
      description: "Authentic Odia recipes prepared by Kavita herself. Relish the genuine taste of homestyle Dalma and thalis.",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    }
  ];

  const containerVariants: import("framer-motion").Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section id="why-us" className="py-20 md:py-28 mandala-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
        
        {/* Title */}
        <div className="max-w-xl mx-auto space-y-4">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-gold">
            Why Choose Us
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-cream">
            Our Core Dining Values
          </h2>
          <div className="h-1 w-20 bg-brand-gold mx-auto rounded-full" />
        </div>

        {/* Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {cards.map((card, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="h-full group">
                <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
                  {/* Styled Icon */}
                  <div className={`p-4 rounded-2xl ${card.color} group-hover:scale-110 transition-transform duration-300 relative`}>
                    <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 text-xl pointer-events-none">
                      {card.emoji}
                    </span>
                    {card.icon}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-brand-green dark:text-brand-cream">
                      {card.title}
                    </h3>
                    <p className="text-sm text-brand-green/75 dark:text-brand-cream/70 leading-relaxed font-semibold">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
export default WhyChooseUs;
