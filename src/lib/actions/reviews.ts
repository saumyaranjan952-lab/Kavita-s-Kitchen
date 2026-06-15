"use server";

import { db } from "@/lib/db";
import { checkCustomerSession } from "./customerAuth";
import { revalidatePath } from "next/cache";

/**
 * Submits a customer review for a specific dish.
 */
export async function submitDishReview(
  menuItemId: string,
  rating: number,
  text: string,
  guestName?: string,
  guestLocation?: string
) {
  try {
    if (!rating || !text) {
      return { error: "Rating and review text are required." };
    }

    const customer = await checkCustomerSession();
    
    const name = customer ? customer.name : (guestName || "Anonymous");
    const location = guestLocation || "Puri";
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const review = await db.review.create({
      data: {
        userId: customer ? customer.id : null,
        menuItemId,
        name,
        rating: Number(rating),
        text,
        location,
        date: today,
        approved: false, // Moderated
      },
    });

    return { success: true, review };
  } catch (error) {
    console.error("Dish review submission error:", error);
    return { error: "Failed to submit review." };
  }
}

/**
 * Fetches approved reviews for a specific menu item.
 */
export async function getDishReviews(menuItemId: string) {
  try {
    return await db.review.findMany({
      where: {
        menuItemId,
        approved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    return [];
  }
}
