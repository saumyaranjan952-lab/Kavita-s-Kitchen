"use server";

import { db } from "@/lib/db";
import { checkCustomerSession, detectIdentifierType } from "./customerAuth";
import { revalidatePath } from "next/cache";

/**
 * Fetches user's saved addresses.
 */
export async function getUserAddresses() {
  try {
    const customer = await checkCustomerSession();
    if (!customer) return [];

    return await db.address.findMany({
      where: { userId: customer.id },
      orderBy: { isDefault: "desc" },
    });
  } catch (error) {
    return [];
  }
}

/**
 * Creates a new address for the user.
 */
export async function createUserAddress(
  recipientName: string,
  phone: string,
  street: string,
  postalCode: string,
  isDefault: boolean = false
) {
  try {
    const customer = await checkCustomerSession();
    if (!customer) {
      return { error: "Unauthorized." };
    }

    if (!recipientName || !phone || !street || !postalCode) {
      return { error: "All address fields are required." };
    }

    // If making default, unset other defaults
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: customer.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: customer.id,
        recipientName,
        phone,
        street,
        postalCode,
        isDefault,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { success: true, address };
  } catch (error) {
    return { error: "Failed to save address." };
  }
}

/**
 * Deletes an address.
 */
export async function deleteUserAddress(id: string) {
  try {
    const customer = await checkCustomerSession();
    if (!customer) {
      return { error: "Unauthorized." };
    }

    await db.address.delete({
      where: { id, userId: customer.id },
    });

    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete address." };
  }
}

/**
 * Updates customer profile information (Name & Phone).
 */
export async function updateCustomerProfile(name: string, phone?: string) {
  try {
    const customer = await checkCustomerSession();
    if (!customer) {
      return { error: "Unauthorized." };
    }

    if (!name || name.trim() === "") {
      return { error: "Name cannot be empty." };
    }

    let normalizedPhone: string | null = null;
    if (phone && phone.trim() !== "") {
      const phoneDetection = await detectIdentifierType(phone);
      if (phoneDetection.type !== "mobile") {
        return { error: "❌ Invalid Mobile Number" };
      }
      normalizedPhone = phoneDetection.normalized;

      // Check if another user is already using this phone number
      const existingPhone = await db.user.findFirst({
        where: {
          phone: normalizedPhone,
          id: { not: customer.id },
        },
      });
      if (existingPhone) {
        return { error: "An account with this phone number already exists." };
      }
    }

    const updated = await db.user.update({
      where: { id: customer.id },
      data: {
        name,
        phone: normalizedPhone,
      },
    });

    revalidatePath("/profile");
    return { success: true, user: updated };
  } catch (error) {
    return { error: "Failed to update profile." };
  }
}

/**
 * Fetches user's favorite menu items.
 */
export async function getUserFavorites() {
  try {
    const customer = await checkCustomerSession();
    if (!customer) return [];

    const favorites = await db.favoriteDish.findMany({
      where: { userId: customer.id },
      include: {
        menuItem: true,
      },
    });

    return favorites.map((f) => f.menuItem);
  } catch (error) {
    return [];
  }
}

/**
 * Toggles a menu item as a favorite.
 */
export async function toggleFavorite(menuItemId: string) {
  try {
    const customer = await checkCustomerSession();
    if (!customer) {
      return { error: "Unauthorized. Please log in first." };
    }

    const existing = await db.favoriteDish.findUnique({
      where: {
        userId_menuItemId: {
          userId: customer.id,
          menuItemId,
        },
      },
    });

    if (existing) {
      await db.favoriteDish.delete({
        where: { id: existing.id },
      });
      return { success: true, favorited: false };
    } else {
      await db.favoriteDish.create({
        data: {
          userId: customer.id,
          menuItemId,
        },
      });
      return { success: true, favorited: true };
    }
  } catch (error) {
    return { error: "Failed to toggle favorite." };
  }
}
