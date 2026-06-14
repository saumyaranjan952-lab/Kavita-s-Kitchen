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

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navigation */}
      <Header onCartOpen={() => setIsCartOpen(true)} />

      {/* Main Sections */}
      <main className="flex-grow">
        <Hero />
        <About />
        <WhyChooseUs />
        <Menu />
        <Subscriptions />
        <Testimonials />
        <InstagramFeed />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent WhatsApp Floating Button */}
      <FloatingWA />

      {/* Cart Slider Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
