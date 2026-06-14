"use client";

import React, { useState, useTransition } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/menu";
import { Plus, Edit2, Trash2, X, Sparkles } from "lucide-react";

type CategoryWithCount = {
  id: string;
  name: string;
  order: number;
  _count: {
    menuItems: number;
  };
};

interface CategoriesClientProps {
  initialCategories: CategoryWithCount[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);

  // Form State
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formOrder, setFormOrder] = useState("0");

  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const openAddModal = () => {
    setEditingCategory(null);
    setFormId("");
    setFormName("");
    setFormOrder(String(categories.length + 1));
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryWithCount) => {
    setEditingCategory(cat);
    setFormId(cat.id);
    setFormName(cat.name);
    setFormOrder(String(cat.order));
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formId || !formName) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      let res;
      if (editingCategory) {
        res = await updateCategory(editingCategory.id, formName, Number(formOrder));
      } else {
        res = await createCategory(formId, formName, Number(formOrder));
      }

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        // Refresh local categories list
        if (editingCategory) {
          setCategories(
            categories.map(c => 
              c.id === editingCategory.id 
                ? { ...c, name: formName, order: Number(formOrder) } 
                : c
            ).sort((a, b) => a.order - b.order)
          );
        } else {
          const newCat: CategoryWithCount = {
            id: formId.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            name: formName,
            order: Number(formOrder),
            _count: { menuItems: 0 },
          };
          setCategories([...categories, newCat].sort((a, b) => a.order - b.order));
        }
        setIsModalOpen(false);
      }
    });
  };

  const handleDelete = async (cat: CategoryWithCount) => {
    const dishCount = cat._count.menuItems;
    const confirmationMsg = dishCount > 0 
      ? `WARNING: This category contains ${dishCount} dish(es)!\nDeleting this category will permanently delete ALL dishes inside it.\n\nAre you absolutely sure you want to proceed?`
      : `Are you sure you want to delete the category '${cat.name}'?`;

    if (!confirm(confirmationMsg)) return;

    const res = await deleteCategory(cat.id);
    if (res.success) {
      setCategories(categories.filter(c => c.id !== cat.id));
    } else {
      alert(res.error || "Failed to delete category.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Categories Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">
          Manage landing page menu categories.
        </span>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c59b27] text-[#072219] font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Add Category
        </button>
      </div>

      {/* Categories list */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-zinc-950/20">
                <th className="py-4 px-6">ID / Slug</th>
                <th className="py-4 px-6">Category Name</th>
                <th className="py-4 px-6">Total Dishes</th>
                <th className="py-4 px-6">Sort Order</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-semibold text-gray-600 dark:text-gray-300">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-6 font-bold text-[#D4AF37]">{cat.id}</td>
                  <td className="py-4 px-6 text-base font-bold text-[#0f3d2e] dark:text-[#FCFAF2]">
                    {cat.name}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-2.5 py-1 text-xs font-bold bg-[#0f3d2e]/10 text-[#0f3d2e] dark:bg-white/10 dark:text-white rounded-lg">
                      {cat._count.menuItems} Dishes
                    </span>
                  </td>
                  <td className="py-4 px-6">{cat.order}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-semibold">
                    No categories found. Click 'Add Category' to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-all duration-300">
            {/* Modal Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              <h3 className="font-serif text-lg font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* ID Input (Slug) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Category ID (Slug URL) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingCategory}
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  placeholder="e.g. odia-specials"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                />
                {!editingCategory && (
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                    Must be lowercase alphanumeric, hyphens allowed. Auto-sanitized on save.
                  </p>
                )}
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Category Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Odia Specials"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                />
              </div>

              {/* Category Order */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Sorting Display Order
                </label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(e.target.value)}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-semibold text-sm"
                />
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
                      {editingCategory ? "Save Changes" : "Create Category"}
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
