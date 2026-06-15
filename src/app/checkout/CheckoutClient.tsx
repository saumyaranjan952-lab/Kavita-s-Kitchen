"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getUserAddresses, createUserAddress, deleteUserAddress } from "@/lib/actions/customer";
import { createOrder, recordSuccessfulPayment, recordFailedPayment } from "@/lib/actions/orders";
import { MapPin, Phone, User, Ticket, CreditCard, ShieldCheck, Check, Info, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Address = {
  id: string;
  recipientName: string;
  phone: string;
  street: string;
  postalCode: string;
  isDefault: boolean;
};

export default function CheckoutClient({ initialData }: { initialData: { categories: any[]; config: any[] } }) {
  const router = useRouter();
  const {
    cart,
    cartTotal,
    discount,
    tax,
    deliveryCharge,
    grandTotal,
    couponCode,
    couponError,
    applyCouponCode,
    removeCouponCode,
    clearCart,
  } = useCart();

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  // New address form inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Coupon inputs
  const [promoInput, setPromoInput] = useState("");
  const [promoSuccessMsg, setPromoSuccessMsg] = useState("");
  const [promoErrorMsg, setPromoErrorMsg] = useState("");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  
  // Razorpay simulator states
  const [simulatedStatus, setSimulatedStatus] = useState<"SELECT" | "PAYING" | "SUCCESS" | "FAILED">("SELECT");
  const [upiIdInput, setUpiIdInput] = useState("");
  const [cardNumberInput, setCardNumberInput] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    // Load customer addresses
    getUserAddresses().then((res) => {
      setAddresses(res);
      const def = res.find((a) => a.isDefault);
      if (def) {
        setSelectedAddressId(def.id);
      } else if (res.length > 0) {
        setSelectedAddressId(res[0].id);
      }
    });
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    if (!name || !phone || !street || !zip) {
      setAddressError("Please fill in all fields.");
      return;
    }

    const res = await createUserAddress(name, phone, street, zip, isDefault);
    if (res.success && res.address) {
      const newAddr = res.address as Address;
      setAddresses((prev) => [newAddr, ...prev]);
      setSelectedAddressId(newAddr.id);
      setShowNewAddressForm(false);
      // Clear inputs
      setName("");
      setPhone("");
      setStreet("");
      setZip("");
      setIsDefault(false);
    } else {
      setAddressError(res.error || "Failed to save address.");
    }
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await deleteUserAddress(id);
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId("");
      }
    }
  };

  const handlePromoApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoErrorMsg("");
    setPromoSuccessMsg("");
    if (!promoInput.trim()) return;

    const ok = await applyCouponCode(promoInput);
    if (ok) {
      setPromoSuccessMsg("Coupon applied successfully!");
      setPromoInput("");
    } else {
      setPromoErrorMsg(couponError || "Invalid promo code.");
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!selectedAddressId) {
      alert("Please select or add a delivery address.");
      return;
    }

    const address = addresses.find((a) => a.id === selectedAddressId);
    if (!address) return;

    setIsSubmitting(true);

    // Call order action to create order in DB
    const res = await createOrder(
      cart.map((i) => ({
        menuItemId: i.id,
        quantity: i.quantity,
        // Optional customizations can be passed here if stored in context
      })),
      {
        recipientName: address.recipientName,
        phone: address.phone,
        street: address.street,
        postalCode: address.postalCode,
      },
      paymentMethod,
      instructions,
      couponCode || undefined
    );

    if (res.success && res.id) {
      setCurrentOrderId(res.id);
      if (paymentMethod === "COD") {
        // COD skips Razorpay, immediately confirm order in DB
        await recordSuccessfulPayment(res.id, `TXN-COD-${Date.now()}`, "COD", res.total || grandTotal);
        clearCart();
        setIsSubmitting(false);
        router.push(`/order-confirmation/${res.id}`);
      } else {
        // Online payments pop up the simulated Razorpay Modal
        setCurrentOrderId(res.id);
        setSimulatedStatus("SELECT");
        setShowRazorpayModal(true);
        setIsSubmitting(false);
      }
    } else {
      alert(res.error || "Order placement failed.");
      setIsSubmitting(false);
    }
  };

  const handleSimulatedPayment = async (success: boolean) => {
    setSimulatedStatus("PAYING");
    setPaymentError("");
    
    // Artificial 2s payment gateway spinner loading
    setTimeout(async () => {
      const transactionId = `TXN-${paymentMethod}-${Date.now()}`;
      if (success) {
        const res = await recordSuccessfulPayment(currentOrderId, transactionId, paymentMethod, grandTotal);
        if (res.success) {
          setSimulatedStatus("SUCCESS");
          clearCart();
          setTimeout(() => {
            setShowRazorpayModal(false);
            router.push(`/order-confirmation/${currentOrderId}`);
          }, 1500);
        } else {
          setSimulatedStatus("FAILED");
          setPaymentError(res.error || "Failed to confirm payment on database.");
        }
      } else {
        await recordFailedPayment(currentOrderId, transactionId, paymentMethod, grandTotal);
        setSimulatedStatus("FAILED");
        setPaymentError("Your payment was declined by the bank.");
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header
        categories={initialData.categories}
        config={initialData.config as any}
        onCartOpen={() => {}}
      />

      <main className="flex-grow py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <button
            onClick={() => router.push("/#menu")}
            className="flex items-center gap-2 text-sm font-bold text-brand-green dark:text-brand-cream hover:text-brand-gold transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </button>

          <h2 className="font-serif text-3xl font-extrabold text-brand-green dark:text-brand-cream mb-8 text-left">
            Complete Your Checkout
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Columns - Address & Payment */}
            <div className="lg:col-span-2 space-y-6 text-left">
              
              {/* 1. Address Section */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                    <h3 className="text-lg font-serif font-extrabold text-brand-green dark:text-brand-cream flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-gold" />
                      Delivery Address
                    </h3>
                    {!showNewAddressForm && (
                      <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="text-xs font-bold text-brand-gold hover:text-brand-gold-dark cursor-pointer transition-colors"
                      >
                        + Add New Address
                      </button>
                    )}
                  </div>

                  {showNewAddressForm ? (
                    <form onSubmit={handleAddAddress} className="space-y-4 bg-gray-100/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-[var(--card-border)]">
                      <h4 className="text-sm font-bold text-brand-green dark:text-brand-cream">New Address Details</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] uppercase font-bold text-brand-gold mb-1">Recipient Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Saumya Ranjan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full text-sm p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase font-bold text-brand-gold mb-1">Contact Phone</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full text-sm p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase font-bold text-brand-gold mb-1">Street Address / Landmark (in Puri)</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="House No., Street Name, Landmark, Puri"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full text-sm p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] uppercase font-bold text-brand-gold mb-1">Postal Code (PIN)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 752001"
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            className="w-full text-sm p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold"
                          />
                        </div>
                        <div className="flex items-center pt-6">
                          <input
                            type="checkbox"
                            id="default-address"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="w-4 h-4 accent-brand-gold rounded focus:ring-0 mr-2 cursor-pointer"
                          />
                          <label htmlFor="default-address" className="text-xs font-bold text-brand-green/80 dark:text-brand-cream/80 cursor-pointer select-none">
                            Set as default address
                          </label>
                        </div>
                      </div>

                      {addressError && <p className="text-xs text-red-500 font-bold">{addressError}</p>}

                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setShowNewAddressForm(false);
                            setAddressError("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button variant="gold" size="sm" type="submit">
                          Save Address
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative group ${
                            selectedAddressId === addr.id
                              ? "border-brand-gold bg-brand-gold/5 shadow-sm"
                              : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-brand-gold"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-extrabold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-brand-gold" />
                              {addr.recipientName}
                            </h4>
                            {selectedAddressId === addr.id && (
                              <span className="p-0.5 rounded-full bg-brand-gold text-brand-green-dark">
                                <Check className="w-3 h-3 stroke-[3px]" />
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-brand-green/80 dark:text-brand-cream/75 font-semibold mt-2 line-clamp-2">
                            {addr.street}, Puri
                          </p>
                          <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider mt-1">
                            PIN: {addr.postalCode}
                          </p>

                          <div className="flex items-center gap-1 mt-3 text-xs font-bold text-brand-green/60 dark:text-brand-cream/60">
                            <Phone className="w-3 h-3" />
                            {addr.phone}
                          </div>

                          {/* Delete */}
                          <button
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="absolute bottom-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ))}

                      {addresses.length === 0 && (
                        <div className="col-span-full py-6 text-center bg-gray-100/40 dark:bg-zinc-900/30 rounded-xl border border-dashed border-[var(--card-border)]">
                          <p className="text-sm text-brand-green/60 dark:text-brand-cream/60 font-semibold mb-2">No saved addresses found.</p>
                          <Button variant="outline" size="sm" onClick={() => setShowNewAddressForm(true)}>
                            Add Address
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2. Payment Method */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-lg font-serif font-extrabold text-brand-green dark:text-brand-cream border-b border-gray-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-gold" />
                    Payment Options
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "UPI", label: "UPI (Google Pay, PhonePe, Paytm)", icon: "📱" },
                      { id: "CARD", label: "Credit / Debit Card", icon: "💳" },
                      { id: "NETBANKING", label: "Net Banking", icon: "🏦" },
                      { id: "COD", label: "Cash on Delivery (COD)", icon: "💵" },
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-brand-gold bg-brand-gold/5"
                            : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-brand-gold"
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div className="text-left">
                          <p className="text-sm font-extrabold text-brand-green dark:text-brand-cream">{method.label}</p>
                          {method.id === "COD" ? (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">No extra charges</p>
                          ) : (
                            <p className="text-[10px] text-brand-gold font-bold uppercase">Razorpay Secure Checkout</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-gold mb-1">Cooking / Delivery Instructions (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Make it spicy, leave at the door..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold"
                    />
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column - Cart Summary */}
            <div className="space-y-6 text-left">
              
              {/* Cart Items List summary */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-serif font-extrabold text-brand-green dark:text-brand-cream border-b border-gray-100 dark:border-zinc-800 pb-3">
                    Order Summary ({cart.length} items)
                  </h3>

                  <div className="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-brand-green dark:text-brand-cream leading-tight">{item.name}</h4>
                            <p className="text-[10px] text-brand-gold font-semibold">x{item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-sm font-serif font-bold text-brand-green dark:text-brand-cream">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Form */}
                  <form onSubmit={handlePromoApply} className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                        <input
                          type="text"
                          placeholder="Promo code (WELCOME50...)"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-bold uppercase"
                        />
                      </div>
                      <Button variant="gold" size="sm" type="submit" className="shrink-0">
                        Apply
                      </Button>
                    </div>

                    {couponCode && (
                      <div className="flex items-center justify-between text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg font-bold border border-emerald-500/20">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Coupon: {couponCode}
                        </span>
                        <button
                          type="button"
                          onClick={removeCouponCode}
                          className="text-red-500 hover:text-red-700 font-extrabold"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {promoSuccessMsg && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{promoSuccessMsg}</p>}
                    {promoErrorMsg && <p className="text-xs text-red-500 font-bold">{promoErrorMsg}</p>}
                  </form>
                </CardContent>
              </Card>

              {/* Bill details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-serif font-extrabold text-brand-green dark:text-brand-cream border-b border-gray-100 dark:border-zinc-800 pb-3">
                    Billing Details
                  </h3>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm font-semibold text-brand-green/80 dark:text-brand-cream/80">
                      <span>Subtotal</span>
                      <span className="font-serif">₹{cartTotal}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        <span>Discount {couponCode ? `(${couponCode})` : ""}</span>
                        <span className="font-serif">-₹{discount}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-semibold text-brand-green/80 dark:text-brand-cream/80">
                      <span>Delivery Fee</span>
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold text-xs">FREE</span>
                      ) : (
                        <span className="font-serif">₹{deliveryCharge}</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm font-semibold text-brand-green/80 dark:text-brand-cream/80">
                      <span>GST (5%)</span>
                      <span className="font-serif">₹{tax}</span>
                    </div>

                    <div className="border-t border-brand-gold/20 pt-3 flex justify-between items-center font-serif text-xl font-black text-brand-green dark:text-brand-cream">
                      <span>Grand Total</span>
                      <span className="text-brand-gold font-extrabold">₹{grandTotal}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="gold"
                      fullWidth
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting || cart.length === 0}
                      shimmer
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Placing Order...
                        </span>
                      ) : (
                        `Pay & Place Order`
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-brand-green/50 dark:text-brand-cream/50 font-bold uppercase tracking-wider text-center pt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                    Secure Payments via Razorpay
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>
        </div>
      </main>

      {/* 3. Razorpay Simulator Overlay */}
      <AnimatePresence>
        {showRazorpayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-colors duration-300"
            >
              {/* Header */}
              <div className="bg-[#0b1f1a] p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37] bg-white flex items-center justify-center shrink-0">
                    <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-serif text-sm font-black tracking-wide">KAVITA&apos;S KITCHEN</h3>
                    <p className="text-[9px] text-[#D4AF37] uppercase font-bold tracking-widest">Razorpay Checkout</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Amount to pay</p>
                  <p className="text-base font-extrabold text-[#D4AF37] font-serif">₹{grandTotal}</p>
                </div>
              </div>

              {/* Content Panel */}
              <div className="p-6 text-left space-y-5 flex-grow">
                {simulatedStatus === "SELECT" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2] border-b border-gray-100 dark:border-zinc-800 pb-2">
                      Simulate Payment Transaction
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                      Select how you want to resolve this simulated online payment. This triggers database callbacks and transaction recordings.
                    </p>

                    {paymentMethod === "UPI" && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-brand-gold">Enter Mock UPI ID</label>
                        <input
                          type="text"
                          placeholder="e.g. customer@okaxis"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none font-bold"
                        />
                      </div>
                    )}

                    {paymentMethod === "CARD" && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold uppercase text-brand-gold">Enter Mock Card Number</label>
                        <input
                          type="text"
                          placeholder="e.g. 4111 2222 3333 4444"
                          value={cardNumberInput}
                          onChange={(e) => setCardNumberInput(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none font-bold"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <Button variant="outline" fullWidth onClick={() => handleSimulatedPayment(false)} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                        Fail Payment
                      </Button>
                      <Button variant="gold" fullWidth onClick={() => handleSimulatedPayment(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-0">
                        Succeed Payment
                      </Button>
                    </div>
                  </div>
                )}

                {simulatedStatus === "PAYING" && (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                    <div>
                      <p className="text-sm font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">Processing Secure Transaction...</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Please do not close this window or hit back</p>
                    </div>
                  </div>
                )}

                {simulatedStatus === "SUCCESS" && (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Check className="w-8 h-8 stroke-[3px]" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Payment Successful!</p>
                      <p className="text-xs text-gray-400 font-semibold mt-1">Confirming order details in database...</p>
                    </div>
                  </div>
                )}

                {simulatedStatus === "FAILED" && (
                  <div className="py-6 space-y-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center text-red-500 text-2xl font-bold">
                        ⚠️
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-red-600 dark:text-red-400">Transaction Failed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">{paymentError || "The mock online transaction failed."}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <Button variant="outline" fullWidth onClick={() => {
                        setShowRazorpayModal(false);
                        setSimulatedStatus("SELECT");
                      }}>
                        Close Drawer
                      </Button>
                      <Button variant="gold" fullWidth onClick={() => setSimulatedStatus("SELECT")}>
                        Retry Payment
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer info lock */}
              <div className="bg-gray-50 dark:bg-zinc-950/60 p-4 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-center font-bold text-gray-400 flex items-center justify-center gap-1.5">
                🔒 Secured by Razorpay PCI-DSS 256-bit encryption
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer
        categories={initialData.categories}
        config={initialData.config as any}
      />
    </div>
  );
}
