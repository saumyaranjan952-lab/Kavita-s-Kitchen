"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const About: React.FC = () => {
  const storyPoints = [
    "Traditional family recipes passed down through generations.",
    "Made with 100% pure mustard oil, cold-pressed ghee, and fresh ground spices.",
    "Strict hygiene protocols, zero MSG, and no artificial coloring.",
    "Specifically prepared for students, professionals, and visitors in Puri."
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-[var(--card-bg)] border-y border-[var(--card-border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Image Column with traditional overlay */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Elegant Background Frame */}
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-brand-gold rounded-2xl pointer-events-none hidden sm:block" />
            
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 max-h-[400px]">
              <img
                src="/images/dalma_special.jpg"
                alt="Cooking authentic Odia food in Puri"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
              {/* Subtle dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
            
            {/* Absolute badge */}
            <div className="absolute bottom-6 left-6 bg-brand-green text-brand-cream border border-brand-gold/30 px-5 py-3.5 rounded-xl shadow-lg flex flex-col">
              <span className="font-serif text-2xl font-black text-brand-gold">5+</span>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">Years of Homestyle Legacy</span>
            </div>
          </motion.div>

          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8 text-left"
          >
            <div className="space-y-3">
              <span className="text-sm font-bold uppercase tracking-wider text-brand-gold block">
                Our Story
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-cream leading-tight">
                Authentic Taste of Odisha, Crafted with Love
              </h2>
            </div>

            <p className="text-base sm:text-lg text-brand-green/80 dark:text-brand-cream/70 leading-relaxed">
              Kavita&apos;s Kitchen brings the authentic flavors of Odisha directly to your doorstep. Every meal is prepared with fresh ingredients, traditional recipes, and the warmth of home cooking. We focus on healthy, hygienic, and affordable meals for students, professionals, families, and tourists visiting Puri.
            </p>

            <ul className="space-y-3.5">
              {storyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-brand-green/85 dark:text-brand-cream/80 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default About;
