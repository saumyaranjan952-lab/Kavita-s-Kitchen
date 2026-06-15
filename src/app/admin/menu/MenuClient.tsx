"use client";

import React, { useState, useTransition } from "react";
import { 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  toggleMenuItemField 
} from "@/lib/actions/menu";
import { Plus, Search, Edit2, Trash2, X, Upload, Sparkles, Check, HelpCircle, Copy } from "lucide-react";

type Category = {
  id: string;
  name: string;
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
  order: number;
};

interface MenuClientProps {
  initialCategories: Category[];
  initialMenuItems: MenuItem[];
}

export default function MenuClient({ initialCategories, initialMenuItems }: MenuClientProps) {
  const [categories] = useState<Category[]>(initialCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [vegFilter, setVegFilter] = useState("all"); // all, veg, non-veg

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Form State
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDiscountPrice, setFormDiscountPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formIsChefSpecial, setFormIsChefSpecial] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formAvailability, setFormAvailability] = useState("AVAILABLE");
  const [formOrder, setFormOrder] = useState("0");

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  // Compress image client side
  const compressAndUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    try {
      // 1. Compress Image via HTML5 Canvas
      const compressed = await new Promise<File>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxWidth = 800;
            const maxHeight = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(new File([blob], file.name, { type: "image/jpeg" }));
                } else {
                  reject(new Error("Image compression failed"));
                }
              },
              "image/jpeg",
              0.75
            );
          };
          img.onerror = () => reject(new Error("Image loading failed"));
        };
        reader.onerror = () => reject(new Error("File reading failed"));
      });

      // 2. Upload via API Route
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setFormImage(data.url);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormDiscountPrice("");
    setFormImage("");
    setFormCategoryId(categories[0]?.id || "");
    setFormIsVeg(true);
    setFormIsPopular(false);
    setFormIsChefSpecial(false);
    setFormIsFeatured(false);
    setFormIsBestSeller(false);
    setFormAvailability("AVAILABLE");
    setFormOrder("0");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormPrice(String(item.price));
    setFormDiscountPrice(item.discountPrice ? String(item.discountPrice) : "");
    setFormImage(item.image);
    setFormCategoryId(item.categoryId);
    setFormIsVeg(item.isVeg);
    setFormIsPopular(item.isPopular);
    setFormIsChefSpecial(item.isChefSpecial);
    setFormIsFeatured(item.isFeatured);
    setFormIsBestSeller(item.isBestSeller);
    setFormAvailability(item.availability);
    setFormOrder(String(item.order));
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openDuplicateModal = (item: MenuItem) => {
    setEditingItem(null);
    setFormName(`${item.name} (Copy)`);
    setFormDescription(item.description);
    setFormPrice(String(item.price));
    setFormDiscountPrice(item.discountPrice ? String(item.discountPrice) : "");
    setFormImage(item.image);
    setFormCategoryId(item.categoryId);
    setFormIsVeg(item.isVeg);
    setFormIsPopular(item.isPopular);
    setFormIsChefSpecial(item.isChefSpecial);
    setFormIsFeatured(item.isFeatured);
    setFormIsBestSeller(item.isBestSeller);
    setFormAvailability(item.availability);
    setFormOrder(String(item.order + 1));
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formName || !formPrice || !formCategoryId || !formImage) {
      setErrorMsg("Please fill in all required fields and upload an image.");
      return;
    }

    const payload = {
      name: formName,
      description: formDescription,
      price: Number(formPrice),
      discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
      image: formImage,
      isVeg: formIsVeg,
      isPopular: formIsPopular,
      isChefSpecial: formIsChefSpecial,
      isFeatured: formIsFeatured,
      isBestSeller: formIsBestSeller,
      availability: formAvailability,
      categoryId: formCategoryId,
      order: Number(formOrder),
    };

    startTransition(async () => {
      let res;
      if (editingItem) {
        res = await updateMenuItem(editingItem.id, payload);
      } else {
        res = await createMenuItem(payload);
      }

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        // Refresh local state lists
        if (editingItem) {
          setMenuItems(menuItems.map(i => i.id === editingItem.id ? { ...i, ...payload, discountPrice: payload.discountPrice ?? null } as MenuItem : i));
        } else if (res.item) {
          setMenuItems([...menuItems, res.item as MenuItem]);
        }
        setIsModalOpen(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    const res = await deleteMenuItem(id);
    if (res.success) {
      setMenuItems(menuItems.filter(i => i.id !== id));
    } else {
      alert(res.error || "Failed to delete item.");
    }
  };

  const handleToggleField = async (id: string, field: "isPopular" | "isVeg" | "availability", value: any) => {
    const res = await toggleMenuItemField(id, field, value);
    if (res.success) {
      setMenuItems(menuItems.map(i => i.id === id ? { ...i, [field]: value } : i));
    } else {
      alert(res.error || "Failed to update field status.");
    }
  };

  // Filter local state lists
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesVeg = vegFilter === "all" || 
                       (vegFilter === "veg" && item.isVeg) || 
                       (vegFilter === "non-veg" && !item.isVeg);
    return matchesSearch && matchesCategory && matchesVeg;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative max-w-xs w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Veg Filter */}
          <select
            value={vegFilter}
            onChange={(e) => setVegFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            <option value="all">All Diets</option>
            <option value="veg">🍃 Veg Only</option>
            <option value="non-veg">🍖 Non-Veg Only</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c59b27] text-[#072219] font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Add Dish
        </button>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-zinc-950/20">
                <th className="py-4 px-6">Image / Dish</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Veg</th>
                <th className="py-4 px-6">Popular</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-semibold text-gray-600 dark:text-gray-300">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-zinc-800"
                    />
                    <div>
                      <p className="font-bold text-[#0f3d2e] dark:text-[#FCFAF2] text-sm sm:text-base leading-tight">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 max-w-xs truncate font-medium mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs sm:text-sm">
                    {categories.find(c => c.id === item.categoryId)?.name || item.categoryId}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#0f3d2e] dark:text-[#FCFAF2] font-extrabold font-serif">
                      ₹{item.price}
                    </span>
                    {item.discountPrice && (
                      <span className="text-xs text-gray-400 line-through font-serif ml-1.5">
                        ₹{item.discountPrice}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleField(item.id, "isVeg", !item.isVeg)}
                      className={`w-6 h-6 border-2 rounded flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        item.isVeg ? "border-emerald-600 bg-emerald-500/10" : "border-red-600 bg-red-500/10"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleField(item.id, "isPopular", !item.isPopular)}
                      className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        item.isPopular 
                          ? "bg-amber-500/15 text-amber-600 border border-amber-500/20" 
                          : "bg-gray-100 text-gray-400 dark:bg-zinc-800 border border-transparent"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={item.availability}
                      onChange={(e) => handleToggleField(item.id, "availability", e.target.value)}
                      className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-gray-50 border border-gray-200 text-gray-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 cursor-pointer"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                      <option value="SEASONAL">Seasonal</option>
                      <option value="COMING_SOON">Coming Soon</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openDuplicateModal(item)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                        title="Duplicate Dish"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-semibold">
                    No dishes found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Add / Edit Dish */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-300">
            {/* Modal Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              <h3 className="font-serif text-lg font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Grid 2 Cols */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Authentic Dalma"
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-bold text-sm cursor-pointer text-gray-600 dark:text-gray-300"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Discount Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="120"
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the dish ingredients and authentic cooking process..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                />
              </div>

              {/* Image Upload Block */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Dish Image *
                </label>
                
                {formImage ? (
                  <div className="relative h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800">
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormImage("")}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 hover:border-[#D4AF37] rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 cursor-pointer relative group transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={compressAndUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#D4AF37] mb-2 transition-colors" />
                    <p className="text-xs font-bold text-gray-500 group-hover:text-gray-700 dark:text-zinc-400">
                      {uploading ? "Compressing & Uploading..." : "Click or drag photo here"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">JPEG, PNG up to 5MB (autocompresses)</p>
                  </div>
                )}
              </div>

              {/* Checkboxes Row */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Veg switch */}
                <button
                  type="button"
                  onClick={() => setFormIsVeg(!formIsVeg)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs font-bold transition-all cursor-pointer text-left"
                >
                  <div className={`w-8 h-5 rounded-full p-0.5 shrink-0 transition-colors ${formIsVeg ? "bg-emerald-500" : "bg-gray-300 dark:bg-zinc-700"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formIsVeg ? "translate-x-3" : "translate-x-0"}`} />
                  </div>
                  <span>🍃 Veg Dish</span>
                </button>

                {/* Popular Switch */}
                <button
                  type="button"
                  onClick={() => setFormIsPopular(!formIsPopular)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs font-bold transition-all cursor-pointer text-left"
                >
                  <div className={`w-8 h-5 rounded-full p-0.5 shrink-0 transition-colors ${formIsPopular ? "bg-amber-500" : "bg-gray-300 dark:bg-zinc-700"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formIsPopular ? "translate-x-3" : "translate-x-0"}`} />
                  </div>
                  <span>⭐ Popular</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Availability select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Availability Status
                  </label>
                  <select
                    value={formAvailability}
                    onChange={(e) => setFormAvailability(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-bold text-sm cursor-pointer text-gray-600 dark:text-gray-300"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="SEASONAL">Seasonal</option>
                    <option value="COMING_SOON">Coming Soon</option>
                  </select>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Display Order (Sorting)
                  </label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                  />
                </div>
              </div>

              {/* Extra Badges Row */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100 dark:border-zinc-800/60">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsChefSpecial}
                    onChange={(e) => setFormIsChefSpecial(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] border-gray-300 focus:ring-[#D4AF37] cursor-pointer"
                  />
                  <span>Chef&apos;s Special</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] border-gray-300 focus:ring-[#D4AF37] cursor-pointer"
                  />
                  <span>Featured On Top</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBestSeller}
                    onChange={(e) => setFormIsBestSeller(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] border-gray-300 focus:ring-[#D4AF37] cursor-pointer"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              {/* Modal Buttons */}
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
                      {editingItem ? "Save Changes" : "Create Item"}
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
