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
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingWA } from "@/components/FloatingWA";

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
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navigation - inject dynamic config and categories */}
      <Header 
        categories={data.categories} 
        config={data.config} 
        onCartOpen={() => setIsCartOpen(true)} 
      />

      {/* Main Sections - inject dynamic database content */}
      <main className="flex-grow">
        <Hero config={data.config} />
        <About />
        <WhyChooseUs />
        <Menu categories={data.categories} menuItems={data.menuItems} />
        <Subscriptions plans={data.subscriptionPlans} whatsApp={data.config.whatsApp} />
        <Testimonials reviews={data.reviews} />
        <InstagramFeed config={data.config} />
        <Contact config={data.config} />
      </main>

      {/* Footer - inject dynamic config and categories */}
      <Footer categories={data.categories} config={data.config} />

      {/* Persistent WhatsApp Floating Button */}
      <FloatingWA config={data.config} />

      {/* Cart Slider Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
