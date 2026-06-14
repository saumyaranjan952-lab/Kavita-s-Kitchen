"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "./ui/Button";

export const InstagramFeed: React.FC = () => {
  const feedImages = [
    {
      url: "/images/dalma_special.jpg",
      likes: "142",
      comments: "24"
    },
    {
      url: "/images/odia_thali.jpg",
      likes: "210",
      comments: "38"
    },
    {
      url: "/images/odia_snacks.jpg",
      likes: "185",
      comments: "19"
    },
    {
      url: "/images/hero_feast.jpg",
      likes: "324",
      comments: "47"
    }
  ];

  const handleFollow = () => {
    window.open("https://instagram.com/kavita.kitchen_", "_blank");
  };

  return (
    <section className="py-20 md:py-28 mandala-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        
        {/* Title */}
        <div className="space-y-4 max-w-xl mx-auto">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-gold">
            Follow Our Journey
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-cream">
            Moments From Our Kitchen
          </h2>
          <p className="text-sm text-brand-green/75 dark:text-brand-cream/70 font-semibold">
            Follow us on Instagram <a href="https://instagram.com/kavita.kitchen_" target="_blank" rel="noopener" className="text-brand-gold hover:underline">@kavita.kitchen_</a> for daily specials, behind-the-scenes cooking, and quick updates.
          </p>
        </div>

        {/* Grid Feed */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {feedImages.map((img, i) => (
            <motion.a
              href="https://instagram.com/kavita.kitchen_"
              target="_blank"
              rel="noopener noreferrer"
              key={i}
              whileHover={{ y: -4 }}
              className="relative aspect-square rounded-2xl overflow-hidden group shadow-md block border border-[var(--card-border)]"
            >
              <img
                src={img.url}
                alt="Instagram food layout post"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Instagram Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white">
                <div className="flex items-center gap-1.5 font-bold">
                  <Heart className="w-5 h-5 fill-white" />
                  <span>{img.likes}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>{img.comments}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button variant="outline" size="md" onClick={handleFollow} className="hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 mr-2"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Follow Us on Instagram
          </Button>
        </div>
      </div>
    </section>
  );
};
export default InstagramFeed;
