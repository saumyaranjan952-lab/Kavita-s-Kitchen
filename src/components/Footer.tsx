"use client";

import React from "react";
import { Logo } from "./Header";
import { Phone, MapPin, Clock, Heart } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type BusinessConfig = {
  phone: string;
  whatsApp: string;
  instagram: string;
  address: string;
  operatingHours: string;
};

interface FooterProps {
  categories: Category[];
  config: BusinessConfig;
  onMenuOpen?: () => void;
  onSubscriptionsOpen?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  config,
  onMenuOpen,
  onSubscriptionsOpen
}) => {
  const quickLinks = [
    { label: "Our Story", href: "#about" },
    { label: "Why Choose Us", href: "#why-us" },
    { label: "Popular Menu", href: "#menu" },
    { label: "Meal Subscriptions", href: "#subscriptions" },
    { label: "Customer Reviews", href: "#reviews" }
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === "#menu" && onMenuOpen) {
      onMenuOpen();
      return;
    }
    if (href === "#subscriptions" && onSubscriptionsOpen) {
      onSubscriptionsOpen();
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const cleanPhone = config.phone.replace(/[^0-9+]/g, "");

  return (
    <footer className="bg-brand-green text-brand-cream border-t-4 border-brand-gold pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-6">
            <Logo className="invert brightness-200" />
            <p className="text-sm text-brand-cream/85 leading-relaxed font-medium">
              Kavita&apos;s Kitchen brings the rich heritage and home-cooked flavors of authentic Odia cuisine straight to you in Puri. Freshly made daily with hygienic, hand-picked ingredients.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://instagram.com/${config.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-brand-green-light border border-brand-cream/20 hover:border-brand-gold text-brand-gold hover:text-brand-cream transition-all duration-300 flex items-center justify-center"
                aria-label="Instagram"
              >
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
                  className="w-5 h-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-base font-bold uppercase tracking-wider text-brand-gold">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-sm text-brand-cream/80 hover:text-brand-gold transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-5">
            <h4 className="text-base font-bold uppercase tracking-wider text-brand-gold">
              Categories
            </h4>
            <ul className="space-y-3">
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <a
                    href="#menu"
                    onClick={(e) => handleLinkClick(e, "#menu")}
                    className="text-sm text-brand-cream/80 hover:text-brand-gold transition-colors duration-200 font-medium"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-5">
            <h4 className="text-base font-bold uppercase tracking-wider text-brand-gold">
              Kitchen Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <span className="text-sm text-brand-cream/80 font-medium leading-relaxed">
                  {config.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                <a
                  href={`tel:${cleanPhone}`}
                  className="text-sm text-brand-cream/80 hover:text-brand-gold font-medium transition-colors"
                >
                  {config.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div className="text-sm text-brand-cream/80 font-medium">
                  <p>{config.operatingHours}</p>
                  <p className="text-xs text-brand-cream/60 mt-0.5">Order 1 hour in advance</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-brand-cream/10 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-cream/75 font-semibold">
            © 2026 Kavita&apos;s Kitchen. Authentic Taste of Odisha. All rights reserved.
          </p>
          <p className="text-xs text-brand-cream/70 font-semibold flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in Puri, Odisha
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
