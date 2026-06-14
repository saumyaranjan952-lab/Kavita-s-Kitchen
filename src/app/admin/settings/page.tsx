import React from "react";
import { db } from "@/lib/db";
import { checkSession } from "@/lib/actions/auth";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Query the business configuration from the database
  const config = await db.businessConfig.findUnique({
    where: { id: "config" },
  });

  const session = await checkSession();

  return (
    <SettingsClient 
      initialConfig={config} 
      currentAdminUsername={session?.username || "admin"} 
    />
  );
}
