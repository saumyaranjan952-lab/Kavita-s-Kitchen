import React from "react";
import { db } from "@/lib/db";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Query the business configuration from the database
  const config = await db.businessConfig.findUnique({
    where: { id: "config" },
  });

  return <SettingsClient initialConfig={config} />;
}
