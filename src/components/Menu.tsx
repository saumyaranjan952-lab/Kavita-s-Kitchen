"use client";

import React, { useState } from "react";
import { MENU_CATEGORIES, MENU_ITEMS } from "@/data/menuData";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "./ui/Card";
import { Plus, Minus, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Menu: React.FC = () => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState("odia-specials");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  // Filter items
  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = vegOnly ? item.isVeg : true;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  return (
    <section id="menu" className="py-20 md:py-28 bg-[var(--card-bg)] border-y border-[var(--card-border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-gold">
            Popular Menu
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-cream">
            Explore Kavita&apos;s Delicacies
          </h2>
          <div className="h-1 w-20 bg-brand-gold mx-auto rounded-full" />
        </div>

        {/* Controls: Search, Category Tabs, Veg filter */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-green/40 dark:text-brand-cream/40" />
              <input
                type="text"
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold transition-all duration-300 font-semibold"
              />
            </div>

            {/* Veg Switch */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-sm font-bold transition-all duration-300 cursor-pointer shadow-sm hover:border-brand-gold select-none focus:outline-none"
            >
              <div className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 ${vegOnly ? "bg-emerald-500" : "bg-gray-300 dark:bg-zinc-700"}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 transform ${vegOnly ? "translate-x-4" : "translate-x-0"}`} />
              </div>
              <span className="text-brand-green dark:text-brand-cream flex items-center gap-1">
                🍃 Veg Only
              </span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none justify-start sm:justify-center">
            {MENU_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide whitespace-nowrap cursor-pointer transition-all duration-300 focus:outline-none ${
                  activeCategory === category.id
                    ? "bg-brand-green text-brand-cream dark:bg-brand-gold dark:text-brand-green-dark shadow-md"
                    : "bg-[var(--card-bg)] text-brand-green dark:text-brand-cream border border-[var(--card-border)] hover:border-brand-gold"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const inCart = cart.find((i) => i.id === item.id);
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="flex flex-col h-full relative group">
                    
                    {/* Item Image */}
                    <div className="relative h-52 w-full overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Dark overlay top and bottom */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
                      
                      {/* Veg / Non-Veg Indicator Badge */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-1.5 rounded-md shadow-md flex items-center justify-center border border-gray-200">
                        <span className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center shrink-0 ${item.isVeg ? "border-emerald-600" : "border-red-600"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
                        </span>
                      </div>

                      {/* Popular Badge */}
                      {item.isPopular && (
                        <div className="absolute top-4 right-4 bg-brand-gold text-brand-green-dark text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Popular
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="flex flex-col flex-grow p-6 space-y-4 text-left">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-extrabold text-brand-green dark:text-brand-cream group-hover:text-brand-gold transition-colors duration-300">
                          {item.name}
                        </h3>
                        <span className="text-lg font-serif font-extrabold text-brand-gold shrink-0">
                          ₹{item.price}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-brand-green/70 dark:text-brand-cream/65 leading-relaxed flex-grow font-semibold line-clamp-3">
                        {item.description}
                      </p>

                      {/* Cart Buttons just like Zomato/Swiggy */}
                      <div className="pt-2">
                        {inCart ? (
                          <div className="flex items-center justify-between w-32 border-2 border-brand-gold rounded-full px-2 py-1 bg-[var(--card-bg)] shadow-inner">
                            <button
                              onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                              className="p-1 text-brand-gold hover:text-brand-gold-dark focus:outline-none cursor-pointer"
                            >
                              <Minus className="w-4 h-4 stroke-[3px]" />
                            </button>
                            <span className="text-sm font-serif font-black text-brand-green dark:text-brand-cream">
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                              className="p-1 text-brand-gold hover:text-brand-gold-dark focus:outline-none cursor-pointer"
                            >
                              <Plus className="w-4 h-4 stroke-[3px]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image: item.image,
                              category: item.category
                            })}
                            className="flex items-center gap-2 px-5 py-2 border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-green-dark rounded-full text-xs sm:text-sm font-bold tracking-wide cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 hover:shadow-md"
                          >
                            <Plus className="w-4 h-4 stroke-[3.5px]" />
                            ADD
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 text-center space-y-3">
              <span className="text-4xl text-brand-gold">🍽️</span>
              <p className="text-base text-brand-green/60 dark:text-brand-cream/60 font-bold">
                No items found matching your filters.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
export default Menu;
