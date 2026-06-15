import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { X, Star, Flame, Users, Sparkles, ShoppingBag, Send, Check, Info, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDishReviews, submitDishReview } from "@/lib/actions/reviews";
import { checkCustomerSession } from "@/lib/actions/customerAuth";
import { Button } from "@/components/ui/Button";

type CustomizationOption = {
  name: string;
  price: number;
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  image: string;
  isVeg: boolean;
  isPopular: boolean;
  isChefSpecial: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  availability: string;
  categoryId: string;

  // New fields
  rating?: number | null;
  ingredients?: string[];
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  serves?: string | null;
  portionSize?: string | null;
  spiceLevel?: string | null;
  customizations?: any; // Stored as JSON array or object
  relatedItems?: string[];
};

interface FoodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  allMenuItems: MenuItem[];
  onItemClick?: (newItem: MenuItem) => void;
  onCartOpen?: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  allMenuItems,
  onItemClick,
  onCartOpen,
}) => {
  const { addToCart } = useCart();
  const [selectedCustomizations, setSelectedCustomizations] = useState<CustomizationOption[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Dynamic review states
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState<any>(null);
  
  // Review form inputs
  const [reviewText, setReviewText] = useState("");
  const [ratingVal, setRatingVal] = useState(5);
  const [custName, setCustName] = useState("");
  const [custLoc, setCustLoc] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load dynamic reviews for this item
  useEffect(() => {
    if (item?.id) {
      getDishReviews(item.id).then((res) => {
        setReviewsList(res);
      });
      checkCustomerSession().then((user) => {
        setSessionUser(user);
        if (user) {
          setCustName(user.name);
        }
      });
      // Reset form states
      setReviewText("");
      setRatingVal(5);
      setSubmittedSuccess(false);
      setSubmitError("");
    }
  }, [item?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item?.id) return;
    setSubmitError("");
    setSubmittedSuccess(false);

    if (!reviewText.trim()) {
      setSubmitError("Please write a review comment.");
      return;
    }

    setSubmitting(true);
    const res = await submitDishReview(
      item.id,
      ratingVal,
      reviewText,
      sessionUser ? sessionUser.name : custName,
      custLoc || "Puri"
    );
    setSubmitting(false);

    if (res.success) {
      setSubmittedSuccess(true);
      setReviewText("");
      setCustLoc("");
    } else {
      setSubmitError(res.error || "Failed to submit review.");
    }
  };

  // Parse customizations array if it is a JSON string or already parsed array
  const customizationsList: CustomizationOption[] = React.useMemo(() => {
    if (!item?.customizations) return [];
    try {
      if (typeof item.customizations === "string") {
        return JSON.parse(item.customizations);
      }
      if (Array.isArray(item.customizations)) {
        return item.customizations;
      }
    } catch (e) {
      console.error("Failed to parse customizations:", e);
    }
    return [];
  }, [item?.customizations]);

  // Lock page scrolling when details modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset selected customizations on item change
  useEffect(() => {
    setSelectedCustomizations([]);
  }, [item]);

  if (!item) return null;

  const basePrice = item.discountPrice ?? item.price;
  const customizationsPrice = selectedCustomizations.reduce((sum, opt) => sum + opt.price, 0);
  const totalPrice = basePrice + customizationsPrice;

  const handleCustomizationToggle = (option: CustomizationOption) => {
    setSelectedCustomizations((prev) => {
      const exists = prev.find((o) => o.name === option.name);
      if (exists) {
        return prev.filter((o) => o.name !== option.name);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleAddToCart = () => {
    const nameSuffix = selectedCustomizations.length > 0
      ? ` (${selectedCustomizations.map((c) => c.name).join(", ")})`
      : "";
    const compositeId = item.id + (selectedCustomizations.length > 0 ? "-" + selectedCustomizations.map((c) => c.name).join("-") : "");

    addToCart({
      id: compositeId,
      name: item.name + nameSuffix,
      price: totalPrice,
      image: item.image,
      category: item.categoryId,
    });
  };

  const handleOrderNow = () => {
    handleAddToCart();
    onClose();
    if (onCartOpen) {
      setTimeout(() => {
        onCartOpen();
      }, 350);
    }
  };

  const handleWhatsAppOrder = () => {
    const customizationText = selectedCustomizations.length > 0
      ? ` (Customized with: ${selectedCustomizations.map((c) => c.name).join(", ")})`
      : "";
    const message = `*🍽️ KAVITA'S KITCHEN - SINGLE ITEM ORDER*\n==================================\n\nI would like to order:\n• *1x ${item.name}${customizationText}*\n\n*💰 Price:* ₹${totalPrice}\n\nPlease confirm my order. Thank you!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/917848037181?text=${encoded}`, "_blank");
  };

  // Find related items
  const relatedDishes: MenuItem[] = (() => {
    if (item.relatedItems && item.relatedItems.length > 0) {
      return allMenuItems.filter((m) => item.relatedItems?.includes(m.id) && m.id !== item.id);
    }
    // Fallback: items in the same category
    return allMenuItems.filter((m) => m.categoryId === item.categoryId && m.id !== item.id).slice(0, 3);
  })();

  const isAvailable = item.availability.toUpperCase() === "AVAILABLE" || item.availability.toUpperCase() === "SEASONAL";

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md overflow-hidden p-0 md:p-4"
    >
      <motion.div
        ref={modalRef}
        initial={{ y: "100%", opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.5 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full md:max-w-2xl bg-white dark:bg-zinc-900 border-t md:border border-white/20 dark:border-zinc-800 rounded-t-[2.5rem] md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden text-left h-[88vh] md:h-auto md:max-h-[85vh] relative text-gray-800 dark:text-gray-200"
      >
        {/* Top gold header boundary line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-60 z-30" />

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white border border-white/10 transition-all duration-300 cursor-pointer shadow-md"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto pb-32 scrollbar-thin">
          
          {/* 1. Large Image Header */}
          <div className="relative h-60 md:h-72 w-full overflow-hidden shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35 pointer-events-none" />

            {/* Badges Overlay */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {item.isBestSeller && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-orange-400/20">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  Bestseller
                </span>
              )}
              {item.isChefSpecial && (
                <span className="bg-gradient-to-r from-yellow-500 via-[#D4AF37] to-amber-600 text-brand-green-dark text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-yellow-300/20">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Chef Recommended
                </span>
              )}
              {item.isPopular && !item.isBestSeller && (
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-indigo-400/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Popular
                </span>
              )}
            </div>

            {/* Veg indicator badge */}
            <div className="absolute top-4 left-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm border border-gray-200/50 dark:border-zinc-800/40 flex items-center gap-1.5 select-none">
              <span className={`w-3.5 h-3.5 border-2 rounded-md flex items-center justify-center shrink-0 ${item.isVeg ? "border-emerald-600" : "border-red-600"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
              </span>
              <span className="text-[10px] font-black uppercase text-brand-green dark:text-brand-cream">
                {item.isVeg ? "🌱 Veg" : "🍗 Non-Veg"}
              </span>
            </div>
          </div>

          {/* 2. Main Detail Form */}
          <div className="p-5 md:p-6 space-y-6">
            
            {/* Header info */}
            <div className="space-y-2 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div className="flex justify-between items-start gap-4">
                <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-brand-green dark:text-brand-cream">
                  {item.name}
                </h2>
                <div className="text-right shrink-0">
                  {item.discountPrice ? (
                    <div className="space-y-0.5">
                      <span className="text-sm text-gray-400 line-through font-serif">
                        ₹{item.price}
                      </span>
                      <p className="text-2xl font-serif font-black text-brand-gold">
                        ₹{item.discountPrice}
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl font-serif font-black text-brand-gold">
                      ₹{item.price}
                    </p>
                  )}
                </div>
              </div>

              {/* Rating & Availability */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {item.rating ? item.rating.toFixed(1) : "4.8"}/5
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Customer Favorite</span>
                </div>

                <div>
                  {isAvailable ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Available
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Serving Info Section */}
            {(item.serves || item.portionSize || item.spiceLevel) && (
              <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-zinc-950 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 text-center text-xs font-bold shadow-sm">
                {item.serves && (
                  <div className="space-y-1">
                    <Users className="w-4 h-4 mx-auto text-brand-gold" />
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Serves</p>
                    <p className="text-brand-green dark:text-brand-cream">{item.serves}</p>
                  </div>
                )}
                {item.portionSize && (
                  <div className="space-y-1 border-x border-gray-200 dark:border-zinc-800">
                    <span className="text-base block">🍽️</span>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Portion Size</p>
                    <p className="text-brand-green dark:text-brand-cream">{item.portionSize}</p>
                  </div>
                )}
                {item.spiceLevel && (
                  <div className="space-y-1">
                    <Flame className="w-4 h-4 mx-auto text-red-500" />
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Spice Level</p>
                    <p className="text-brand-green dark:text-brand-cream">{item.spiceLevel}</p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">Description</h4>
              <p className="text-sm text-brand-green/80 dark:text-brand-cream/80 font-medium leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Ingredients */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Information */}
            {(item.calories || item.protein || item.carbs || item.fat) && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-brand-gold" />
                  Nutrition Information
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center bg-gray-50/50 dark:bg-zinc-950/40 p-3.5 border border-gray-100 dark:border-zinc-800/60 rounded-xl text-xs font-bold">
                  {item.calories && (
                    <div>
                      <p className="text-brand-green dark:text-brand-cream text-sm">{item.calories}</p>
                      <p className="text-gray-400 text-[9px] uppercase font-semibold mt-0.5">Calories</p>
                    </div>
                  )}
                  {item.protein && (
                    <div>
                      <p className="text-brand-green dark:text-brand-cream text-sm">{item.protein}g</p>
                      <p className="text-gray-400 text-[9px] uppercase font-semibold mt-0.5">Protein</p>
                    </div>
                  )}
                  {item.carbs && (
                    <div>
                      <p className="text-brand-green dark:text-brand-cream text-sm">{item.carbs}g</p>
                      <p className="text-gray-400 text-[9px] uppercase font-semibold mt-0.5">Carbs</p>
                    </div>
                  )}
                  {item.fat && (
                    <div>
                      <p className="text-brand-green dark:text-brand-cream text-sm">{item.fat}g</p>
                      <p className="text-gray-400 text-[9px] uppercase font-semibold mt-0.5">Fat</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customizations Section */}
            {customizationsList.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">Customization Options</h4>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Optional Addons</span>
                </div>
                <div className="space-y-2.5">
                  {customizationsList.map((option, i) => {
                    const isSelected = selectedCustomizations.some((o) => o.name === option.name);
                    return (
                      <button
                        key={i}
                        onClick={() => handleCustomizationToggle(option)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none text-left focus:outline-none ${
                          isSelected
                            ? "bg-brand-gold/15 border-brand-gold text-brand-green dark:text-brand-cream"
                            : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:border-brand-gold/40"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            isSelected ? "bg-brand-gold border-brand-gold text-brand-green-dark" : "border-gray-300 dark:border-zinc-700 bg-transparent"
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
                          </div>
                          {option.name}
                        </span>
                        <span className="text-brand-gold font-serif font-extrabold">+₹{option.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Customer Reviews */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">Customer Reviews ({reviewsList.length})</h4>
              
              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white/40 dark:bg-zinc-900/50 border border-gray-200/55 dark:border-zinc-800/50 rounded-2xl shadow-sm text-xs sm:text-sm text-left relative transition-colors duration-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-brand-green dark:text-brand-cream">{rev.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{rev.location}</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                          <Star className="w-3 h-3 fill-current" />
                          {rev.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-semibold italic">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                    <span className="text-[9px] text-gray-400 font-medium block mt-1.5">{rev.date}</span>
                  </div>
                ))}

                {reviewsList.length === 0 && (
                  <p className="text-xs text-brand-green/50 dark:text-brand-cream/50 font-bold py-2 italic">
                    No reviews for this dish yet. Be the first to rate it!
                  </p>
                )}
              </div>

              {/* Leave a review form */}
              <form onSubmit={handleReviewSubmit} className="p-5 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 rounded-2xl space-y-3 mt-4 text-left">
                <h5 className="text-xs font-bold uppercase text-brand-gold">Rate this Dish</h5>
                
                {!sessionUser && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream"
                    />
                    <input
                      type="text"
                      placeholder="Location (e.g. Puri)"
                      value={custLoc}
                      onChange={(e) => setCustLoc(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream"
                    />
                  </div>
                )}

                {sessionUser && (
                  <div className="flex justify-between items-center text-xs font-bold text-brand-green/80 dark:text-brand-cream/80">
                    <span>Reviewing as: <strong className="text-brand-gold">{sessionUser.name}</strong></span>
                    <input
                      type="text"
                      placeholder="Your Location (Puri)"
                      value={custLoc}
                      onChange={(e) => setCustLoc(e.target.value)}
                      className="text-[10px] px-2 py-1 max-w-[120px] rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream font-bold"
                    />
                  </div>
                )}

                {/* Stars selection */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-brand-green/60 dark:text-brand-cream/60 mr-2 uppercase">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      className="text-amber-500 focus:outline-none cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= ratingVal ? "fill-current" : "text-gray-300 dark:text-zinc-700"}`} />
                    </button>
                  ))}
                </div>

                {/* Comment box */}
                <textarea
                  placeholder="Share your thoughts about this dish..."
                  required
                  rows={2}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none resize-none font-semibold"
                />

                {submittedSuccess && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    Review submitted successfully! It will appear after moderation approval.
                  </p>
                )}
                {submitError && <p className="text-xs text-red-500 font-bold">{submitError}</p>}

                <div className="flex justify-end pt-1">
                  <Button variant="gold" size="xs" type="submit" disabled={submitting} shimmer>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Related Items ("You May Also Like") */}
            {relatedDishes.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">You May Also Like</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedDishes.map((rItem) => (
                    <div
                      key={rItem.id}
                      onClick={() => onItemClick && onItemClick(rItem)}
                      className="group flex flex-col bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer select-none text-left"
                    >
                      <div className="relative h-28 w-full overflow-hidden">
                        <img src={rItem.image} alt={rItem.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                        
                        {/* Rating overlay */}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-amber-400 text-[10px] font-black flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          {rItem.rating ? rItem.rating.toFixed(1) : "4.8"}
                        </div>
                      </div>
                      <div className="p-3 flex-grow flex flex-col justify-between space-y-1.5">
                        <h5 className="text-xs font-bold text-brand-green dark:text-brand-cream line-clamp-1 leading-tight group-hover:text-brand-gold transition-colors duration-300">
                          {rItem.name}
                        </h5>
                        <p className="text-xs font-serif font-black text-brand-gold shrink-0">
                          ₹{rItem.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Sticky Footer Action Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-zinc-900/80 border-t border-gray-100 dark:border-zinc-800 backdrop-blur-lg flex items-center justify-between gap-4 z-40">
          <div className="text-left shrink-0">
            <span className="text-[10px] font-black uppercase text-gray-400 dark:text-zinc-500 tracking-wider">Total Price</span>
            <p className="text-2xl font-serif font-black text-brand-gold leading-none mt-1">
              ₹{totalPrice}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-grow justify-end max-w-sm">
            {isAvailable ? (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4.5 py-3 border-2 border-brand-gold hover:bg-brand-gold hover:text-brand-green-dark text-brand-gold rounded-xl text-xs font-bold cursor-pointer transition-all duration-300 focus:outline-none hover:shadow-md"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  ADD TO CART
                </button>
                <button
                  onClick={handleOrderNow}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4.5 py-3 bg-[#0f3d2e] hover:bg-[#072219] text-[#FCFAF2] border-2 border-[#0f3d2e] hover:border-[#072219] rounded-xl text-xs font-bold cursor-pointer transition-all duration-300 focus:outline-none hover:shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  ORDER NOW
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 rounded-xl text-xs font-bold cursor-not-allowed border border-transparent text-center"
              >
                OUT OF STOCK
              </button>
            )}

            <button
              onClick={handleWhatsAppOrder}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-all duration-300 focus:outline-none hover:shadow-md"
              title="Order directly on WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FoodDetailModal;
