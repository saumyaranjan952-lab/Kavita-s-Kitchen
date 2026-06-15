import React from "react";
import { db } from "@/lib/db";
import { checkSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import CouponsClient from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const session = await checkSession();
  if (!session) {
    redirect("/admin/login");
  }

  const coupons = await db.coupon.findMany({
    orderBy: { expiresAt: "desc" },
  });

  // Convert Date objects to ISO string representation to pass to Client Component safely
  const serializedCoupons = coupons.map((c) => ({
    ...c,
    expiresAt: c.expiresAt.toISOString(),
  }));

  return <CouponsClient initialCoupons={serializedCoupons} />;
}
