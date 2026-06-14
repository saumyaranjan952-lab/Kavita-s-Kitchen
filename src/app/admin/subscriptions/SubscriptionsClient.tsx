"use client";

import React, { useState, useTransition } from "react";
import { updateSubscriptionPlan } from "@/lib/actions/config";
import { Sparkles, X, Edit2 } from "lucide-react";

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

interface SubscriptionsClientProps {
  initialPlans: SubscriptionPlan[];
}

export default function SubscriptionsClient({ initialPlans }: SubscriptionsClientProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Form State
  const [formWeeklyPrice, setFormWeeklyPrice] = useState("");
  const [formMonthlyPrice, setFormMonthlyPrice] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormWeeklyPrice(String(plan.weeklyPrice));
    setFormMonthlyPrice(String(plan.monthlyPrice));
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formWeeklyPrice || !formMonthlyPrice) {
      setErrorMsg("Please fill in both prices.");
      return;
    }

    if (!editingPlan) return;

    startTransition(async () => {
      const res = await updateSubscriptionPlan(
        editingPlan.id, 
        Number(formWeeklyPrice), 
        Number(formMonthlyPrice)
      );

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setPlans(
          plans.map(p => 
            p.id === editingPlan.id 
              ? { ...p, weeklyPrice: Number(formWeeklyPrice), monthlyPrice: Number(formMonthlyPrice) } 
              : p
          )
        );
        setIsModalOpen(false);
      }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Grid of plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full transition-all duration-300"
          >
            {/* Header image */}
            <div className="h-44 relative overflow-hidden">
              <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#072219] rounded-full">
                  {plan.type}
                </span>
                <h4 className="font-serif font-extrabold text-white text-lg mt-1">
                  {plan.name}
                </h4>
              </div>
            </div>

            {/* Plan Content */}
            <div className="p-6 flex flex-col flex-1 space-y-5 text-left">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-zinc-400 leading-relaxed min-h-[48px]">
                {plan.description}
              </p>

              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/40">
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Weekly</span>
                  <strong className="text-[#0f3d2e] dark:text-brand-cream text-lg font-serif font-black">
                    ₹{plan.weeklyPrice}
                  </strong>
                </div>
                <div className="text-center border-l border-gray-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Monthly</span>
                  <strong className="text-[#D4AF37] text-lg font-serif font-black">
                    ₹{plan.monthlyPrice}
                  </strong>
                </div>
              </div>

              {/* Features list */}
              <div className="flex-1 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Plan Features</span>
                <ul className="space-y-1.5 text-xs text-gray-500 dark:text-zinc-400 font-semibold list-disc list-inside">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="truncate">{feat}</li>
                  ))}
                </ul>
              </div>

              {/* Edit button */}
              <button
                onClick={() => openEditModal(plan)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[#D4AF37] text-[#0f3d2e] dark:text-[#FCFAF2] hover:bg-[#D4AF37] hover:text-[#072219] rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                Change Pricing
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Change plan pricing */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              <h3 className="font-serif text-lg font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
                Edit Plan Prices
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800/60 text-xs sm:text-sm leading-relaxed text-gray-500 font-semibold text-left">
                Adjusting prices for <strong className="text-[#0f3d2e] dark:text-brand-cream">{editingPlan.name}</strong>.
              </div>

              {/* Weekly price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Weekly Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formWeeklyPrice}
                  onChange={(e) => setFormWeeklyPrice(e.target.value)}
                  placeholder="e.g. 650"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                />
              </div>

              {/* Monthly price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Monthly Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formMonthlyPrice}
                  onChange={(e) => setFormMonthlyPrice(e.target.value)}
                  placeholder="e.g. 2400"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-grow flex justify-center items-center gap-2 py-3 bg-[#0f3d2e] hover:bg-[#072219] text-[#FCFAF2] font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Save Prices
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
