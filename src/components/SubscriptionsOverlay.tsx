"use client";

import React, { useEffect, useRef } from "react";
import { X, User, Calendar, ShieldCheck, MessageSquare, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";

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

interface SubscriptionsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  whatsApp?: string;
  phone?: string;
}

export const SubscriptionsOverlay: React.FC<SubscriptionsOverlayProps> = ({
  isOpen,
  onClose,
  plans,
  whatsApp = "917848037181",
  phone = "+91 78480 37181"
}) => {
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

  const handleSubscribe = (planName: string, billingCycle: "weekly" | "monthly", price: number) => {
    const cycleText = billingCycle === "weekly" ? "Weekly" : "Monthly";
    const text = encodeURIComponent(
      `Hello Kavita's Kitchen, I am interested in subscribing to the "${planName}" on a ${cycleText} basis (Price: ₹${price}). Please share details.`
    );
    window.open(`https://wa.me/${whatsApp}?text=${text}`, "_blank");
  };

  const handleGeneralInquiry = () => {
    const text = encodeURIComponent(
      "Hello Kavita's Kitchen, I would like to inquire about your custom meal subscriptions and plans."
    );
    window.open(`https://wa.me/${whatsApp}?text=${text}`, "_blank");
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case "student":
        return <User className="w-5 h-5 text-brand-gold" />;
      case "office":
        return <Calendar className="w-5 h-5 text-brand-gold" />;
      case "family":
        return <ShieldCheck className="w-5 h-5 text-brand-gold" />;
      default:
        return null;
    }
  };

  const cleanPhone = phone.replace(/[^0-9+]/g, "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/55 backdrop-blur-md overflow-hidden"
    >
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-5xl h-full max-h-[85vh] md:max-h-[90vh] bg-brand-green/85 dark:bg-brand-green-dark/85 text-brand-cream border-2 border-brand-gold/40 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold" />

        {/* Top Header Panel */}
        <div className="p-6 md:p-8 pb-4 flex items-center justify-between border-b border-brand-cream/10">
          <div>
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-brand-gold">
              Daily Meal Subscriptions
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-brand-cream mt-0.5">
              Choose Your Dining Comfort
            </h2>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-brand-cream/10 hover:bg-brand-cream/20 text-brand-cream hover:text-brand-gold border border-brand-cream/10 transition-all duration-300 cursor-pointer shadow-sm hover:scale-105"
            aria-label="Close subscriptions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans Container */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => {
              return (
                <div
                  key={plan.id}
                  className="flex flex-col bg-brand-green-dark/70 border border-brand-gold/20 hover:border-brand-gold/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl group"
                >
                  {/* Plan Image Header */}
                  <div className="relative h-32 sm:h-36 w-full overflow-hidden shrink-0">
                    <img
                      src={plan.image}
                      alt={plan.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

                    {/* Floating icon */}
                    <div className="absolute bottom-3 left-3 bg-brand-green-dark p-2 rounded-xl border border-brand-gold/40 shadow-sm flex items-center justify-center">
                      {getPlanIcon(plan.type)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-grow text-left space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-brand-cream group-hover:text-brand-gold transition-colors duration-300">
                        {plan.name}
                      </h3>
                      <p className="text-[11px] text-brand-cream/75 leading-relaxed font-semibold line-clamp-2">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features checklist */}
                    <ul className="space-y-2 flex-grow">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-brand-cream/85 font-bold">
                          <span className="text-brand-gold shrink-0 mt-0.5">✦</span>
                          <span className="line-clamp-2">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price details */}
                    <div className="pt-3 border-t border-brand-cream/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-brand-cream/60 font-semibold">Weekly Plan:</span>
                        <span className="font-serif font-extrabold text-brand-gold">₹{plan.weeklyPrice}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pb-2">
                        <span className="text-brand-cream/60 font-semibold">Monthly Plan:</span>
                        <span className="font-serif font-extrabold text-brand-gold">₹{plan.monthlyPrice}</span>
                      </div>

                      {/* Subscribe actions */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleSubscribe(plan.name, "weekly", plan.weeklyPrice)}
                          className="py-2 px-3 bg-brand-cream/10 hover:bg-brand-cream/20 text-brand-cream border border-brand-cream/25 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm text-center"
                        >
                          Weekly Sub
                        </button>
                        <button
                          onClick={() => handleSubscribe(plan.name, "monthly", plan.monthlyPrice)}
                          className="py-2 px-3 bg-brand-gold hover:bg-brand-gold-light text-brand-green-dark rounded-xl text-[10px] sm:text-xs font-black transition-all duration-300 cursor-pointer shadow-sm text-center"
                        >
                          Monthly Sub
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Support Panel (WhatsApp and Contact) */}
        <div className="p-6 md:p-8 bg-brand-green-dark/60 border-t border-brand-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-cream/70 font-semibold text-center sm:text-left leading-relaxed">
            Need customized plans, group subscriptions, or have food allergies?
            <br />
            Let us know, we are happy to customize everything!
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-center">
            {/* WhatsApp Inquiry Button */}
            <button
              onClick={handleGeneralInquiry}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold transition-all duration-300 cursor-pointer shadow-md"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              WhatsApp Inquiry
            </button>

            {/* Direct Phone Call Button */}
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-brand-gold/60 text-brand-gold hover:bg-brand-gold hover:text-brand-green-dark rounded-full text-xs font-bold transition-all duration-300 shadow-md cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              Call Support
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionsOverlay;
