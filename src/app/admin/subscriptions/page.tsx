import React from "react";
import { db } from "@/lib/db";
import SubscriptionsClient from "./SubscriptionsClient";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const plans = await db.subscriptionPlan.findMany();

  // Parse features JSON string to arrays
  const parsedPlans = plans.map((plan) => {
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

  return <SubscriptionsClient initialPlans={parsedPlans} />;
}
