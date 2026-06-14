import React from "react";
import { db } from "@/lib/db";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  // Query all customer reviews in the system
  const reviews = await db.review.findMany({
    orderBy: { date: "desc" },
  });

  return <ReviewsClient initialReviews={reviews} />;
}
