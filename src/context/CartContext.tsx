"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { validateCoupon } from "@/lib/actions/orders";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number; // Subtotal of items
  cartCount: number;
  
  // New ordering calculations
  couponCode: string | null;
  discount: number;
  tax: number;
  deliveryCharge: number;
  grandTotal: number;
  couponError: string | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCouponCode: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Load cart on client mount
  useEffect(() => {
    const storedCart = localStorage.getItem("kavita-cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart data:", e);
      }
    }
    const storedCoupon = localStorage.getItem("kavita-coupon");
    if (storedCoupon) {
      setCouponCode(storedCoupon);
    }
    setMounted(true);
  }, []);

  // Save cart changes to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("kavita-cart", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const addToCart = (newItem: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    removeCouponCode();
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Delivery Charges: Free above 150, else 30
  const deliveryCharge = cartTotal === 0 ? 0 : cartTotal >= 150 ? 0 : 30;

  // Calculate discount automatically if coupon is applied
  useEffect(() => {
    if (couponCode && cartTotal > 0) {
      validateCoupon(couponCode, cartTotal).then((res) => {
        if (res.success && res.discount !== undefined) {
          setDiscount(res.discount);
          setCouponError(null);
        } else {
          // If cart changed and coupon is no longer valid (e.g. subtotal fell below minOrderValue)
          setDiscount(0);
          setCouponError(res.error || "Coupon is invalid for this order.");
        }
      });
    } else {
      setDiscount(0);
      setCouponError(null);
    }
  }, [couponCode, cartTotal]);

  // Tax: 5% of (subtotal - discount)
  const tax = Math.round(Math.max(0, cartTotal - discount) * 0.05 * 100) / 100;

  // Grand Total
  const grandTotal = Math.max(0, cartTotal - discount + deliveryCharge + tax);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    const res = await validateCoupon(code, cartTotal);
    if (res.success && res.discount !== undefined) {
      setCouponCode(res.code || code);
      setDiscount(res.discount);
      setCouponError(null);
      localStorage.setItem("kavita-coupon", res.code || code);
      return true;
    } else {
      setCouponError(res.error || "Invalid coupon code.");
      return false;
    }
  };

  const removeCouponCode = () => {
    setCouponCode(null);
    setDiscount(0);
    setCouponError(null);
    localStorage.removeItem("kavita-coupon");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        couponCode,
        discount,
        tax,
        deliveryCharge,
        grandTotal,
        couponError,
        applyCouponCode,
        removeCouponCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
