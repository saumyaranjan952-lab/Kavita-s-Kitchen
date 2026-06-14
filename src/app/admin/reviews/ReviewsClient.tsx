"use client";

import React, { useState, useTransition } from "react";
import { 
  toggleReviewApproval, 
  toggleReviewPin, 
  deleteReview, 
  submitReview 
} from "@/lib/actions/config";
import { Plus, X, Star, Trash2, CheckCircle2, Pin, ShieldAlert, Sparkles } from "lucide-react";

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  location: string;
  date: string;
  approved: boolean;
  isPinned: boolean;
};

interface ReviewsClientProps {
  initialReviews: Review[];
}

export default function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState("5");
  const [formText, setFormText] = useState("");
  const [formLocation, setFormLocation] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const openAddModal = () => {
    setFormName("");
    setFormRating("5");
    setFormText("");
    setFormLocation("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formName || !formText) {
      setErrorMsg("Please enter both client name and review text.");
      return;
    }

    startTransition(async () => {
      const res = await submitReview(
        formName, 
        Number(formRating), 
        formText, 
        formLocation
      );

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.review) {
        // Since admin created it, let's auto-approve it for comfort
        const approvedRes = await toggleReviewApproval(res.review.id, true);
        const finalReview = approvedRes.success 
          ? { ...(res.review as Review), approved: true } 
          : (res.review as Review);
        
        setReviews([finalReview, ...reviews]);
        setIsModalOpen(false);
      }
    });
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    const res = await toggleReviewApproval(id, !currentStatus);
    if (res.success) {
      setReviews(reviews.map(r => r.id === id ? { ...r, approved: !currentStatus } : r));
    } else {
      alert(res.error || "Failed to update review status.");
    }
  };

  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    const res = await toggleReviewPin(id, !currentStatus);
    if (res.success) {
      setReviews(reviews.map(r => r.id === id ? { ...r, isPinned: !currentStatus } : r));
    } else {
      alert(res.error || "Failed to update review pin status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this testimonial?")) return;

    const res = await deleteReview(id);
    if (res.success) {
      setReviews(reviews.filter(r => r.id !== id));
    } else {
      alert(res.error || "Failed to delete review.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Review Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">
          Moderate customer testimonials and approved reviews list.
        </span>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c59b27] text-[#072219] font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Add Review
        </button>
      </div>

      {/* Reviews list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map(rev => (
          <div 
            key={rev.id} 
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5 text-left transition-colors duration-300"
          >
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif font-extrabold text-base text-[#0f3d2e] dark:text-[#FCFAF2]">
                    {rev.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    {rev.location} • {rev.date}
                  </p>
                </div>
                
                {/* Rating stars */}
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-500" : "text-gray-200 dark:text-zinc-700"}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Review text */}
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-medium leading-relaxed italic">
                &ldquo;{rev.text}&rdquo;
              </p>
            </div>

            {/* Controls panel */}
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Approve Button toggle */}
                <button
                  onClick={() => handleToggleApproval(rev.id, rev.approved)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border transition-colors ${
                    rev.approved 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" 
                      : "bg-amber-500/10 text-amber-600 border-amber-500/25 animate-pulse"
                  }`}
                  title={rev.approved ? "Unapprove Testimonial" : "Approve Testimonial"}
                >
                  {rev.approved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  {rev.approved ? "Approved" : "Pending"}
                </button>

                {/* Pin Button toggle */}
                <button
                  onClick={() => handleTogglePin(rev.id, rev.isPinned)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border transition-colors ${
                    rev.isPinned 
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/25" 
                      : "bg-gray-50 text-gray-400 border-gray-200 dark:bg-zinc-800 dark:border-transparent"
                  }`}
                  title={rev.isPinned ? "Unpin Testimonial" : "Pin to Landing Page Highlights"}
                >
                  <Pin className={`w-3.5 h-3.5 ${rev.isPinned ? "fill-blue-600 rotate-45" : ""}`} />
                  Pinned
                </button>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(rev.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                title="Delete Testimonial"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 font-semibold space-y-2">
            <p>No testimonials found in the database.</p>
            <p className="text-xs text-gray-400 font-medium">Add some testimonials to display them on the live website.</p>
          </div>
        )}
      </div>

      {/* Modal - Add testimonial */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              <h3 className="font-serif text-lg font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
                Add Customer Review
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

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Smaranika Jena"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Location / Subtitle
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Grand Road, Puri"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Rating Stars *
                </label>
                <select
                  value={formRating}
                  onChange={(e) => setFormRating(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-bold text-sm cursor-pointer text-gray-600 dark:text-gray-300"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                  <option value="3">⭐⭐⭐ (3 Stars)</option>
                  <option value="2">⭐⭐ (2 Stars)</option>
                  <option value="1">⭐ (1 Star)</option>
                </select>
              </div>

              {/* Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Review Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Paste what the customer said about Kavita's Kitchen..."
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
                      Add Testimonial
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
