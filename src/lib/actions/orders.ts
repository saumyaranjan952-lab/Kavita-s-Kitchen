"use server";

import { db } from "@/lib/db";
import { checkCustomerSession } from "./customerAuth";
import { checkSession as checkAdminSession } from "./auth";
import { revalidatePath } from "next/cache";

/**
 * Generates a unique, human-friendly order ID (e.g. KK-184752)
 */
function generateOrderNumber(): string {
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  return `KK-${digits}`;
}

export type OrderItemInput = {
  menuItemId: string;
  quantity: number;
  customizations?: { name: string; price: number }[];
};

/**
 * Creates a new order.
 */
export async function createOrder(
  items: OrderItemInput[],
  addressDetails: {
    recipientName: string;
    phone: string;
    street: string;
    postalCode: string;
  },
  paymentMethod: string,
  instructions?: string,
  couponCode?: string
) {
  try {
    // 1. Verify user session
    const customer = await checkCustomerSession();
    if (!customer) {
      return { error: "Unauthorized. Please log in first." };
    }

    if (!items || items.length === 0) {
      return { error: "Your cart is empty." };
    }

    // 2. Fetch menu items from DB and calculate actual prices (Security check)
    const menuItemIds = items.map((i) => i.menuItemId);
    const dbMenuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const dbItem = dbMenuItems.find((m) => m.id === item.menuItemId);
      if (!dbItem || dbItem.availability === "OUT_OF_STOCK") {
        return { error: `Item "${item.menuItemId}" is not available.` };
      }

      // Calculate customization cost
      const customCost = item.customizations
        ? item.customizations.reduce((acc, c) => acc + c.price, 0)
        : 0;

      const itemPrice = dbItem.price + customCost;
      subtotal += itemPrice * item.quantity;

      orderItemsData.push({
        menuItemId: item.menuItemId,
        name: dbItem.name,
        price: itemPrice,
        quantity: item.quantity,
        customizations: item.customizations || null,
      });
    }

    // 3. Coupon discount calculation
    let discount = 0;
    let validCoupon = null;

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.active && coupon.expiresAt > new Date() && subtotal >= coupon.minOrderValue) {
        if (coupon.type === "PERCENTAGE") {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else if (coupon.type === "FIXED") {
          discount = coupon.value;
        }
        validCoupon = coupon;
      }
    }

    // 4. Delivery charges & Tax math
    // Free delivery above ₹150, else ₹30
    const deliveryCharge = subtotal >= 150 ? 0 : 30;
    // 5% GST
    const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
    const total = Math.max(0, subtotal - discount + deliveryCharge + tax);

    // 5. Generate formatted order address string
    const deliveryAddress = `${addressDetails.recipientName}, Phone: ${addressDetails.phone}, ${addressDetails.street}, Puri, Odisha, Postal Code: ${addressDetails.postalCode}`;

    // 6. Generate unique ID and create Order
    const orderId = generateOrderNumber();

    const order = await db.order.create({
      data: {
        orderId,
        userId: customer.id,
        status: "PENDING",
        subtotal,
        deliveryCharge,
        tax,
        discount,
        total,
        couponCode: validCoupon ? validCoupon.code : null,
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING", // Wait for simulation callback
        deliveryAddress,
        instructions: instructions || null,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Increment coupon usage
    if (validCoupon) {
      await db.coupon.update({
        where: { id: validCoupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Send admin notification
    await db.notification.create({
      data: {
        userId: null, // Admin alert
        title: "New Order Placed!",
        message: `Order ${orderId} has been placed for ₹${total}. Method: ${paymentMethod}`,
        type: "ADMIN_ALERT",
      },
    });

    return { success: true, orderId: order.orderId, id: order.id, total: order.total };
  } catch (error: any) {
    console.error("Create order error:", error);
    return { error: "Failed to place order. Please try again." };
  }
}

/**
 * Fetches order details by its string ID (uuid).
 */
export async function getOrderDetails(id: string) {
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        payments: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      },
    });

    return order;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches order details by its human-friendly code (KK-XXXXXX).
 */
export async function getOrderDetailsByCode(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { orderId },
      include: {
        orderItems: true,
        payments: true,
      },
    });

    return order;
  } catch (error) {
    return null;
  }
}

/**
 * Updates payment status & records a payment on success.
 */
export async function recordSuccessfulPayment(
  orderId: string,
  transactionId: string,
  method: string,
  amount: number
) {
  try {
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return { error: "Order not found." };

    // Create Payment record
    const payment = await db.payment.create({
      data: {
        orderId,
        transactionId,
        method,
        status: "SUCCESS",
        amount,
      },
    });

    // Update order status
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED", // Auto-confirm on payment success
      },
    });

    // Create customer notification
    await db.notification.create({
      data: {
        userId: order.userId,
        title: "Payment Successful & Order Confirmed!",
        message: `Your payment of ₹${amount} for order ${order.orderId} was successful. Status: Preparing.`,
        type: "CUSTOMER_ORDER",
      },
    });

    revalidatePath("/profile");
    return { success: true, payment };
  } catch (error: any) {
    console.error("Payment record error:", error);
    return { error: "Failed to record payment." };
  }
}

/**
 * Records a payment failure.
 */
export async function recordFailedPayment(
  orderId: string,
  transactionId: string,
  method: string,
  amount: number
) {
  try {
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return { error: "Order not found." };

    await db.payment.create({
      data: {
        orderId,
        transactionId,
        method,
        status: "FAILED",
        amount,
      },
    });

    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "FAILED",
      },
    });

    // Admin notify
    await db.notification.create({
      data: {
        userId: null,
        title: "Payment Failure Alert",
        message: `Order ${order.orderId} checkout payment failed. Method: ${method}`,
        type: "ADMIN_ALERT",
      },
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to record failed payment." };
  }
}

/**
 * Validates a coupon code.
 */
export async function validateCoupon(code: string, subtotal: number) {
  try {
    const coupon = await db.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return { error: "Coupon code not found." };
    }

    if (!coupon.active) {
      return { error: "Coupon is no longer active." };
    }

    if (coupon.expiresAt < new Date()) {
      return { error: "Coupon has expired." };
    }

    if (subtotal < coupon.minOrderValue) {
      return { error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.` };
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === "FIXED") {
      discount = coupon.value;
    }

    return {
      success: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    };
  } catch (error) {
    return { error: "Failed to validate coupon." };
  }
}

/**
 * Fetches current customer's order history.
 */
export async function getCustomerOrders() {
  try {
    const customer = await checkCustomerSession();
    if (!customer) return [];

    return await db.order.findMany({
      where: { userId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: true,
      },
    });
  } catch (error) {
    return [];
  }
}

/**
 * Admin: Update order status.
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const admin = await checkAdminSession();
    if (!admin) {
      return { error: "Unauthorized. Admin credentials required." };
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Log action
    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "UPDATE_ORDER_STATUS",
        details: `Updated Order status of ${order.orderId} to "${status}"`,
      },
    });

    // Notify customer
    await db.notification.create({
      data: {
        userId: order.userId,
        title: `Order Status: ${status}!`,
        message: `Your order ${order.orderId} is now: ${status}.`,
        type: "CUSTOMER_ORDER",
      },
    });

    return { success: true, order };
  } catch (error: any) {
    return { error: error.message || "Failed to update order status." };
  }
}

/**
 * Admin: Update payment status.
 */
export async function updateOrderPaymentStatus(orderId: string, paymentStatus: string) {
  try {
    const admin = await checkAdminSession();
    if (!admin) {
      return { error: "Unauthorized. Admin credentials required." };
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { paymentStatus },
    });

    await db.activityLog.create({
      data: {
        adminName: admin.username,
        action: "UPDATE_ORDER_PAYMENT_STATUS",
        details: `Updated Order payment status of ${order.orderId} to "${paymentStatus}"`,
      },
    });

    return { success: true, order };
  } catch (error: any) {
    return { error: error.message || "Failed to update payment status." };
  }
}
