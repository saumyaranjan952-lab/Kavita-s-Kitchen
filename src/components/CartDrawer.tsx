"use client";

import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "./ui/Button";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    cartTotal, 
    discount, 
    tax, 
    deliveryCharge, 
    grandTotal, 
    couponCode 
  } = useCart();
  
  const router = useRouter();

  const handleCheckoutRedirect = () => {
    onClose();
    router.push("/checkout");
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

            {/* Subtotals & Pay */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-[var(--card-border)] bg-[var(--card-bg)] space-y-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-brand-green/80 dark:text-brand-cream/80">
                    <span>Subtotal</span>
                    <span className="font-serif">₹{cartTotal}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Discount {couponCode ? `(${couponCode})` : ""}</span>
                      <span className="font-serif">-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm font-semibold text-brand-green/80 dark:text-brand-cream/80">
                    <span>Delivery Charges</span>
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold text-xs">FREE</span>
                    ) : (
                      <span className="font-serif">₹{deliveryCharge}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm font-semibold text-brand-green/80 dark:text-brand-cream/80">
                    <span>Taxes (5% GST)</span>
                    <span className="font-serif">₹{tax}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-brand-gold/20 pt-3 font-serif text-lg font-black text-brand-green dark:text-brand-cream">
                    <span>Grand Total</span>
                    <span className="text-brand-gold font-extrabold">₹{grandTotal}</span>
                  </div>
                </div>

                <Button variant="gold" fullWidth size="lg" onClick={handleCheckoutRedirect} shimmer>
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
