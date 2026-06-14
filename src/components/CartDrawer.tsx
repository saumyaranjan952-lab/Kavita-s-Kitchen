"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Formulate a beautiful order summary text for WhatsApp
    let messageText = `*🍽️ KAVITA'S KITCHEN - NEW ORDER REQUEST*\n`;
    messageText += `==================================\n\n`;
    
    cart.forEach((item) => {
      messageText += `• *${item.name}* \n   Quantity: x${item.quantity} | Price: ₹${item.price * item.quantity}\n`;
    });

    messageText += `\n==================================\n`;
    messageText += `*💰 Total Amount:* ₹${cartTotal}\n\n`;
    
    if (address.trim()) {
      messageText += `*📍 Delivery Address:*\n${address.trim()}\n\n`;
    } else {
      messageText += `*📍 Delivery Address:* (To be provided in next message)\n\n`;
    }

    if (instructions.trim()) {
      messageText += `*📝 Special Instructions:*\n${instructions.trim()}\n\n`;
    }

    messageText += `Please confirm my order and estimate delivery time. Thank you!`;

    const encodedText = encodeURIComponent(messageText);
    window.open(`https://wa.me/917848037181?text=${encodedText}`, "_blank");

    // Optional: clear the cart on successful checkout
    clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--card-border)] shadow-2xl z-50 flex flex-col transition-colors duration-300"
          >
            {/* Header */}
            <div className="p-5 border-b border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-green dark:text-brand-cream">
                <ShoppingBag className="w-5 h-5 text-brand-gold" />
                <h2 className="font-serif text-lg font-extrabold">Your Food Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-brand-cream dark:hover:bg-brand-green-light text-brand-green dark:text-brand-cream transition-colors cursor-pointer focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold text-3xl">
                    🍲
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-base font-extrabold text-brand-green dark:text-brand-cream">Your cart is empty</p>
                    <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold max-w-[240px]">
                      Add some authentic Odia meals to satisfy your hunger!
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Browse Menu
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] relative group"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-grow flex flex-col justify-between text-left">
                      <div>
                        <h4 className="text-sm font-extrabold text-brand-green dark:text-brand-cream leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider mt-0.5">
                          {item.category.replace("-", " ")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-serif font-black text-brand-gold">
                          ₹{item.price * item.quantity}
                        </span>

                        {/* Quantity controls */}
                        <div className="flex items-center border border-brand-gold rounded-full px-1.5 py-0.5 bg-[var(--card-bg)] shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-0.5 text-brand-gold hover:text-brand-gold-dark focus:outline-none cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5px]" />
                          </button>
                          <span className="text-xs font-serif font-black px-2 text-brand-green dark:text-brand-cream">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-0.5 text-brand-gold hover:text-brand-gold-dark focus:outline-none cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-2 right-2 text-brand-green/30 dark:text-brand-cream/30 hover:text-red-500 transition-colors p-1 rounded-full cursor-pointer focus:outline-none"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Form */}
            {cart.length > 0 && (
              <form
                onSubmit={handleCheckout}
                className="p-5 border-t border-[var(--card-border)] bg-[var(--card-bg)] space-y-4 text-left"
              >
                {/* Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-gold mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      placeholder="Enter full delivery address in Puri..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="w-full text-sm p-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold transition-all duration-300 font-semibold resize-none h-16"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-gold mb-1">
                      Cooking/Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Less spicy, deliver by 1:00 PM..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-gold/60 focus:border-brand-gold transition-all duration-300 font-semibold"
                    />
                  </div>
                </div>

                {/* Subtotals & Pay */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between border-t border-[var(--card-border)]/60 pt-3 font-semibold text-brand-green dark:text-brand-cream">
                    <span>Subtotal</span>
                    <span className="font-serif">₹{cartTotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold">
                    <span>Delivery Charge</span>
                    <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold">FREE Delivery</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-brand-gold/20 pt-3 font-serif text-lg font-black text-brand-green dark:text-brand-cream">
                    <span>Grand Total</span>
                    <span className="text-brand-gold font-extrabold">₹{cartTotal}</span>
                  </div>

                  <Button variant="gold" fullWidth size="lg" type="submit" shimmer>
                    <Send className="w-4 h-4 mr-2" />
                    Place Order via WhatsApp
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
