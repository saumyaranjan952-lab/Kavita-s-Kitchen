"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Search, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

type Category = {
  id: string;
  name: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  image: string;
  isVeg: boolean;
  isPopular: boolean;
  isChefSpecial: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  availability: string;
  categoryId: string;
};

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  categories: Category[];
}

const UI_CATEGORIES = [
  { id: "odia-specials", name: "Odia Specials" },
  { id: "chicken-thali", name: "Chicken Thali" },
  { id: "veg-thali", name: "Veg Thali" },
  { id: "dalma", name: "Dalma" },
  { id: "pakhala", name: "Pakhala" },
  { id: "snacks", name: "Snacks" },
  { id: "beverages", name: "Beverages" }
];

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  isOpen,
  onClose,
  menuItems
}) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState("odia-specials");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Helper to map dynamic database items to the 7 required categories
  const getOverlayCategory = (item: MenuItem): string => {
    if (item.id === "dalma") return "dalma";
    if (item.id === "pakhala") return "pakhala";
    if (item.id === "veg-thali") return "veg-thali";
    if (item.id === "chicken-thali") return "chicken-thali";
    if (item.id === "special-odia-thali") return "veg-thali";
    if (item.categoryId === "snacks") return "snacks";
    if (item.categoryId === "beverages") return "beverages";
    if (item.categoryId === "odia-specials") return "odia-specials";

    const nameLower = item.name.toLowerCase();
    if (nameLower.includes("dalma")) return "dalma";
    if (nameLower.includes("pakhala")) return "pakhala";
    if (nameLower.includes("chicken thali")) return "chicken-thali";
    if (nameLower.includes("veg thali") || nameLower.includes("ghara thali")) return "veg-thali";
    if (item.categoryId === "thalis") return "veg-thali";

    return "odia-specials";
  };

  // Filter items based on selected overlay tab, search, and veg-only filter
  const filteredItems = menuItems.filter((item) => {
    const itemCat = getOverlayCategory(item);
    const matchesCategory = itemCat === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = vegOnly ? item.isVeg : true;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  const getAvailabilityBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "AVAILABLE":
        return (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-1 rounded-full border border-emerald-500/20 shadow-sm flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case "OUT_OF_STOCK":
        return (
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 px-2 py-1 rounded-full border border-red-500/20 shadow-sm flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Out of Stock
          </span>
        );
      case "SEASONAL":
        return (
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/20 shadow-sm flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Seasonal
          </span>
        );
      case "COMING_SOON":
        return (
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/20 shadow-sm flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Coming Soon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/45 backdrop-blur-md overflow-hidden"
    >
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0, y: 55, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 35, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative w-full max-w-6xl h-full max-h-[85vh] md:max-h-[90vh] bg-white/75 dark:bg-brand-green-dark/75 border border-white/20 dark:border-brand-green/30 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-60" />

        {/* Top Header Panel */}
        <div className="p-6 md:p-8 pb-4 flex items-center justify-between border-b border-white/20 dark:border-brand-green/20">
          <div>
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-brand-gold">
              Explore Our Authentic Delicacies
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-brand-green dark:text-brand-cream mt-0.5">
              Kavita&apos;s Premium Menu
            </h2>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/15 text-brand-green dark:text-brand-cream hover:text-brand-gold border border-white/10 transition-all duration-300 cursor-pointer shadow-sm hover:scale-105"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls (Sticky beneath header) */}
        <div className="px-6 md:px-8 py-4 bg-white/20 dark:bg-black/10 backdrop-blur-sm border-b border-white/10 dark:border-brand-green/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-green/50 dark:text-brand-cream/50" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-white/30 dark:border-brand-green/30 bg-white/40 dark:bg-black/20 text-brand-green dark:text-brand-cream text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all duration-300 font-semibold shadow-inner placeholder-brand-green/40 dark:placeholder-brand-cream/40"
            />
          </div>

          {/* Veg Switch button */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 dark:border-brand-green/20 bg-white/40 dark:bg-black/20 text-xs font-bold transition-all duration-300 cursor-pointer hover:border-brand-gold select-none focus:outline-none w-max shrink-0"
          >
            <div className={`w-8 h-5 rounded-full p-0.5 transition-colors duration-300 ${vegOnly ? "bg-emerald-500" : "bg-gray-300 dark:bg-zinc-700"}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${vegOnly ? "translate-x-3" : "translate-x-0"}`} />
            </div>
            <span className="text-brand-green dark:text-brand-cream flex items-center gap-1">
              🍃 Veg Only
            </span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
          {/* Left Categories Sidebar / Selector (Mobile: Top horizontal scroll) */}
          <div className="lg:w-64 border-r lg:border-b-0 border-b border-white/10 dark:border-brand-green/15 p-4 lg:p-6 overflow-x-auto lg:overflow-y-auto scrollbar-none flex lg:flex-col gap-2 shrink-0">
            {UI_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap cursor-pointer transition-all duration-300 text-left w-full focus:outline-none flex items-center gap-2 border ${
                  activeCategory === category.id
                    ? "bg-brand-green text-brand-cream dark:bg-brand-gold dark:text-brand-green-dark border-transparent shadow-md transform translate-x-1"
                    : "bg-white/10 hover:bg-white/30 dark:bg-white/5 dark:hover:bg-white/10 text-brand-green dark:text-brand-cream border-white/10 dark:border-white/5 hover:border-brand-gold/40"
                }`}
              >
                {activeCategory === category.id && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
                {category.name}
              </button>
            ))}
          </div>

          {/* Right Menu Grid Panel */}
          <div className="flex-grow p-6 md:p-8 overflow-y-auto scrollbar-thin">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const inCart = cart.find((c) => c.id === item.id);
                  const isAvailable = item.availability.toUpperCase() === "AVAILABLE" || item.availability.toUpperCase() === "SEASONAL";

                  return (
                    <div
                      key={item.id}
                      className="group flex flex-col bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full relative"
                    >
                      {/* Image Frame */}
                      <div className="relative h-44 w-full overflow-hidden shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

                        {/* Veg/Non-veg Indicator */}
                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-1.5 rounded-md shadow-sm border border-gray-200/55 dark:border-zinc-800/50">
                          <span className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center shrink-0 ${item.isVeg ? "border-emerald-600" : "border-red-600"}`}>
                            <span className={`w-1 h-1 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
                          </span>
                        </div>

                        {/* Popular Badge */}
                        {item.isPopular && (
                          <div className="absolute top-3 right-3 bg-brand-gold text-brand-green-dark text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            Popular
                          </div>
                        )}
                      </div>

                      {/* Content Frame */}
                      <div className="p-5 flex flex-col flex-grow text-left space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-base font-extrabold text-brand-green dark:text-brand-cream group-hover:text-brand-gold transition-colors duration-300 line-clamp-1">
                            {item.name}
                          </h3>
                          <span className="text-base font-serif font-extrabold text-brand-gold shrink-0">
                            ₹{item.price}
                          </span>
                        </div>

                        <p className="text-xs text-brand-green/75 dark:text-brand-cream/70 font-semibold leading-relaxed flex-grow line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-brand-green/10">
                          {getAvailabilityBadge(item.availability)}

                          {/* Action Button */}
                          <div>
                            {inCart ? (
                              <div className="flex items-center justify-between w-24 border border-brand-gold rounded-full px-1.5 py-0.5 bg-white/80 dark:bg-black/20 shadow-sm">
                                <button
                                  onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                                  className="p-1 text-brand-gold hover:text-brand-gold-dark cursor-pointer focus:outline-none"
                                >
                                  <Minus className="w-3.5 h-3.5 stroke-[2.5px]" />
                                </button>
                                <span className="text-xs font-serif font-bold text-brand-green dark:text-brand-cream">
                                  {inCart.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                                  className="p-1 text-brand-gold hover:text-brand-gold-dark cursor-pointer focus:outline-none"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={!isAvailable}
                                onClick={() =>
                                  addToCart({
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                    image: item.image,
                                    category: item.categoryId
                                  })
                                }
                                className={`flex items-center gap-1 px-3.5 py-1.5 border border-brand-gold text-brand-gold rounded-full text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 focus:outline-none hover:bg-brand-gold hover:text-brand-green-dark hover:shadow-sm ${
                                  !isAvailable ? "opacity-45 cursor-not-allowed border-gray-400 text-gray-400 hover:bg-transparent hover:text-gray-400" : ""
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                                ADD
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center space-y-2 text-center">
                <span className="text-3xl">🍽️</span>
                <p className="text-sm text-brand-green/60 dark:text-brand-cream/60 font-semibold">
                  No items found in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MenuOverlay;
