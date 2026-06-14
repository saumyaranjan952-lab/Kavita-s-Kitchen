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
// BUSINESS CONFIG ACTIONS
// ==========================================

export type BusinessConfigInput = {
  phone: string;
  whatsApp: string;
  instagram: string;
  address: string;
  operatingHours: string;
  heroTitle: string;
  heroSubtitle: string;
};

export async function updateBusinessConfig(input: BusinessConfigInput) {
  try {
    const admin = await requireAuth();

    const config = await db.businessConfig.upsert({
      where: { id: "config" },
      update: input,
      create: {
        id: "config",
        ...input,
      },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "UPDATE_CONFIG",
        details: "Updated business configurations and homepage settings.",
      },
    });

    revalidatePath("/");
    return { success: true, config };
  } catch (error: any) {
    return { error: error.message || "Failed to update config." };
  }
}

// ==========================================
// SUBSCRIPTION PLANS ACTIONS
// ==========================================

export async function updateSubscriptionPlan(id: string, weeklyPrice: number, monthlyPrice: number) {
  try {
    const admin = await requireAuth();
    
    const plan = await db.subscriptionPlan.update({
      where: { id },
      data: {
        weeklyPrice: Number(weeklyPrice),
        monthlyPrice: Number(monthlyPrice),
      },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "UPDATE_SUBSCRIPTION",
        details: `Updated subscription prices for plan '${plan.name}' (Weekly: ₹${weeklyPrice}, Monthly: ₹${monthlyPrice})`,
      },
    });

    revalidatePath("/");
    return { success: true, plan };
  } catch (error: any) {
    return { error: error.message || "Failed to update subscription plan." };
  }
}

// ==========================================
// REVIEWS / TESTIMONIALS ACTIONS
// ==========================================

/**
 * Public review submission (requires approval before appearing on site).
 */
export async function submitReview(name: string, rating: number, text: string, location: string) {
  try {
    if (!name || !rating || !text) {
      return { error: "Name, rating, and review text are required." };
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const id = `rev-${Date.now()}`;

    const review = await db.review.create({
      data: {
        id,
        name,
        rating: Number(rating),
        text,
        location: location || "Puri",
        date: today,
        approved: false, // Must be approved by admin
        isPinned: false,
      },
    });

    return { success: true, review };
  } catch (error: any) {
    console.error("Submit review error:", error);
    return { error: "Failed to submit review. Please try again." };
  }
}

export async function toggleReviewApproval(id: string, approved: boolean) {
  try {
    const admin = await requireAuth();

    const review = await db.review.update({
      where: { id },
      data: { approved },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: approved ? "APPROVE_REVIEW" : "UNAPPROVE_REVIEW",
        details: `${approved ? "Approved" : "Unapproved"} review from '${review.name}'`,
      },
    });

    revalidatePath("/");
    return { success: true, review };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle review approval." };
  }
}

export async function toggleReviewPin(id: string, isPinned: boolean) {
  try {
    const admin = await requireAuth();

    const review = await db.review.update({
      where: { id },
      data: { isPinned },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: isPinned ? "PIN_REVIEW" : "UNPIN_REVIEW",
        details: `${isPinned ? "Pinned" : "Unpinned"} review from '${review.name}'`,
      },
    });

    revalidatePath("/");
    return { success: true, review };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle review pin." };
  }
}

export async function deleteReview(id: string) {
  try {
    const admin = await requireAuth();

    const review = await db.review.delete({
      where: { id },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "DELETE_REVIEW",
        details: `Deleted review from '${review.name}' (ID: ${id})`,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete review." };
  }
}

// ==========================================
// UTILITY & ANALYTICS ACTIONS
// ==========================================

export async function getActivityLogs(limit: number = 50) {
  try {
    await requireAuth();
    return await db.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    return [];
  }
}

export async function getAdminStats() {
  try {
    await requireAuth();

    const [
      menuItemCount,
      categoryCount,
      approvedReviews,
      pendingReviews,
      totalLogs,
    ] = await Promise.all([
      db.menuItem.count(),
      db.category.count(),
      db.review.count({ where: { approved: true } }),
      db.review.count({ where: { approved: false } }),
      db.activityLog.count(),
    ]);

    return {
      menuItemCount,
      categoryCount,
      approvedReviews,
      pendingReviews,
      totalLogs,
    };
  } catch (error) {
    return {
      menuItemCount: 0,
      categoryCount: 0,
      approvedReviews: 0,
      pendingReviews: 0,
      totalLogs: 0,
    };
  }
}
