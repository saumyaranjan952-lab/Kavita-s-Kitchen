import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [categories, menuItems, subscriptionPlans, reviews, config] = await Promise.all([
      db.category.findMany({
        orderBy: { order: "asc" },
      }),
      db.menuItem.findMany({
        orderBy: { order: "asc" },
      }),
      db.subscriptionPlan.findMany(),
      db.review.findMany({
        where: { approved: true },
      }),
      db.businessConfig.findUnique({
        where: { id: "config" },
      }),
    ]);

    // Parse features string from JSON for subscription plans
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

    return NextResponse.json({
      success: true,
      categories,
      menuItems,
      subscriptionPlans: parsedPlans,
      reviews,
      config,
    });
  } catch (error: any) {
    console.error("Content fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
