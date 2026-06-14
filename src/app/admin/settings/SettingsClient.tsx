"use client";

import React, { useState, useTransition } from "react";
import { updateBusinessConfig, BusinessConfigInput } from "@/lib/actions/config";
import { Sparkles, Save, Check } from "lucide-react";

type BusinessConfig = {
  phone: string;
  whatsApp: string;
  instagram: string;
  address: string;
  operatingHours: string;
  heroTitle: string;
  heroSubtitle: string;
} | null;

interface SettingsClientProps {
  initialConfig: BusinessConfig;
}

export default function SettingsClient({ initialConfig }: SettingsClientProps) {
  // Form State
  const [phone, setPhone] = useState(initialConfig?.phone || "");
  const [whatsApp, setWhatsApp] = useState(initialConfig?.whatsApp || "");
  const [instagram, setInstagram] = useState(initialConfig?.instagram || "");
  const [address, setAddress] = useState(initialConfig?.address || "");
  const [operatingHours, setOperatingHours] = useState(initialConfig?.operatingHours || "");
  const [heroTitle, setHeroTitle] = useState(initialConfig?.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState(initialConfig?.heroSubtitle || "");

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");

    const payload: BusinessConfigInput = {
      phone,
      whatsApp,
      instagram,
      address,
      operatingHours,
      heroTitle,
      heroSubtitle,
    };

    startTransition(async () => {
      const res = await updateBusinessConfig(payload);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    });
  };

  return (
    <div className="max-w-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm text-left transition-colors duration-300">
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alerts */}
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-semibold rounded-xl text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            {message}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Section: Landing Page Copy */}
        <div className="space-y-4">
          <h4 className="font-serif text-base font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2] border-b border-gray-100 dark:border-zinc-800 pb-2">
            Homepage Hero Texts
          </h4>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Hero Section Title *
            </label>
            <input
              type="text"
              required
              value={heroTitle}
              onChange={(e) => setFormValue(e.target.value, setHeroTitle)}
              placeholder="e.g. Authentic Homemade Food in Puri"
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Hero Section Subtitle *
            </label>
            <input
              type="text"
              required
              value={heroSubtitle}
              onChange={(e) => setFormValue(e.target.value, setHeroSubtitle)}
              placeholder="e.g. Fresh • Hygienic • Delicious"
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
            />
          </div>
        </div>

        {/* Section: Contact Details */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800/60">
          <h4 className="font-serif text-base font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2] border-b border-gray-100 dark:border-zinc-800 pb-2">
            Contact & Location Settings
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Display Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setFormValue(e.target.value, setPhone)}
                placeholder="e.g. +91 78480 37181"
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                WhatsApp API Code *
              </label>
              <input
                type="text"
                required
                value={whatsApp}
                onChange={(e) => setFormValue(e.target.value, setWhatsApp)}
                placeholder="e.g. 917848037181 (digits only, include country code)"
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Instagram Profile Username *
              </label>
              <input
                type="text"
                required
                value={instagram}
                onChange={(e) => setFormValue(e.target.value, setInstagram)}
                placeholder="e.g. kavita.kitchen_"
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Operating Hours (Clock text) *
              </label>
              <input
                type="text"
                required
                value={operatingHours}
                onChange={(e) => setFormValue(e.target.value, setOperatingHours)}
                placeholder="e.g. Daily Cooking: 10:00 AM - 10:00 PM"
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Physical Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setFormValue(e.target.value, setAddress)}
              placeholder="e.g. Puri, Odisha, India"
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/60">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-[#0f3d2e] hover:bg-[#072219] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <span>Saving Configurations...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  function setFormValue(value: string, setter: React.Dispatch<React.SetStateAction<string>>) {
    setter(value);
  }
}
