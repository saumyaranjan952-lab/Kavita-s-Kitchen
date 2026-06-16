"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Menu } from "@/components/Menu";
import { Subscriptions } from "@/components/Subscriptions";
import { Testimonials } from "@/components/Testimonials";
import { InstagramFeed } from "@/components/Instagram";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { FloatingWA } from "@/components/FloatingWA";
import { MenuOverlay } from "@/components/MenuOverlay";
import { SubscriptionsOverlay } from "@/components/SubscriptionsOverlay";
import { AnimatePresence } from "framer-motion";

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
  
  rating?: number | null;
  ingredients?: string[];
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  serves?: string | null;
  portionSize?: string | null;
  spiceLevel?: string | null;
  customizations?: any;
  relatedItems?: string[];
};

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  weeklyPrice: number;
  monthlyPrice: number;
  image: string;
  features: string[];
  type: string;
};

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  location: string;
  date: string;
};

type BusinessConfig = {
  phone: string;
  whatsApp: string;
  instagram: string;
  address: string;
  operatingHours: string;
  heroTitle: string;
  heroSubtitle: string;
};

interface HomeClientProps {
  data: {
    categories: Category[];
    menuItems: MenuItem[];
    subscriptionPlans: SubscriptionPlan[];
    reviews: Review[];
    config: BusinessConfig;
  };
}

export default function HomeClient({ data }: HomeClientProps) {
  const { isCartOpen, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navigation - inject dynamic config and categories */}
      <Header 
        categories={data.categories} 
        config={data.config} 
        onCartOpen={() => setIsCartOpen(true)} 
        onMenuOpen={() => setIsMenuOpen(true)}
        onSubscriptionsOpen={() => setIsSubscriptionsOpen(true)}
      />

      {/* Main Sections - inject dynamic database content */}
      <main className="flex-grow">
        <Hero 
          config={data.config} 
          onMenuOpen={() => setIsMenuOpen(true)}
        />
        <About />
        <WhyChooseUs />
        <Menu categories={data.categories} menuItems={data.menuItems} onCartOpen={() => setIsCartOpen(true)} />
        <Subscriptions plans={data.subscriptionPlans} whatsApp={data.config.whatsApp} />
        <Testimonials reviews={data.reviews} />
        <InstagramFeed config={data.config} />
        <Contact config={data.config} />
      </main>

      {/* Footer - inject dynamic config and categories */}
      <Footer 
        categories={data.categories} 
        config={data.config} 
        onMenuOpen={() => setIsMenuOpen(true)}
        onSubscriptionsOpen={() => setIsSubscriptionsOpen(true)}
      />

      {/* Persistent WhatsApp Floating Button */}
      <FloatingWA config={data.config} />



      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <MenuOverlay
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            menuItems={data.menuItems}
            categories={data.categories}
            onCartOpen={() => setIsCartOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Subscriptions Overlay */}
      <AnimatePresence>
        {isSubscriptionsOpen && (
          <SubscriptionsOverlay
            isOpen={isSubscriptionsOpen}
            onClose={() => setIsSubscriptionsOpen(false)}
            plans={data.subscriptionPlans}
            whatsApp={data.config.whatsApp}
            phone={data.config.phone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
