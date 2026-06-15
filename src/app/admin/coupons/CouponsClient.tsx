"use client";

import React, { useState } from "react";
import { 
  Ticket, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Copy, 
  Check, 
  Calendar, 
  DollarSign, 
  Percent, 
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { 
  createCoupon, 
  updateCoupon, 
  deleteCoupon, 
  toggleCouponActive 
} from "@/lib/actions/coupons";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  expiresAt: string;
  active: boolean;
  usageLimit: number | null;
  usageCount: number;
};

interface CouponsClientProps {
  initialCoupons: Coupon[];
}

export default function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState<number | "">("");
  const [minOrderValue, setMinOrderValue] = useState<number | "">("");
  const [maxDiscount, setMaxDiscount] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [usageLimit, setUsageLimit] = useState<number | "">("");

  // Handle opening modal for creation
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode("");
    setType("PERCENTAGE");
    setValue("");
    setMinOrderValue(0);
    setMaxDiscount("");
    
    // Set default expiry to 7 days from now (local timezone formatted for datetime-local)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const tzoffset = futureDate.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(futureDate.getTime() - tzoffset)).toISOString().slice(0, 16);
    setExpiresAt(localISOTime);
    
    setActive(true);
    setUsageLimit("");
    setErrorMsg(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  // Handle opening modal for editing
  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type as "PERCENTAGE" | "FIXED");
    setValue(coupon.value);
    setMinOrderValue(coupon.minOrderValue);
    setMaxDiscount(coupon.maxDiscount !== null ? coupon.maxDiscount : "");
    
    // Format expiration date for input datetime-local
    const expDate = new Date(coupon.expiresAt);
    const tzoffset = expDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(expDate.getTime() - tzoffset)).toISOString().slice(0, 16);
    setExpiresAt(localISOTime);
    
    setActive(coupon.active);
    setUsageLimit(coupon.usageLimit !== null ? coupon.usageLimit : "");
    setErrorMsg(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  // Copy code to clipboard
  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Toggle active switch
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const res = await toggleCouponActive(id, newStatus);
      if (res.success && res.coupon) {
        setCoupons(prev => 
          prev.map(c => c.id === id ? { ...c, active: res.coupon.active } : c)
        );
      } else {
        alert(res.error || "Failed to update coupon status.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  // Delete Coupon
  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete the coupon code "${couponCode}"?`)) {
      return;
    }

    try {
      const res = await deleteCoupon(id);
      if (res.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      } else {
        alert(res.error || "Failed to delete coupon.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  // Form submit (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (!code.trim()) {
      setErrorMsg("Coupon code is required.");
      setIsSubmitting(false);
      return;
    }
    if (value === "" || Number(value) <= 0) {
      setErrorMsg("Discount value must be greater than 0.");
      setIsSubmitting(false);
      return;
    }
    if (!expiresAt) {
      setErrorMsg("Expiration date is required.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: maxDiscount !== "" ? Number(maxDiscount) : null,
      expiresAt: new Date(expiresAt).toISOString(),
      active,
      usageLimit: usageLimit !== "" ? Number(usageLimit) : null,
    };

    try {
      if (editingCoupon) {
        // Edit flow
        const res = await updateCoupon(editingCoupon.id, payload);
        if (res.success && res.coupon) {
          const updated: Coupon = {
            ...res.coupon,
            expiresAt: res.coupon.expiresAt.toISOString(),
          };
          setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? updated : c));
          setSuccessMsg("Coupon updated successfully!");
          setTimeout(() => setModalOpen(false), 1000);
        } else {
          setErrorMsg(res.error || "Failed to update coupon.");
        }
      } else {
        // Create flow
        const res = await createCoupon(payload);
        if (res.success && res.coupon) {
          const created: Coupon = {
            ...res.coupon,
            expiresAt: res.coupon.expiresAt.toISOString(),
          };
          setCoupons(prev => [created, ...prev]);
          setSuccessMsg("Coupon created successfully!");
          setTimeout(() => setModalOpen(false), 1000);
        } else {
          setErrorMsg(res.error || "Failed to create coupon.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
            Coupon Codes
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
            Manage promotional campaigns, fixed and percentage order discounts.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0f3d2e] dark:bg-[#D4AF37] hover:bg-[#1a5f49] dark:hover:bg-[#f3cc59] text-white dark:text-[#072219] rounded-xl font-bold transition-all shadow-sm focus:outline-none cursor-pointer self-start sm:self-auto text-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupon by code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#D4AF37] font-semibold text-gray-700 dark:text-gray-200"
          />
        </div>
        <div className="text-xs font-bold text-gray-400 sm:ml-auto">
          Showing {filteredCoupons.length} of {coupons.length} Coupons
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-zinc-900/50">
                <th className="py-3.5 px-6">Coupon Code</th>
                <th className="py-3.5 px-4">Discount Type</th>
                <th className="py-3.5 px-4">Value</th>
                <th className="py-3.5 px-4">Restrictions</th>
                <th className="py-3.5 px-4">Redemptions</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Active</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-850 font-semibold text-gray-600 dark:text-gray-300">
              {filteredCoupons.map((c) => {
                const isExpired = new Date(c.expiresAt) < new Date();
                
                return (
                  <tr key={c.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-800/10">
                    {/* Code */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 px-2.5 py-1 rounded-md font-bold uppercase border border-gray-200 dark:border-zinc-750">
                          {c.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(c.code)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === c.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Discount Type */}
                    <td className="py-4.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-md text-[10px] uppercase font-black ${
                        c.type === "PERCENTAGE"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}>
                        {c.type === "PERCENTAGE" ? (
                          <>
                            <Percent className="w-2.5 h-2.5" />
                            Percentage
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-2.5 h-2.5" />
                            Fixed Amount
                          </>
                        )}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="py-4.5 px-4 font-serif font-extrabold text-base text-gray-800 dark:text-gray-200">
                      {c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`}
                    </td>

                    {/* Restrictions */}
                    <td className="py-4.5 px-4 text-xs font-medium space-y-1">
                      <div>
                        Min Order: <span className="font-bold text-gray-700 dark:text-gray-300">₹{c.minOrderValue}</span>
                      </div>
                      {c.maxDiscount && (
                        <div>
                          Max Discount: <span className="font-bold text-gray-700 dark:text-gray-300">₹{c.maxDiscount}</span>
                        </div>
                      )}
                    </td>

                    {/* Redemptions */}
                    <td className="py-4.5 px-4 text-xs font-semibold">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-800 dark:text-gray-200 font-bold">{c.usageCount}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-400">{c.usageLimit !== null ? c.usageLimit : "∞"}</span>
                      </div>
                      {c.usageLimit !== null && (
                        <div className="w-16 bg-gray-150 dark:bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, (c.usageCount / c.usageLimit) * 100)}%` }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Expiry */}
                    <td className="py-4.5 px-4 text-xs">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className={isExpired ? "text-red-500 line-through" : "text-gray-600 dark:text-gray-300"}>
                          {new Date(c.expiresAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                      {isExpired && (
                        <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider">
                          Expired
                        </span>
                      )}
                    </td>

                    {/* Active */}
                    <td className="py-4.5 px-4">
                      <button
                        onClick={() => handleToggleActive(c.id, c.active)}
                        className={`focus:outline-none cursor-pointer transition-colors ${
                          c.active ? "text-emerald-500 hover:text-emerald-600" : "text-gray-400 hover:text-gray-500"
                        }`}
                        title={c.active ? "Deactivate" : "Activate"}
                      >
                        {c.active ? (
                          <ToggleRight className="w-9 h-9" strokeWidth={1.5} />
                        ) : (
                          <ToggleLeft className="w-9 h-9" strokeWidth={1.5} />
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-150 dark:hover:bg-zinc-700 border border-gray-250 dark:border-zinc-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors focus:outline-none cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors focus:outline-none cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 italic">
                    No coupons match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
              <h4 className="text-lg font-serif font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
                {editingCoupon ? "Edit Coupon Details" : "Create Promotional Coupon"}
              </h4>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-semibold">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 text-red-600 dark:text-red-450 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/35 text-emerald-650 dark:text-emerald-400 rounded-xl text-xs">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Coupon Code */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WELCOME10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={!!editingCoupon}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#D4AF37] uppercase font-mono disabled:opacity-50"
                  />
                </div>

                {/* Type */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                    Discount Value {type === "PERCENTAGE" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={type === "PERCENTAGE" ? "15" : "100"}
                    value={value}
                    onChange={(e) => setValue(e.target.value !== "" ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Min Order Value */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for no minimum"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value !== "" ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Max Discount */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="None"
                    disabled={type === "FIXED"}
                    value={type === "FIXED" ? "" : maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value !== "" ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#D4AF37] disabled:opacity-50"
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value !== "" ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Active Toggle Option inside Modal */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="modal-active"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0f3d2e] focus:ring-[#D4AF37]"
                  />
                  <label htmlFor="modal-active" className="text-xs text-gray-650 dark:text-gray-350 cursor-pointer select-none">
                    Mark this coupon as active immediately
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border-2 border-gray-200 dark:border-zinc-850 hover:bg-gray-50 dark:hover:bg-zinc-850 rounded-xl text-xs text-gray-600 dark:text-gray-300 font-bold transition-all focus:outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0f3d2e] dark:bg-[#D4AF37] hover:bg-[#1a5f49] dark:hover:bg-[#f3cc59] text-white dark:text-[#072219] rounded-xl text-xs font-bold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
