"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ThemeToggle } from "./ui/ThemeToggle";
import { ShoppingCart, Menu, X, PhoneCall, User, ChevronDown, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { checkCustomerSession, customerLogout } from "@/lib/actions/customerAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

interface HeaderProps {
  categories: Category[];
  config: BusinessConfig;
  onCartOpen?: () => void;
  onMenuOpen?: () => void;
  onSubscriptionsOpen?: () => void;
}

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-gold shadow-sm shrink-0">
        <img
          src="/images/logo.jpg"
          alt="Kavita's Kitchen Logo"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col text-left">
        <span className="font-serif text-lg sm:text-xl font-extrabold tracking-wide text-brand-green dark:text-brand-cream leading-tight">
          Kavita&apos;s <span className="text-brand-gold">Kitchen</span>
        </span>
        <span className="text-[9px] sm:text-[10px] tracking-widest text-brand-gold uppercase font-semibold">
          Authentic Taste of Odisha
        </span>
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  config,
  onCartOpen,
  onMenuOpen,
  onSubscriptionsOpen
}) => {
  const { cartCount, setIsCartOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Customer session state
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    checkCustomerSession().then((user) => {
      if (user) {
        setCustomer({ name: user.name, email: user.email });
      }
    });
  }, []);

  const handleLogout = async () => {
    const res = await customerLogout();
    if (res.success) {
      setCustomer(null);
      setShowDropdown(false);
      router.push("/");
      router.refresh();
    }
  };

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Our Story", href: "#about" },
    { label: "Why Us", href: "#why-us" },
    { label: "Menu", href: "#menu" },
    { label: "Subscriptions", href: "#subscriptions" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" }
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Check if we are currently not on the homepage
    if (window.location.pathname !== "/") {
      router.push("/" + href);
      return;
    }

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
    <header className="sticky top-0 z-40 w-full bg-[var(--card-bg)]/90 backdrop-blur-md border-b border-[var(--card-border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-sm font-semibold text-brand-green hover:text-brand-gold dark:text-brand-cream dark:hover:text-brand-gold transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full bg-brand-green text-brand-cream hover:bg-brand-green-light dark:bg-brand-gold dark:text-brand-green-dark dark:hover:bg-brand-gold-light transition-all duration-300 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--card-bg)]"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Customer Profile / Dropdown */}
          <div className="relative">
            {customer ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 p-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream hover:text-brand-gold hover:border-brand-gold transition-all duration-300 cursor-pointer focus:outline-none select-none text-xs font-bold"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-gold text-brand-green-dark flex items-center justify-center font-extrabold text-[11px]">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{customer.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-20 py-2 text-left transition-colors duration-300">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                        <p className="text-[10px] text-brand-gold font-bold uppercase">Logged in as</p>
                        <p className="text-xs font-bold text-brand-green dark:text-brand-cream truncate mt-0.5">{customer.name}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-green dark:text-brand-cream hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:text-brand-gold"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/profile?tab=orders"
                        onClick={() => {
                          setShowDropdown(false);
                          router.push("/profile");
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-green dark:text-brand-cream hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:text-brand-gold"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left border-t border-gray-100 dark:border-zinc-800 mt-1.5 pt-2 cursor-pointer focus:outline-none"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-green-dark rounded-full text-xs font-bold tracking-wide transition-all duration-300 shadow-sm"
              >
                <User className="w-3.5 h-3.5 stroke-[2.5px]" />
                Sign In
              </Link>
            )}
          </div>

          {/* Call Button (Mobile Shortcut) */}
          <a
            href={`tel:${cleanPhone}`}
            className="p-2.5 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream hover:text-brand-gold transition-colors duration-300 flex md:hidden"
            title="Call Us"
          >
            <PhoneCall className="w-5 h-5" />
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream hover:text-brand-gold transition-colors duration-300 flex md:hidden cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col text-left">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-base font-semibold text-brand-green hover:text-brand-gold dark:text-brand-cream dark:hover:text-brand-gold py-1.5 transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
              {!customer && (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex justify-center items-center gap-1.5 px-4 py-2.5 border-2 border-brand-gold text-brand-gold rounded-full text-sm font-bold tracking-wide"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Header;
