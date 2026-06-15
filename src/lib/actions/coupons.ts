"use server";

import { db } from "@/lib/db";
import { checkSession } from "./auth";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await checkSession();
  if (!session) {
    throw new Error("Unauthorized access. Admin credentials required.");
  }
  return session;
}

export type CouponInput = {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderValue?: number;
  maxDiscount?: number | null;
  expiresAt: string; // ISO String from input type="datetime-local" or similar
  active?: boolean;
  usageLimit?: number | null;
};

/**
 * Fetches all coupons.
 */
export async function getCoupons() {
  try {
    await requireAuth();
    return await db.coupon.findMany({
      orderBy: { expiresAt: "desc" },
    });
  } catch (error: any) {
    console.error("getCoupons error:", error);
    return [];
  }
}

/**
 * Creates a new coupon.
 */
export async function createCoupon(data: CouponInput) {
  try {
    const admin = await requireAuth();

    if (!data.code || !data.value) {
      return { error: "Code and value are required fields." };
    }

    const uppercaseCode = data.code.trim().toUpperCase();

    // Check duplicate code
    const existing = await db.coupon.findUnique({
      where: { code: uppercaseCode },
    });

    if (existing) {
      return { error: `Coupon code '${uppercaseCode}' already exists.` };
    }

    const coupon = await db.coupon.create({
      data: {
        code: uppercaseCode,
        type: data.type,
        value: Number(data.value),
        minOrderValue: Number(data.minOrderValue || 0),
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
        expiresAt: new Date(data.expiresAt),
        active: data.active !== undefined ? data.active : true,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        usageCount: 0,
      },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "CREATE_COUPON",
        details: `Created coupon code: ${uppercaseCode} (${data.type}: ${data.value})`,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, coupon };
  } catch (error: any) {
    return { error: error.message || "Failed to create coupon." };
  }
}

/**
 * Updates an existing coupon.
 */
export async function updateCoupon(id: string, data: Partial<CouponInput>) {
  try {
    const admin = await requireAuth();

    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return { error: "Coupon not found." };
    }

    const updatedData: any = {};
    if (data.code !== undefined) {
      const uppercaseCode = data.code.trim().toUpperCase();
      // check duplicates if changing code
      if (uppercaseCode !== existing.code) {
        const duplicate = await db.coupon.findUnique({ where: { code: uppercaseCode } });
        if (duplicate) {
          return { error: `Coupon code '${uppercaseCode}' already exists.` };
        }
      }
      updatedData.code = uppercaseCode;
    }

    if (data.type !== undefined) updatedData.type = data.type;
    if (data.value !== undefined) updatedData.value = Number(data.value);
    if (data.minOrderValue !== undefined) updatedData.minOrderValue = Number(data.minOrderValue);
    if (data.maxDiscount !== undefined) updatedData.maxDiscount = data.maxDiscount ? Number(data.maxDiscount) : null;
    if (data.expiresAt !== undefined) updatedData.expiresAt = new Date(data.expiresAt);
    if (data.active !== undefined) updatedData.active = data.active;
    if (data.usageLimit !== undefined) updatedData.usageLimit = data.usageLimit ? Number(data.usageLimit) : null;

    const coupon = await db.coupon.update({
      where: { id },
      data: updatedData,
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "UPDATE_COUPON",
        details: `Updated coupon code: ${coupon.code}`,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, coupon };
  } catch (error: any) {
    return { error: error.message || "Failed to update coupon." };
  }
}

/**
 * Deletes a coupon.
 */
export async function deleteCoupon(id: string) {
  try {
    const admin = await requireAuth();

    const coupon = await db.coupon.delete({
      where: { id },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "DELETE_COUPON",
        details: `Deleted coupon code: ${coupon.code}`,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete coupon." };
  }
}

/**
 * Toggles a coupon's active status.
 */
export async function toggleCouponActive(id: string, active: boolean) {
  try {
    const admin = await requireAuth();

    const coupon = await db.coupon.update({
      where: { id },
      data: { active },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "TOGGLE_COUPON",
        details: `Toggled coupon ${coupon.code} active state to ${active}`,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, coupon };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle coupon status." };
  }
}
