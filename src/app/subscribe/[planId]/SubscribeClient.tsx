"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { createUserAddress } from "@/lib/actions/customer";
import { createSubscription } from "@/lib/actions/subscriptions";
import { MapPin, Phone, User, Calendar, CreditCard, ShieldCheck, Check, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Address = {
  id: string;
  recipientName: string;
  phone: string;
  street: string;
  postalCode: string;
  isDefault: boolean;
};

type Plan = {
  id: string;
  name: string;
  description: string;
  weeklyPrice: number;
  monthlyPrice: number;
  image: string;
  features: string[];
  type: string;
};

type SubscribeClientProps = {
  initialData: {
    categories: any[];
    config: any;
    plan: Plan;
    addresses: Address[];
    cycle: "weekly" | "monthly";
  };
};

export default function SubscribeClient({ initialData }: SubscribeClientProps) {
  const router = useRouter();
  const plan = initialData.plan;

  const [billingCycle, setBillingCycle] = useState<"weekly" | "monthly">(initialData.cycle);
  const [addresses, setAddresses] = useState<Address[]>(initialData.addresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    initialData.addresses.find((a) => a.isDefault)?.id || initialData.addresses[0]?.id || ""
  );

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [addressError, setAddressError] = useState("");

  // Delivery slot states
  const [deliveryTime, setDeliveryTime] = useState("Lunch (12:30 PM - 1:30 PM)");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [simulatedStatus, setSimulatedStatus] = useState<"SELECT" | "PAYING" | "SUCCESS" | "FAILED">("SELECT");
  const [paymentError, setPaymentError] = useState("");

  const currentPrice = billingCycle === "weekly" ? plan.weeklyPrice : plan.monthlyPrice;

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    if (!name || !phone || !street || !zip) {
      setAddressError("Please fill in all address fields.");
      return;
    }

    const res = await createUserAddress(name, phone, street, zip, false);
    if (res.success && res.address) {
      const newAddr = res.address as Address;
      setAddresses((prev) => [newAddr, ...prev]);
      setSelectedAddressId(newAddr.id);
      setShowAddressForm(false);
      setName("");
      setPhone("");
      setStreet("");
      setZip("");
    } else {
      setAddressError(res.error || "Failed to save address.");
    }
  };

  const handlePlaceSubscription = async () => {
    if (!selectedAddressId) {
      alert("Please select or add a delivery address.");
      return;
    }

    const address = addresses.find((a) => a.id === selectedAddressId);
    if (!address) return;

    setIsSubmitting(true);

    if (paymentMethod === "COD") {
      const fullAddress = `${address.recipientName}, Phone: ${address.phone}, ${address.street}, PIN: ${address.postalCode}`;
      const res = await createSubscription(
        plan.id,
        billingCycle,
        fullAddress,
        deliveryTime,
        "COD"
      );
      setIsSubmitting(false);

      if (res.success) {
        router.push("/profile");
      } else {
        alert(res.error || "Failed to create subscription.");
      }
    } else {
      // Trigger Razorpay simulator
      setSimulatedStatus("SELECT");
      setShowRazorpayModal(true);
      setIsSubmitting(false);
    }
  };

  const handleSimulatedPayment = async (success: boolean) => {
    setSimulatedStatus("PAYING");
    setPaymentError("");

    setTimeout(async () => {
      if (success) {
        const address = addresses.find((a) => a.id === selectedAddressId);
        if (!address) return;

        const fullAddress = `${address.recipientName}, Phone: ${address.phone}, ${address.street}, PIN: ${address.postalCode}`;
        const res = await createSubscription(
          plan.id,
          billingCycle,
          fullAddress,
          deliveryTime,
          paymentMethod
        );

        if (res.success) {
          setSimulatedStatus("SUCCESS");
          setTimeout(() => {
            setShowRazorpayModal(false);
            router.push("/profile");
          }, 1500);
        } else {
          setSimulatedStatus("FAILED");
          setPaymentError(res.error || "Failed to activate subscription.");
        }
      } else {
        setSimulatedStatus("FAILED");
        setPaymentError("Your simulated payment was declined.");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header
        categories={initialData.categories}
        config={initialData.config}
        onCartOpen={() => {}}
      />

      <main className="flex-grow py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-brand-green dark:text-brand-cream hover:text-brand-gold transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h2 className="font-serif text-3xl font-extrabold text-brand-green dark:text-brand-cream mb-8 text-left">
            Subscribe: {plan.name}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6 text-left">
              
              {/* Cycle Selection */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase text-brand-gold">Choose Billing Cycle</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setBillingCycle("weekly")}
                      className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                        billingCycle === "weekly"
                          ? "border-brand-gold bg-brand-gold/5"
                          : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-brand-gold"
                      }`}
                    >
                      <span className="text-base font-extrabold text-brand-green dark:text-brand-cream">Weekly Cycle</span>
                      <span className="text-lg font-serif font-black text-brand-gold mt-1">₹{plan.weeklyPrice}</span>
                      <span className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 font-semibold mt-1">Delivered daily for 7 days</span>
                    </button>
                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                        billingCycle === "monthly"
                          ? "border-brand-gold bg-brand-gold/5"
                          : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-brand-gold"
                      }`}
                    >
                      <span className="text-base font-extrabold text-brand-green dark:text-brand-cream">Monthly Cycle</span>
                      <span className="text-lg font-serif font-black text-brand-gold mt-1">₹{plan.monthlyPrice}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase mt-1">Save up to 15%</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Address Selection */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold uppercase text-brand-gold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Destination
                    </h3>
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="text-xs font-bold text-brand-gold hover:text-brand-gold-dark cursor-pointer"
                      >
                        + Add Address
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <form onSubmit={handleAddAddress} className="space-y-4 bg-gray-100/50 dark:bg-zinc-900/50 p-4 rounded-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Recipient Name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream"
                        />
                      </div>
                      <textarea
                        placeholder="Street Address in Puri"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream resize-none h-16"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="PIN Code"
                          required
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" type="button" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                          <Button variant="gold" size="sm" type="submit">Save</Button>
                        </div>
                      </div>
                      {addressError && <p className="text-xs text-red-500 font-bold">{addressError}</p>}
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? "border-brand-gold bg-brand-gold/5"
                              : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-brand-gold"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold uppercase text-brand-gold">{addr.recipientName}</h4>
                            {selectedAddressId === addr.id && <span className="text-xs text-[#D4AF37]">✓ Selected</span>}
                          </div>
                          <p className="text-xs font-semibold text-brand-green/80 dark:text-brand-cream/80 mt-2">{addr.street}</p>
                          <p className="text-[10px] text-brand-green/50 dark:text-brand-cream/50 font-semibold mt-1">PIN: {addr.postalCode}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Timing */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase text-brand-gold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Preferred Delivery Slot
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "Lunch (12:30 PM - 1:30 PM)", label: "Lunch Delivery", desc: "12:30 PM - 1:30 PM" },
                      { id: "Dinner (7:30 PM - 8:30 PM)", label: "Dinner Delivery", desc: "7:30 PM - 8:30 PM" },
                    ].map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => setDeliveryTime(slot.id)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          deliveryTime === slot.id
                            ? "border-brand-gold bg-brand-gold/5"
                            : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-brand-gold"
                        }`}
                      >
                        <h4 className="text-sm font-extrabold text-brand-green dark:text-brand-cream">{slot.label}</h4>
                        <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold mt-1">{slot.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment selection */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase text-brand-gold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "UPI", label: "UPI (Google Pay, Paytm, PhonePe)" },
                      { id: "CARD", label: "Credit/Debit Card" },
                      { id: "COD", label: "Cash on Delivery (COD)" },
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-brand-gold bg-brand-gold/5"
                            : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-brand-gold"
                        }`}
                      >
                        <p className="text-sm font-extrabold text-brand-green dark:text-brand-cream">{method.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column */}
            <div className="space-y-6 text-left">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-serif font-extrabold text-brand-green dark:text-brand-cream border-b border-gray-100 dark:border-zinc-800 pb-3">
                    Subscription Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between font-semibold text-sm text-brand-green/80 dark:text-brand-cream/80">
                      <span>Plan Name:</span>
                      <span>{plan.name}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sm text-brand-green/80 dark:text-brand-cream/80">
                      <span>Cycle:</span>
                      <span className="capitalize">{billingCycle}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sm text-brand-green/80 dark:text-brand-cream/80">
                      <span>Timing:</span>
                      <span>{deliveryTime.split(" ")[0]}</span>
                    </div>
                    <div className="border-t border-brand-gold/20 pt-3 flex justify-between font-serif text-xl font-black text-brand-green dark:text-brand-cream">
                      <span>Amount:</span>
                      <span className="text-brand-gold">₹{currentPrice}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="gold"
                      fullWidth
                      size="lg"
                      onClick={handlePlaceSubscription}
                      disabled={isSubmitting}
                      shimmer
                    >
                      {isSubmitting ? "Processing..." : "Subscribe Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>

      {/* Simulated Razorpay Overlay */}
      <AnimatePresence>
        {showRazorpayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="bg-[#0b1f1a] p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37] bg-white flex items-center justify-center shrink-0">
                    <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-serif text-sm font-black text-[#D4AF37]">RAZORPAY SECURE</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Amount</p>
                  <p className="text-base font-extrabold text-[#D4AF37] font-serif">₹{currentPrice}</p>
                </div>
              </div>

              <div className="p-6 text-left space-y-4">
                {simulatedStatus === "SELECT" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2] border-b border-gray-100 dark:border-zinc-800 pb-2">
                      Simulate Subscription Payment
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      Please simulate online credit checkout validation status:
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={() => handleSimulatedPayment(false)} className="border-red-200 text-red-600 hover:bg-red-50">
                        Fail Payment
                      </Button>
                      <Button variant="gold" onClick={() => handleSimulatedPayment(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-0">
                        Succeed Payment
                      </Button>
                    </div>
                  </div>
                )}

                {simulatedStatus === "PAYING" && (
                  <div className="py-8 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
                    <p className="text-xs font-bold text-gray-500">Contacting bank servers...</p>
                  </div>
                )}

                {simulatedStatus === "SUCCESS" && (
                  <div className="py-8 text-center space-y-3 text-emerald-600">
                    <Check className="w-10 h-10 mx-auto stroke-[3px]" />
                    <p className="text-sm font-extrabold">Plan Activated Successfully!</p>
                  </div>
                )}

                {simulatedStatus === "FAILED" && (
                  <div className="py-6 text-center space-y-4">
                    <p className="text-sm font-extrabold text-red-600">Transaction Failed</p>
                    <p className="text-xs text-gray-500">{paymentError}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" fullWidth size="sm" onClick={() => setShowRazorpayModal(false)}>Close</Button>
                      <Button variant="gold" fullWidth size="sm" onClick={() => setSimulatedStatus("SELECT")}>Retry</Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer
        categories={initialData.categories}
        config={initialData.config}
      />
    </div>
  );
}
