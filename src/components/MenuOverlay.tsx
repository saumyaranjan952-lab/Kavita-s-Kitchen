"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Search, Sparkles, X, Flame, Sparkle, CircleDollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  isOpen,
  onClose,
  menuItems,
  categories
}) => {
  const { cart, addToCart, updateQuantity } = useCart();
  
  // Veg / Non-Veg Toggle State (Default: Vegetarian)
  const [activeFoodType, setActiveFoodType] = useState<"veg" | "non-veg">("veg");
  
  // Custom Filter Pills (All, Best Seller, Popular, New, Budget)
  const [activeFilter, setActiveFilter] = useState<"all" | "bestseller" | "popular" | "new" | "budget">("all");
  
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  // 1. Dynamic filtering of categories based on food type
  // Show only categories that have items matching the selected activeFoodType (Veg vs Non-Veg)
  const matchingFoodTypeItems = menuItems.filter(
    (item) => item.isVeg === (activeFoodType === "veg")
  );

  const availableCategories = categories.filter((cat) =>
    matchingFoodTypeItems.some((item) => item.categoryId === cat.id)
  );

  // Automatically switch activeCategory if it's not available in the selected food type
  useEffect(() => {
    if (availableCategories.length > 0) {
      const isCurrentCatAvailable = availableCategories.some((cat) => cat.id === activeCategory);
      if (!isCurrentCatAvailable) {
        setActiveCategory(availableCategories[0].id);
      }
    } else {
      setActiveCategory("");
    }
  }, [activeFoodType, availableCategories, activeCategory]);

  // 2. Filter menu items based on: Category, Food Type (Veg/Non-Veg), Filters, and Search Query
  const filteredItems = matchingFoodTypeItems.filter((item) => {
    const matchesCategory = item.categoryId === activeCategory;
    
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Apply custom filters
    let matchesFilter = true;
    if (activeFilter === "bestseller") matchesFilter = item.isBestSeller;
    else if (activeFilter === "popular") matchesFilter = item.isPopular;
    else if (activeFilter === "new") matchesFilter = item.isChefSpecial || item.isFeatured;
    else if (activeFilter === "budget") matchesFilter = item.price <= 100;

    return matchesCategory && matchesSearch && matchesFilter;
  });

  const getAvailabilityBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "AVAILABLE") {
      return (
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          🟢 Available
        </span>
      );
    } else if (statusUpper === "SEASONAL" || statusUpper === "LIMITED" || statusUpper === "LIMITED_QUANTITY") {
      return (
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          🟡 Limited Quantity
        </span>
      );
    } else {
      return (
        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1 rounded-full border border-red-500/20 flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          🔴 Out of Stock
        </span>
      );
    }
  };

  const filterPills: { id: "all" | "bestseller" | "popular" | "new" | "budget"; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All Dishes", icon: null },
    { id: "bestseller", label: "Best Seller", icon: <Sparkle className="w-3.5 h-3.5" /> },
    { id: "popular", label: "Popular", icon: <Flame className="w-3.5 h-3.5" /> },
    { id: "new", label: "New", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "budget", label: "Budget Meals", icon: <CircleDollarSign className="w-3.5 h-3.5" /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-md overflow-hidden"
    >
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0, y: 55, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 35, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative w-full max-w-6xl h-full max-h-[85vh] md:max-h-[90vh] bg-white/75 dark:bg-brand-green-dark/75 border border-white/20 dark:border-brand-green/30 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
      >
        {/* Top gold header boundary line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-60" />

        {/* 1. Header (Sticky) */}
        <div className="p-5 md:p-6 pb-3 flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/20 dark:border-brand-green/20 gap-3 shrink-0">
          <div>
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-brand-gold">
              Explore Our Authentic Taste
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-brand-green dark:text-brand-cream mt-0.5">
              Kavita&apos;s Premium Menu
            </h2>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/15 text-brand-green dark:text-brand-cream hover:text-brand-gold border border-white/10 transition-all duration-300 cursor-pointer shadow-sm hover:scale-105"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Toggle and Filter Panel (Sticky) */}
        <div className="bg-white/30 dark:bg-black/15 border-b border-white/10 dark:border-brand-green/10 p-4 md:px-6 flex flex-col gap-4 shrink-0">
          {/* Main Veg / Non-Veg Toggle Selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 bg-white/50 dark:bg-brand-green-dark/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-brand-green/20 shadow-sm w-full max-w-md relative">
              <button
                onClick={() => {
                  setActiveFoodType("veg");
                  setActiveFilter("all");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer focus:outline-none relative select-none ${
                  activeFoodType === "veg"
                    ? "bg-emerald-600 text-white shadow-md scale-102"
                    : "text-brand-green hover:bg-emerald-500/10 dark:text-brand-cream dark:hover:bg-emerald-500/5"
                }`}
              >
                <span className="text-base">🥗</span>
                Vegetarian
              </button>
              <button
                onClick={() => {
                  setActiveFoodType("non-veg");
                  setActiveFilter("all");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer focus:outline-none relative select-none ${
                  activeFoodType === "non-veg"
                    ? "bg-brand-gold text-brand-green-dark shadow-md scale-102"
                    : "text-brand-green hover:bg-brand-gold/10 dark:text-brand-cream dark:hover:bg-brand-gold/5"
                }`}
              >
                <span className="text-base">🍗</span>
                Non-Vegetarian
              </button>
            </div>
          </div>

          {/* Search Input & Filter Pills */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full xl:max-w-xs shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-green/50 dark:text-brand-cream/50" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-white/30 dark:border-brand-green/30 bg-white/40 dark:bg-black/25 text-brand-green dark:text-brand-cream text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all duration-300 font-semibold shadow-inner placeholder-brand-green/40 dark:placeholder-brand-cream/40"
              />
            </div>

            {/* Filter Pills Slider */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 xl:pb-0 scrollbar-none justify-start">
              {filterPills.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-300 flex items-center gap-1.5 border focus:outline-none ${
                    activeFilter === pill.id
                      ? "bg-brand-green text-brand-cream dark:bg-brand-gold dark:text-brand-green-dark border-transparent shadow-sm"
                      : "bg-white/20 hover:bg-white/40 dark:bg-white/5 dark:hover:bg-white/10 text-brand-green dark:text-brand-cream border-white/15 dark:border-white/5 hover:border-brand-gold/40"
                  }`}
                >
                  {pill.icon}
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Main Content Panel */}
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Left Categories Selector (Sticky/Fixed sidebar on desktop, horizontal scroll on mobile) */}
          <div className="lg:w-60 border-b lg:border-b-0 lg:border-r border-white/10 dark:border-brand-green/15 p-3 lg:p-4 overflow-x-auto lg:overflow-y-auto scrollbar-none flex lg:flex-col gap-1.5 shrink-0 sticky top-0 bg-transparent z-10">
            {availableCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap cursor-pointer transition-all duration-300 text-left w-full focus:outline-none flex items-center gap-2 border ${
                  activeCategory === category.id
                    ? activeFoodType === "veg"
                      ? "bg-emerald-600/90 text-white border-transparent shadow-md transform translate-x-1"
                      : "bg-brand-gold text-brand-green-dark border-transparent shadow-md transform translate-x-1"
                    : "bg-white/15 hover:bg-white/30 dark:bg-white/5 dark:hover:bg-white/10 text-brand-green dark:text-brand-cream border-white/10 dark:border-white/5 hover:border-brand-gold/40"
                }`}
              >
                {activeCategory === category.id && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-ping" />}
                {category.name}
              </button>
            ))}
            
            {availableCategories.length === 0 && (
              <span className="text-xs text-brand-green/55 dark:text-brand-cream/50 px-2 py-4">No active categories</span>
            )}
          </div>

          {/* Right Dishes Grid Panel */}
          <div className="flex-grow p-5 md:p-6 lg:p-8 overflow-y-auto scrollbar-thin">
            {/* Header section badge */}
            <div className="mb-6">
              {activeFoodType === "veg" ? (
                <div className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider shadow-sm select-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  🥗 100% Vegetarian
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-extrabold text-xs uppercase tracking-wider shadow-sm select-none">
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                  🍗 Chef&apos;s Non-Veg Specials
                </div>
              )}
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => {
                    const inCart = cart.find((c) => c.id === item.id);
                    const isAvailable = item.availability.toUpperCase() === "AVAILABLE" || item.availability.toUpperCase() === "SEASONAL";

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className={`group flex flex-col bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full relative ${
                          activeFoodType === "veg" 
                            ? "hover:border-emerald-500/40" 
                            : "hover:border-brand-gold/40"
                        }`}
                      >
                        {/* Image Frame */}
                        <div className="relative h-44 w-full overflow-hidden shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35 pointer-events-none" />

                          {/* Veg/Non-veg Indicator Badge */}
                          <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm border border-gray-200/50 dark:border-zinc-800/40 flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 border-2 rounded-md flex items-center justify-center shrink-0 ${item.isVeg ? "border-emerald-600" : "border-red-600"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
                            </span>
                            <span className="text-[10px] font-black uppercase text-brand-green dark:text-brand-cream">
                              {item.isVeg ? "🌱 Veg" : "🍗 Non-Veg"}
                            </span>
                          </div>

                          {/* Popular Badge */}
                          {item.isPopular && (
                            <div className="absolute top-3 right-3 bg-brand-gold text-brand-green-dark text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              Popular
                            </div>
                          )}
                        </div>

                        {/* Content Frame */}
                        <div className="p-5 flex flex-col flex-grow text-left space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className={`text-base font-extrabold text-brand-green dark:text-brand-cream transition-colors duration-300 line-clamp-1 ${
                              activeFoodType === "veg"
                                ? "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                                : "group-hover:text-brand-gold"
                            }`}>
                              {item.name}
                            </h3>
                            <span className="text-base font-serif font-extrabold text-brand-gold shrink-0">
                              ₹{item.price}
                            </span>
                          </div>

                          <p className="text-xs text-brand-green/75 dark:text-brand-cream/70 font-semibold leading-relaxed flex-grow line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between pt-2.5 border-t border-white/10 dark:border-brand-green/10">
                            {getAvailabilityBadge(item.availability)}

                            {/* Action Button */}
                            <div>
                              {inCart ? (
                                <div className={`flex items-center justify-between w-24 border rounded-full px-1.5 py-0.5 bg-white/80 dark:bg-black/20 shadow-sm ${
                                  activeFoodType === "veg" ? "border-emerald-500" : "border-brand-gold"
                                }`}>
                                  <button
                                    onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                                    className={`p-1 cursor-pointer focus:outline-none ${
                                      activeFoodType === "veg" ? "text-emerald-600 hover:text-emerald-700" : "text-brand-gold hover:text-brand-gold-dark"
                                    }`}
                                  >
                                    <Minus className="w-3.5 h-3.5 stroke-[2.5px]" />
                                  </button>
                                  <span className="text-xs font-serif font-bold text-brand-green dark:text-brand-cream">
                                    {inCart.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                                    className={`p-1 cursor-pointer focus:outline-none ${
                                      activeFoodType === "veg" ? "text-emerald-600 hover:text-emerald-700" : "text-brand-gold hover:text-brand-gold-dark"
                                    }`}
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
                                  className={`flex items-center gap-1 px-4 py-1.5 border rounded-full text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 focus:outline-none hover:shadow-sm ${
                                    !isAvailable
                                      ? "opacity-45 cursor-not-allowed border-gray-400 text-gray-400 hover:bg-transparent hover:text-gray-400"
                                      : activeFoodType === "veg"
                                      ? "border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                                      : "border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-green-dark"
                                  }`}
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                                  ADD
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center space-y-2 text-center">
                <span className="text-3xl">🍽️</span>
                <p className="text-sm text-brand-green/60 dark:text-brand-cream/60 font-semibold">
                  No items match the filters in this category.
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
