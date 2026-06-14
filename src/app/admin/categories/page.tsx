import React from "react";
import { db } from "@/lib/db";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  // Query all categories along with count of items inside them
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { menuItems: true },
      },
    },
  });

  return <CategoriesClient initialCategories={categories} />;
}
