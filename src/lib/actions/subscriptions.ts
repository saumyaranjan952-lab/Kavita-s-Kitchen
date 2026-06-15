"use server";

import { db } from "@/lib/db";
import { checkCustomerSession } from "./customerAuth";
import { revalidatePath } from "next/cache";

/**
 * Fetches current customer's subscriptions.
 */
export async function getUserSubscriptions() {
  try {
    const customer = await checkCustomerSession();
    if (!customer) return [];

    return await db.subscription.findMany({
      where: { userId: customer.id },
      include: {
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    return [];
  }
}

/**
 * Creates a new meal subscription.
 */
export async function createSubscription(
  planId: string,
  type: "weekly" | "monthly",
  address: string,
  deliveryTime: string,
  paymentMethod: string
) {
  try {
    const customer = await checkCustomerSession();
    if (!customer) {
      return { error: "Unauthorized. Please log in first." };
    }

    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return { error: "Subscription plan not found." };
    }

    const price = type === "weekly" ? plan.weeklyPrice : plan.monthlyPrice;
    const days = type === "weekly" ? 7 : 30;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const subscription = await db.subscription.create({
      data: {
        userId: customer.id,
        planId: plan.id,
        type,
        status: "ACTIVE",
        endDate,
        amountPaid: price,
        paymentMethod,
        deliveryTime,
        address,
      },
    });

    // Notify Customer
    await db.notification.create({
      data: {
        userId: customer.id,
        title: "Subscription Activated!",
        message: `Your ${plan.name} (${type}) has been successfully activated. Delivery time: ${deliveryTime}.`,
        type: "CUSTOMER_ORDER",
      },
    });

    // Notify Admin
    await db.notification.create({
      data: {
        userId: null,
        title: "New Subscription Signup",
        message: `Customer ${customer.name} signed up for ${plan.name} (${type}).`,
        type: "ADMIN_ALERT",
      },
    });

    revalidatePath("/profile");
    return { success: true, subscription };
  } catch (error) {
    console.error("Subscription create error:", error);
    return { error: "Failed to activate subscription." };
  }
}

/**
 * Cancels a customer's active subscription.
 */
export async function cancelSubscription(id: string) {
  try {
    const customer = await checkCustomerSession();
    if (!customer) {
      return { error: "Unauthorized." };
    }

    const sub = await db.subscription.findUnique({
      where: { id, userId: customer.id },
      include: { plan: true },
    });

    if (!sub) {
      return { error: "Subscription not found." };
    }

    await db.subscription.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    // Notify Customer
    await db.notification.create({
      data: {
        userId: customer.id,
        title: "Subscription Cancelled",
        message: `Your subscription to ${sub.plan.name} was cancelled successfully.`,
        type: "CUSTOMER_ORDER",
      },
    });

    // Notify Admin
    await db.notification.create({
      data: {
        userId: null,
        title: "Subscription Cancelled Alert",
        message: `Customer cancelled subscription to ${sub.plan.name}.`,
        type: "ADMIN_ALERT",
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { error: "Failed to cancel subscription." };
  }
}

/**
 * Admin: Get active subscriptions list.
 */
export async function getAdminSubscriptions() {
  try {
    return await db.subscription.findMany({
      include: {
        plan: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    return [];
  }
}
