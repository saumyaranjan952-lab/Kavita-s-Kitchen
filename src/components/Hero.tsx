"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";
import { ShoppingBag, ChevronRight, CheckCircle2, ChevronLeft } from "lucide-react";

type BusinessConfig = {
  phone: string;
  whatsApp: string;
  instagram: string;
  address: string;
  operatingHours: string;
  heroTitle: string;
  heroSubtitle: string;
};

interface HeroProps {
  config: BusinessConfig;
  onMenuOpen?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ config, onMenuOpen }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const showcaseImages = [
    { src: "/images/hero_feast.jpg", alt: "Authentic Multi-Item Odia Feast", label: "Special Odia Feast" },
    { src: "/images/dalma_special.jpg", alt: "Steaming Hot Authentic Dalma", label: "Odia Dalma" },
    { src: "/images/odia_thali.jpg", alt: "Traditional Odia Veg Thali", label: "Ghara Veg Thali" },
    { src: "/images/odia_snacks.jpg", alt: "Puri Famous Bara Ghuguni", label: "Crispy Bara Ghuguni" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [showcaseImages.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + showcaseImages.length) % showcaseImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % showcaseImages.length);
  };

  const handleScrollToMenu = () => {
    if (onMenuOpen) {
      onMenuOpen();
    } else {
      const menuSection = document.querySelector("#menu");
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleWhatsAppOrder = () => {
    const defaultMsg = encodeURIComponent("Hello Kavita's Kitchen, I would like to place an order.");
    window.open(`https://wa.me/${config.whatsApp}?text=${defaultMsg}`, "_blank");
  };

  const features = [
    "Same Day Delivery",
    "Freshly Cooked Daily",
    "Healthy Home-style Meals"
  ];

  // Helper to format title and preserve locked design highlighted text
  const formatTitle = (title: string) => {
    const target = "Homemade Food";
    if (title.includes(target)) {
      const parts = title.split(target);
      return (
        <>
          {parts[0]}
          <span className="text-brand-gold block lg:inline">{target}</span>
          {parts[1]}
        </>
      );
    }
    return title;
  };

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-12 md:py-24 overflow-hidden mandala-bg"
    >
      {/* Traditional design background accents */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-brand-gold/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-brand-green/5 rounded-full filter blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 text-brand-gold font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              Serving Clean, Homemade Happiness in Puri
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-green dark:text-brand-cream leading-tight sm:leading-none"
            >
              {formatTitle(config.heroTitle)}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl font-medium text-brand-green/75 dark:text-brand-cream/70 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {config.heroSubtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button
                variant="gold"
                size="lg"
                shimmer
                onClick={handleWhatsAppOrder}
                className="w-full sm:w-auto shadow-lg"
              >
                Order on WhatsApp
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleScrollToMenu}
                className="w-full sm:w-auto hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                View Menu
              </Button>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--card-border)]/60 max-w-lg mx-auto lg:mx-0"
            >
              {features.map((feature, i) => (
                <div key={i} className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0" />
                  <span className="text-sm font-semibold text-brand-green/85 dark:text-brand-cream/80">
                    {feature}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center items-center px-4 sm:px-0"
          >
            {/* Visual Ring */}
            <div className="absolute inset-0 border-2 border-brand-gold/15 rounded-full scale-95 animate-[spin_40s_linear_infinite] pointer-events-none hidden sm:block" />
            
            {/* Left navigation arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-1 sm:-left-6 z-20 p-2 rounded-full border border-brand-gold bg-[var(--card-bg)] text-brand-gold hover:bg-brand-gold hover:text-brand-green-dark shadow-lg cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold hover:scale-110 active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5px]" />
            </button>

            {/* Floating Showcase Wrapper */}
            <div className="relative animate-float flex justify-center items-center">
              {/* Rounded Hero Showcase Image */}
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] rounded-full overflow-hidden border-8 border-brand-gold shadow-2xl flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={showcaseImages[currentIndex].src}
                    alt={showcaseImages[currentIndex].alt}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.45 }}
                    className="w-full h-full object-cover object-center absolute inset-0"
                  />
                </AnimatePresence>
                
                {/* Vignette Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Dynamic Food Label Badge */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-brand-gold/30 text-brand-gold font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-md select-none pointer-events-none">
                  {showcaseImages[currentIndex].label}
                </div>
              </div>

              {/* Brand Logo Quality Seal Overlay */}
              <motion.div
                className="absolute bottom-2 right-4 sm:-bottom-4 sm:right-6 md:right-8 flex flex-col items-center z-20 cursor-pointer"
                whileHover={{ scale: 1.08, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {/* Gold outer border ring with soft glassmorphism shadow */}
                <div className="relative p-1 rounded-full bg-gradient-to-br from-brand-gold via-brand-gold/50 to-brand-green/30 backdrop-blur-md shadow-[0_10px_25px_rgba(15,61,46,0.25)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-white/20">
                  {/* Secondary green inner ring */}
                  <div className="p-0.5 rounded-full bg-brand-green/10 dark:bg-brand-cream/10">
                    {/* The circular Logo */}
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-brand-gold bg-brand-cream flex items-center justify-center">
                      <img
                        src="/images/logo.jpg"
                        alt="Kavita's Kitchen Seal of Authenticity"
                        className="w-full h-full object-cover scale-102"
                      />
                    </div>
                  </div>

                  {/* Star / Premium Badge Icon Accents */}
                  <div className="absolute -top-1 -right-1 bg-brand-gold text-brand-green-dark text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-brand-cream dark:border-brand-green shadow-sm">
                    ★
                  </div>
                </div>

                {/* Luxury Badge Text Beneath the Seal */}
                <div className="mt-2.5 bg-brand-green/95 dark:bg-brand-green-dark/95 backdrop-blur-sm border border-brand-gold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 transform hover:scale-105 transition-transform duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
                  <span className="text-brand-gold text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap">
                    Authentic Taste of Odisha
                  </span>
                </div>
              </motion.div>
            </div>
            
            {/* Right navigation arrow */}
            <button
              onClick={handleNext}
              className="absolute right-1 sm:-right-6 z-20 p-2 rounded-full border border-brand-gold bg-[var(--card-bg)] text-brand-gold hover:bg-brand-gold hover:text-brand-green-dark shadow-lg cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold hover:scale-110 active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5px]" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
