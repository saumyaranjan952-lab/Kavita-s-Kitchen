import React from "react";
import { db } from "@/lib/db";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Query all landing page contents from the database
  const [categories, menuItems, subscriptionPlans, reviews, config] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.menuItem.findMany({ 
      where: { availability: "AVAILABLE" }, 
      orderBy: { order: "asc" } 
    }),
    db.subscriptionPlan.findMany(),
    db.review.findMany({ 
      where: { approved: true, isPinned: true } 
    }),
    db.businessConfig.findUnique({ 
      where: { id: "config" } 
    }),
  ]);

  // Parse features JSON string to array for subscriptions
  const parsedPlans = subscriptionPlans.map((plan) => {
    let features: string[] = [];
    try {
      features = JSON.parse(plan.features);
    } catch (e) {
      features = [];
    }
    return {
      ...plan,
      features,
    };
  });

  const content = {
    categories,
    menuItems: menuItems.map(item => ({
      ...item,
      discountPrice: item.discountPrice ?? null
    })),
    subscriptionPlans: parsedPlans,
    reviews,
    config: config || {
      phone: "+91 78480 37181",
      whatsApp: "917848037181",
      instagram: "kavita.kitchen_",
      address: "Puri, Odisha, India",
      operatingHours: "Daily Cooking: 10:00 AM - 10:00 PM",
      heroTitle: "Authentic Homemade Food in Puri",
      heroSubtitle: "Fresh • Hygienic • Delicious • Made With Love",
    },
  };

  return <HomeClient data={content} />;
}
