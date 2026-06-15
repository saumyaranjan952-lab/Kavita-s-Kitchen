import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkCustomerSession } from "@/lib/actions/customerAuth";
import SubscribeClient from "./SubscribeClient";

export const dynamic = "force-dynamic";

export default async function SubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ cycle?: string }>;
}) {
  const customer = await checkCustomerSession();
  const { planId } = await params;
  const { cycle } = await searchParams;

  if (!customer) {
    redirect(`/login?redirect=/subscribe/${planId}?cycle=${cycle || "monthly"}`);
  }

  const [categories, config, plan, addresses] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.businessConfig.findUnique({ where: { id: "config" } }),
    db.subscriptionPlan.findUnique({ where: { id: planId } }),
    db.address.findMany({ where: { userId: customer.id } }),
  ]);

  if (!plan) {
    notFound();
  }

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
    plan: {
      ...plan,
      features: JSON.parse(plan.features) as string[],
    },
    addresses,
    cycle: cycle === "weekly" ? "weekly" : "monthly",
  };

  return <SubscribeClient initialData={initialData as any} />;
}
