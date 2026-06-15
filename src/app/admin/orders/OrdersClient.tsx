"use client";

import React, { useState } from "react";
import { updateOrderStatus, updateOrderPaymentStatus } from "@/lib/actions/orders";
import { Card, CardContent } from "@/components/ui/Card";
import { Search, Eye, ShoppingBag, MapPin, CreditCard, ChevronRight, X, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: any;
};

type User = {
  name: string;
  email: string;
  phone: string | null;
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
  instructions: string | null;
  createdAt: Date;
  orderItems: OrderItem[];
  user: User;
};

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Status update loaders
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const res = await updateOrderStatus(id, newStatus);
    setUpdatingId(null);

    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } else {
      alert(res.error || "Failed to update order status.");
    }
  };

  const handlePaymentStatusChange = async (id: string, newPayStatus: string) => {
    setUpdatingId(id);
    const res = await updateOrderPaymentStatus(id, newPayStatus);
    setUpdatingId(null);

    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, paymentStatus: newPayStatus } : o))
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, paymentStatus: newPayStatus } : null);
      }
    } else {
      alert(res.error || "Failed to update payment status.");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "ALL" ? true : o.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-2xl font-serif font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
          Manage Orders
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
          Review details, accept requests, track preparation, and manage payment milestones.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-brand-green dark:text-brand-cream focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none font-semibold">
          {[
            { id: "ALL", label: "All" },
            { id: "PENDING", label: "Pending" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "PREPARING", label: "Preparing" },
            { id: "OUT_FOR_DELIVERY", label: "Out" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-brand-gold text-brand-green-dark"
                  : "bg-white dark:bg-zinc-900 text-gray-500 hover:text-brand-gold border border-gray-200 dark:border-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-zinc-900/50">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-850 font-semibold text-gray-600 dark:text-gray-300">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-800/10">
                  <td className="py-4 px-4 text-[#D4AF37] font-black">{o.orderId}</td>
                  <td className="py-4 px-4 truncate max-w-[120px]">{o.user.name}</td>
                  <td className="py-4 px-4 font-serif font-extrabold">₹{o.total}</td>
                  <td className="py-4 px-4 uppercase text-[10px] tracking-wider text-brand-gold">{o.paymentMethod}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-0.5 border rounded-md text-[9px] uppercase font-black ${getStatusBadge(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-400 hover:text-brand-gold bg-white dark:bg-zinc-900 cursor-pointer"
                      title="View Order"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="text-xs p-1 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-brand-green dark:text-brand-cream focus:outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                    No matching orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#0f3d2e] p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-gold" />
                  <h3 className="font-serif text-lg font-extrabold text-[#D4AF37]">Order Details: {selectedOrder.orderId}</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-300 hover:text-white p-1 rounded-full cursor-pointer focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                
                {/* 1. Customer contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 dark:border-zinc-850 pb-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <p className="text-brand-gold uppercase tracking-wider text-[10px]">Customer Name</p>
                    <p className="text-sm font-extrabold text-brand-green dark:text-brand-cream">{selectedOrder.user.name}</p>
                    <p className="text-gray-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{selectedOrder.user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-brand-gold uppercase tracking-wider text-[10px]">Delivery Contact</p>
                    <p className="text-sm font-extrabold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-gold" />
                      {selectedOrder.user.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* 2. Destination */}
                <div className="space-y-1 border-b border-gray-100 dark:border-zinc-850 pb-4 text-xs font-semibold">
                  <p className="text-brand-gold uppercase tracking-wider text-[10px] flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Address Details</p>
                  <p className="text-sm text-brand-green/80 dark:text-brand-cream/80 leading-relaxed font-bold">{selectedOrder.deliveryAddress}</p>
                  {selectedOrder.instructions && (
                    <p className="italic bg-gray-50 dark:bg-zinc-950 p-2 rounded-lg text-brand-green/75 dark:text-brand-cream/70 mt-2">
                      <strong>Cooking Notes:</strong> &ldquo;{selectedOrder.instructions}&rdquo;
                    </p>
                  )}
                </div>

                {/* 3. Items list */}
                <div className="space-y-3 border-b border-gray-100 dark:border-zinc-850 pb-4">
                  <p className="text-brand-gold uppercase tracking-wider text-[10px] font-bold">Dishes Stack</p>
                  <div className="divide-y divide-gray-50 dark:divide-zinc-850 text-xs sm:text-sm font-semibold">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-brand-green dark:text-brand-cream">{item.name}</span>
                          <span className="text-brand-gold font-bold ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-serif text-brand-green dark:text-brand-cream font-bold">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Controls / Action Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-bold">
                  <div className="space-y-1">
                    <label className="block text-brand-gold uppercase text-[10px]">Change Order Status</label>
                    <select
                      value={selectedOrder.status}
                      disabled={updatingId === selectedOrder.id}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-brand-green dark:text-brand-cream focus:outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-brand-gold uppercase text-[10px]">Change Payment Status</label>
                    <select
                      value={selectedOrder.paymentStatus}
                      disabled={updatingId === selectedOrder.id}
                      onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-brand-green dark:text-brand-cream focus:outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid / Success</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
