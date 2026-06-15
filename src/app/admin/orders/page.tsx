import React from "react";
import { db } from "@/lib/db";
import { checkSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await checkSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch all orders with details
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        }
      }
    }
  });

  return <OrdersClient initialOrders={orders as any} />;
}
