import React from "react";
import { db } from "@/lib/db";
import MenuClient from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const [categories, menuItems] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.menuItem.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <MenuClient
      initialCategories={categories}
      initialMenuItems={menuItems}
    />
  );
}
