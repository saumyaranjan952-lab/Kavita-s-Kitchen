"use client";

import React, { useState, useEffect } from "react";
import { REVIEWS } from "@/data/menuData";
import { Card, CardContent } from "./ui/Card";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  return (
    <section id="reviews" className="py-20 md:py-28 bg-[var(--card-bg)] border-y border-[var(--card-border)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12 relative">
        
        {/* Title */}
        <div className="space-y-4">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-gold">
            Customer Reviews
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-cream">
            What Our Food Lovers Say
          </h2>
          <div className="h-1 w-20 bg-brand-gold mx-auto rounded-full" />
        </div>

        {/* Testimonial Box */}
        <div className="relative min-h-[300px] flex items-center justify-center">
          <Quote className="absolute top-0 left-4 sm:left-12 w-20 h-20 text-brand-gold/10 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Card hoverEffect={false} className="border-0 shadow-none bg-transparent">
                <CardContent className="space-y-6 max-w-2xl mx-auto">
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(REVIEWS[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-lg sm:text-xl font-medium italic text-brand-green/80 dark:text-brand-cream/80 leading-relaxed font-serif">
                    &ldquo;{REVIEWS[currentIndex].text}&rdquo;
                  </p>

                  {/* Customer Info */}
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-brand-green dark:text-brand-cream">
                      {REVIEWS[currentIndex].name}
                    </h4>
                    <p className="text-xs text-brand-gold font-bold uppercase tracking-widest">
                      {REVIEWS[currentIndex].location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Manual Controls */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream hover:text-brand-gold transition-colors cursor-pointer focus:outline-none"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Indicators */}
          <div className="flex gap-2">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                  currentIndex === i ? "bg-brand-gold w-6" : "bg-[var(--card-border)]"
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream hover:text-brand-gold transition-colors cursor-pointer focus:outline-none"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
export default Testimonials;
