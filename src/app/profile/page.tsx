import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkCustomerSession } from "@/lib/actions/customerAuth";
import { getUserAddresses, getUserFavorites } from "@/lib/actions/customer";
import { getCustomerOrders } from "@/lib/actions/orders";
import { getUserSubscriptions } from "@/lib/actions/subscriptions";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const customer = await checkCustomerSession();

  // Middleware will also catch this, but double secure check
  if (!customer) {
    redirect("/login?redirect=/profile");
  }

  // Parallel load of all customer context
  const [
    categories,
    config,
    addresses,
    orders,
    subscriptions,
    favorites,
  ] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.businessConfig.findUnique({ where: { id: "config" } }),
    getUserAddresses(),
    getCustomerOrders(),
    getUserSubscriptions(),
    getUserFavorites(),
  ]);

  const parsedConfig = config || {
    phone: "+91 78480 37181",
    whatsApp: "917848037181",
    instagram: "kavita.kitchen_",
    address: "Puri, Odisha, India",
    operatingHours: "Daily Cooking: 10:00 AM - 10:00 PM",
    heroTitle: "Authentic Homemade Food in Puri",
    heroSubtitle: "Fresh • Hygienic • Delicious • Made With Love",
  };

  const initialData = {
    categories,
    config: parsedConfig,
    customer,
    addresses,
    orders,
    subscriptions,
    favorites,
  };

  return <ProfileClient initialData={initialData as any} />;
}
