"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  updateCustomerProfile, 
  createUserAddress, 
  deleteUserAddress, 
  toggleFavorite 
} from "@/lib/actions/customer";
import { customerLogout } from "@/lib/actions/customerAuth";
import { cancelSubscription } from "@/lib/actions/subscriptions";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  Heart, 
  LogOut, 
  Phone, 
  Mail, 
  Clock, 
  Check, 
  AlertTriangle,
  Loader2,
  Trash2,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
};

type Address = {
  id: string;
  recipientName: string;
  phone: string;
  street: string;
  postalCode: string;
  isDefault: boolean;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  orderId: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  createdAt: Date;
  orderItems: OrderItem[];
};

type Subscription = {
  id: string;
  plan: {
    id: string;
    name: string;
    description: string;
    image: string;
  };
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
  amountPaid: number;
  deliveryTime: string;
  address: string;
};

type Favorite = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
};

type ProfileClientProps = {
  initialData: {
    categories: any[];
    config: any;
    customer: Customer;
    addresses: Address[];
    orders: Order[];
    subscriptions: Subscription[];
    favorites: Favorite[];
  };
};

export default function ProfileClient({ initialData }: ProfileClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "subscriptions" | "favorites">("profile");

  // Profile data states
  const [customerName, setCustomerName] = useState(initialData.customer.name);
  const [customerPhone, setCustomerPhone] = useState(initialData.customer.phone || "");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState<Address[]>(initialData.addresses);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newZip, setNewZip] = useState("");
  const [newDefault, setNewDefault] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Subscriptions states
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialData.subscriptions);
  const [cancellingSubId, setCancellingSubId] = useState<string | null>(null);

  // Favorites states
  const [favorites, setFavorites] = useState<Favorite[]>(initialData.favorites);

  const handleLogout = async () => {
    const res = await customerLogout();
    if (res.success) {
      router.push("/");
      router.refresh();
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    setUpdatingProfile(true);

    const res = await updateCustomerProfile(customerName, customerPhone);
    setUpdatingProfile(false);

    if (res.success) {
      setProfileSuccessMsg("Profile updated successfully!");
    } else {
      setProfileErrorMsg(res.error || "Failed to update profile.");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");

    if (!newName || !newPhone || !newStreet || !newZip) {
      setAddressError("Please fill in all address fields.");
      return;
    }

    const res = await createUserAddress(newName, newPhone, newStreet, newZip, newDefault);
    if (res.success && res.address) {
      setAddresses((prev) => [res.address as Address, ...prev]);
      setShowAddressForm(false);
      setNewName("");
      setNewPhone("");
      setNewStreet("");
      setNewZip("");
      setNewDefault(false);
    } else {
      setAddressError(res.error || "Failed to add address.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const res = await deleteUserAddress(id);
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleCancelSub = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this meal subscription? This action cannot be undone.")) return;

    setCancellingSubId(id);
    const res = await cancelSubscription(id);
    setCancellingSubId(null);

    if (res.success) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, status: "CANCELLED" } : sub))
      );
    } else {
      alert(res.error || "Failed to cancel subscription.");
    }
  };

  const handleRemoveFavorite = async (itemId: string) => {
    const res = await toggleFavorite(itemId);
    if (res.success) {
      setFavorites((prev) => prev.filter((f) => f.id !== itemId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "OUT_FOR_DELIVERY":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "PREPARING":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 animate-pulse";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 border-gray-200 dark:border-zinc-700";
    }
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "orders", label: "Order History", icon: ShoppingBag },
    { id: "addresses", label: "Address Book", icon: MapPin },
    { id: "subscriptions", label: "Meal Subscriptions", icon: Calendar },
    { id: "favorites", label: "Favorite Dishes", icon: Heart },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header
        categories={initialData.categories}
        config={initialData.config}
        onCartOpen={() => {}}
      />

      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="md:col-span-1 space-y-4 text-left">
              <div className="bg-[#0f3d2e] text-[#FCFAF2] p-6 rounded-3xl border border-white/5 shadow-md">
                <div className="h-12 w-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0f3d2e] font-serif font-black text-xl mb-4 shadow-sm">
                  {initialData.customer.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-serif text-lg font-extrabold text-[#D4AF37] leading-tight truncate">
                  {initialData.customer.name}
                </h3>
                <p className="text-[11px] text-gray-300 font-semibold truncate mt-1">
                  {initialData.customer.email}
                </p>
              </div>

              {/* Tabs list */}
              <nav className="flex flex-col bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-2.5 rounded-3xl shadow-sm transition-colors">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-2xl cursor-pointer transition-all ${
                        isActive
                          ? "bg-brand-gold text-brand-green-dark"
                          : "text-brand-green/80 dark:text-brand-cream/80 hover:bg-gray-100 dark:hover:bg-zinc-800/40 hover:text-brand-gold"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer border-t border-gray-100 dark:border-zinc-800 mt-2 pt-4"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </nav>
            </div>

            {/* Content Display Panels */}
            <div className="md:col-span-3 text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors duration-300"
                >
                  
                  {/* Tab 1 - Profile Details */}
                  {activeTab === "profile" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-serif text-xl font-extrabold text-brand-green dark:text-brand-cream">
                          Profile Settings
                        </h3>
                        <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold mt-1">
                          Update your personal settings and contact number.
                        </p>
                      </div>

                      <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold uppercase text-brand-gold">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                            <input
                              type="text"
                              required
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Enter your full name"
                              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold uppercase text-brand-gold">Email Address (Read-only)</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-green/30" />
                            <input
                              type="email"
                              readOnly
                              value={initialData.customer.email || "No email associated with this account"}
                              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--card-border)] bg-gray-100 dark:bg-zinc-800 text-brand-green dark:text-brand-cream cursor-not-allowed font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold uppercase text-brand-gold">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Enter your phone number"
                              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold"
                            />
                          </div>
                        </div>

                        {profileSuccessMsg && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{profileSuccessMsg}</p>}
                        {profileErrorMsg && <p className="text-xs text-red-500 font-bold">{profileErrorMsg}</p>}

                        <div className="pt-2">
                          <Button variant="gold" size="lg" type="submit" disabled={updatingProfile} className="px-8" shimmer>
                            {updatingProfile ? "Saving..." : "Save Settings"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Tab 2 - Order History */}
                  {activeTab === "orders" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-serif text-xl font-extrabold text-brand-green dark:text-brand-cream">
                          Order History
                        </h3>
                        <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold mt-1">
                          Browse all your past purchases and track active deliveries.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {initialData.orders.map((order) => (
                          <div
                            key={order.id}
                            onClick={() => router.push(`/track-order/${order.id}`)}
                            className="p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-brand-gold transition-all duration-300 cursor-pointer relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                                  {order.orderId}
                                </span>
                                <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 border rounded-md ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              
                              <p className="text-xs text-brand-green/80 dark:text-brand-cream/80 font-bold line-clamp-1 max-w-md">
                                {order.orderItems.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
                              </p>

                              <p className="text-[10px] text-brand-green/50 dark:text-brand-cream/50 font-bold">
                                Placed: {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-brand-gold">Grand Total</p>
                                <p className="text-base font-serif font-extrabold text-brand-green dark:text-brand-cream mt-0.5">₹{order.total}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-brand-gold" />
                            </div>
                          </div>
                        ))}

                        {initialData.orders.length === 0 && (
                          <div className="py-12 text-center space-y-3">
                            <span className="text-3xl text-brand-gold">🍲</span>
                            <p className="text-sm text-brand-green/60 dark:text-brand-cream/60 font-bold">You haven&apos;t placed any orders yet.</p>
                            <Button variant="outline" size="sm" onClick={() => router.push("/#menu")}>
                              Browse Dishes
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 3 - Address Book */}
                  {activeTab === "addresses" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                        <div>
                          <h3 className="font-serif text-xl font-extrabold text-brand-green dark:text-brand-cream">
                            Saved Addresses
                          </h3>
                          <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold mt-1">
                            Manage your delivery destinations in Puri.
                          </p>
                        </div>
                        {!showAddressForm && (
                          <button
                            onClick={() => setShowAddressForm(true)}
                            className="text-xs font-bold text-brand-gold hover:text-brand-gold-dark cursor-pointer focus:outline-none"
                          >
                            + Add Address
                          </button>
                        )}
                      </div>

                      {showAddressForm ? (
                        <form onSubmit={handleAddAddress} className="space-y-4 max-w-lg bg-gray-100/30 dark:bg-zinc-950/20 p-5 rounded-2xl border border-[var(--card-border)]">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">New Delivery Address</h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] uppercase font-bold text-brand-gold mb-1">Recipient Name</label>
                              <input
                                type="text"
                                required
                                placeholder="Enter your full name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] uppercase font-bold text-brand-gold mb-1">Phone Number</label>
                              <input
                                type="tel"
                                required
                                placeholder="Enter your phone number"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] uppercase font-bold text-brand-gold mb-1">Street address / Landmark</label>
                            <textarea
                              required
                              rows={2}
                              placeholder="Landmark name, Street details in Puri"
                              value={newStreet}
                              onChange={(e) => setNewStreet(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] uppercase font-bold text-brand-gold mb-1">Postal Code (PIN)</label>
                              <input
                                type="text"
                                required
                                placeholder="752001"
                                value={newZip}
                                onChange={(e) => setNewZip(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center pt-6">
                              <input
                                type="checkbox"
                                id="default-chk"
                                checked={newDefault}
                                onChange={(e) => setNewDefault(e.target.checked)}
                                className="w-4 h-4 accent-brand-gold rounded focus:ring-0 mr-2 cursor-pointer"
                              />
                              <label htmlFor="default-chk" className="text-xs font-bold text-brand-green/80 dark:text-brand-cream/80 cursor-pointer select-none">
                                Default address
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
                                setShowAddressForm(false);
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
                              className={`p-4 rounded-2xl border text-left flex flex-col justify-between relative group ${
                                addr.isDefault ? "border-brand-gold bg-brand-gold/5" : "border-[var(--card-border)] bg-[var(--card-bg)]"
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-start">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">{addr.recipientName}</h4>
                                  {addr.isDefault && (
                                    <span className="text-[9px] uppercase bg-brand-gold text-brand-green-dark px-1.5 py-0.5 rounded font-black">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-bold text-brand-green/80 dark:text-brand-cream/85 mt-2 leading-relaxed">
                                  {addr.street}, Puri
                                </p>
                                <p className="text-[10px] text-brand-green/50 dark:text-brand-cream/50 font-bold mt-1">
                                  PIN: {addr.postalCode}
                                </p>
                                <p className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 font-bold mt-2 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-brand-gold" />
                                  {addr.phone}
                                </p>
                              </div>

                              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800/60 mt-4">
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer focus:outline-none"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}

                          {addresses.length === 0 && (
                            <div className="col-span-full py-10 text-center bg-gray-100/40 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-[var(--card-border)]">
                              <p className="text-sm text-brand-green/60 dark:text-brand-cream/60 font-bold mb-2">No delivery addresses saved yet.</p>
                              <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                                Add New Address
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 4 - Meal Plans (Subscriptions) */}
                  {activeTab === "subscriptions" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-serif text-xl font-extrabold text-brand-green dark:text-brand-cream">
                          Meal Subscriptions
                        </h3>
                        <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold mt-1">
                          Track daily office/student meal subscriptions and scheduling.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {subscriptions.map((sub) => {
                          const isCancelled = sub.status === "CANCELLED";
                          const isExpired = new Date(sub.endDate) < new Date();
                          
                          return (
                            <div
                              key={sub.id}
                              className="p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col sm:flex-row justify-between items-start gap-4 relative text-left"
                            >
                              <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-zinc-800">
                                  <img src={sub.plan.image} alt={sub.plan.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-extrabold text-brand-green dark:text-brand-cream">{sub.plan.name}</h4>
                                  <div className="flex gap-2 items-center flex-wrap">
                                    <span className="text-[10px] uppercase font-black text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded">
                                      {sub.type} Plan
                                    </span>
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                                      isCancelled
                                        ? "bg-red-500/10 text-red-600"
                                        : isExpired
                                        ? "bg-gray-100 text-gray-400 dark:bg-zinc-800"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    }`}>
                                      {isCancelled ? "Cancelled" : isExpired ? "Expired" : "Active"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 font-bold pt-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-brand-gold" />
                                    Delivery Time: {sub.deliveryTime}
                                  </p>
                                  <p className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 font-bold flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                                    Deliver to: {sub.address.substring(0, 40)}...
                                  </p>
                                </div>
                              </div>

                              <div className="sm:text-right flex flex-col justify-between h-full sm:self-stretch">
                                <div>
                                  <p className="text-[10px] font-bold text-brand-gold uppercase">Expires</p>
                                  <p className="text-xs font-bold text-brand-green dark:text-brand-cream mt-0.5">
                                    {new Date(sub.endDate).toLocaleDateString()}
                                  </p>
                                </div>

                                {!isCancelled && !isExpired && (
                                  <button
                                    onClick={() => handleCancelSub(sub.id)}
                                    disabled={cancellingSubId === sub.id}
                                    className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider mt-4 cursor-pointer focus:outline-none disabled:opacity-50"
                                  >
                                    {cancellingSubId === sub.id ? "Cancelling..." : "Cancel Plan"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {subscriptions.length === 0 && (
                          <div className="py-12 text-center space-y-3">
                            <span className="text-3xl text-brand-gold">📅</span>
                            <p className="text-sm text-brand-green/60 dark:text-brand-cream/60 font-bold">You don&apos;t have any active meal plans.</p>
                            <Button variant="outline" size="sm" onClick={() => router.push("/#subscriptions")}>
                              Explore Subscription Plans
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 5 - Favorite Dishes */}
                  {activeTab === "favorites" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-serif text-xl font-extrabold text-brand-green dark:text-brand-cream">
                          Favorite Dishes
                        </h3>
                        <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold mt-1">
                          Reorder your most-loved Odia items instantly.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {favorites.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex gap-4 text-left relative group"
                          >
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-extrabold text-brand-green dark:text-brand-cream leading-tight">{item.name}</h4>
                                <p className="text-sm font-serif font-extrabold text-brand-gold mt-1">₹{item.price}</p>
                              </div>

                              <div className="flex gap-3 pt-2">
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => addToCart({
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                    image: item.image,
                                    category: item.categoryId
                                  })}
                                >
                                  Add to Cart
                                </Button>
                              </div>
                            </div>

                            {/* Remove Heart */}
                            <button
                              onClick={() => handleRemoveFavorite(item.id)}
                              className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1 cursor-pointer focus:outline-none"
                              title="Remove from favorites"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {favorites.length === 0 && (
                          <div className="col-span-full py-12 text-center space-y-3">
                            <span className="text-3xl text-brand-gold">❤️</span>
                            <p className="text-sm text-brand-green/60 dark:text-brand-cream/60 font-bold">Your favorites list is empty.</p>
                            <Button variant="outline" size="sm" onClick={() => router.push("/#menu")}>
                              Browse Menu
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>

      <Footer
        categories={initialData.categories}
        config={initialData.config}
      />
    </div>
  );
}
