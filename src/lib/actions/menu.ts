"use server";

import { db } from "@/lib/db";
import { checkSession } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Checks authentication for all write operations.
 */
async function requireAuth() {
  const session = await checkSession();
  if (!session) {
    throw new Error("Unauthorized access. Admin credentials required.");
  }
  return session;
}

// ==========================================
// CATEGORY ACTIONS
// ==========================================

export async function createCategory(id: string, name: string, order: number = 0) {
  try {
    const admin = await requireAuth();
    if (!id || !name) {
      return { error: "Category ID and Name are required." };
    }

    const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    
    // Check if category already exists
    const existing = await db.category.findUnique({ where: { id: cleanId } });
    if (existing) {
      return { error: `Category with ID '${cleanId}' already exists.` };
    }

    const category = await db.category.create({
      data: { id: cleanId, name, order },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "CREATE_CATEGORY",
        details: `Created category: ${name} (${cleanId})`,
      },
    });

    revalidatePath("/");
    return { success: true, category };
  } catch (error: any) {
    return { error: error.message || "Failed to create category." };
  }
}

export async function updateCategory(id: string, name: string, order: number) {
  try {
    const admin = await requireAuth();
    const category = await db.category.update({
      where: { id },
      data: { name, order },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "UPDATE_CATEGORY",
        details: `Updated category: ${name} (ID: ${id})`,
      },
    });

    revalidatePath("/");
    return { success: true, category };
  } catch (error: any) {
    return { error: error.message || "Failed to update category." };
  }
}

export async function deleteCategory(id: string) {
  try {
    const admin = await requireAuth();
    const category = await db.category.delete({
      where: { id },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "DELETE_CATEGORY",
        details: `Deleted category: ${category.name} (ID: ${id}) and all of its items.`,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete category." };
  }
}

// ==========================================
// MENU ITEM ACTIONS
// ==========================================

export type MenuItemInput = {
  id?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  isVeg: boolean;
  isPopular: boolean;
  isChefSpecial: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  availability: string;
  categoryId: string;
  order?: number;
};

export async function createMenuItem(input: MenuItemInput) {
  try {
    const admin = await requireAuth();
    if (!input.name || !input.price || !input.categoryId) {
      return { error: "Name, price, and category are required." };
    }

    const cleanId = input.id
      ? input.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : input.name.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") + "-" + Date.now();

    const existing = await db.menuItem.findUnique({ where: { id: cleanId } });
    if (existing) {
      return { error: `Menu item with ID '${cleanId}' already exists.` };
    }

    const item = await db.menuItem.create({
      data: {
        id: cleanId,
        name: input.name,
        description: input.description,
        price: Number(input.price),
        discountPrice: input.discountPrice ? Number(input.discountPrice) : null,
        image: input.image,
        isVeg: input.isVeg,
        isPopular: input.isPopular,
        isChefSpecial: input.isChefSpecial,
        isFeatured: input.isFeatured,
        isBestSeller: input.isBestSeller,
        availability: input.availability,
        categoryId: input.categoryId,
        order: input.order || 0,
      },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "CREATE_MENU_ITEM",
        details: `Created menu item: ${item.name} in category ${item.categoryId}`,
      },
    });

    revalidatePath("/");
    return { success: true, item };
  } catch (error: any) {
    return { error: error.message || "Failed to create menu item." };
  }
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
  try {
    const admin = await requireAuth();
    const item = await db.menuItem.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        price: Number(input.price),
        discountPrice: input.discountPrice ? Number(input.discountPrice) : null,
        image: input.image,
        isVeg: input.isVeg,
        isPopular: input.isPopular,
        isChefSpecial: input.isChefSpecial,
        isFeatured: input.isFeatured,
        isBestSeller: input.isBestSeller,
        availability: input.availability,
        categoryId: input.categoryId,
        order: input.order ?? 0,
      },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "UPDATE_MENU_ITEM",
        details: `Updated menu item: ${item.name}`,
      },
    });

    revalidatePath("/");
    return { success: true, item };
  } catch (error: any) {
    return { error: error.message || "Failed to update menu item." };
  }
}

export async function deleteMenuItem(id: string) {
  try {
    const admin = await requireAuth();
    const item = await db.menuItem.delete({
      where: { id },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "DELETE_MENU_ITEM",
        details: `Deleted menu item: ${item.name} (ID: ${id})`,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete menu item." };
  }
}

export async function toggleMenuItemField(id: string, field: "isPopular" | "isVeg" | "availability", value: any) {
  try {
    const admin = await requireAuth();
    const data: Record<string, any> = {};
    data[field] = value;

    const item = await db.menuItem.update({
      where: { id },
      data,
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "TOGGLE_MENU_ITEM_FIELD",
        details: `Updated '${field}' to '${value}' for menu item '${item.name}'`,
      },
    });

    revalidatePath("/");
    return { success: true, item };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle field." };
  }
}
