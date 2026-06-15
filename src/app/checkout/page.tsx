import React from "react";
import { db } from "@/lib/db";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [categories, config] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.businessConfig.findUnique({ where: { id: "config" } }),
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
  };

  return <CheckoutClient initialData={initialData as any} />;
}
