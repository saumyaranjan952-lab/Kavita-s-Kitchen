import React from "react";
import { db } from "@/lib/db";
import { checkSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { Users, Mail, Phone, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const session = await checkSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch users with their order counts
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true }
      }
    }
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-2xl font-serif font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
          Registered Customers
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
          Review customer registration dates, contact details, and total orders placed.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-zinc-900/50">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-850 font-semibold text-gray-600 dark:text-gray-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-800/10">
                  <td className="py-4 px-4 font-bold text-brand-green dark:text-brand-cream">{u.name}</td>
                  <td className="py-4 px-4 flex items-center gap-1.5 pt-4 text-gray-500 dark:text-gray-400">
                    <Mail className="w-3.5 h-3.5 text-brand-gold" />
                    {u.email}
                  </td>
                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                    {u.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand-gold" />
                        {u.phone}
                      </span>
                    ) : (
                      <span className="italic text-gray-400 text-xs">Not provided</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col sm:flex-row gap-1.5">
                      <span className={`inline-block px-2 py-0.5 border rounded-md text-[9px] font-black tracking-wide ${
                        u.emailVerified
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                      }`}>
                        {u.emailVerified ? "📧 Email OK" : "📧 Email Pending"}
                      </span>
                      <span className={`inline-block px-2 py-0.5 border rounded-md text-[9px] font-black tracking-wide ${
                        u.phoneVerified
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                      }`}>
                        {u.phoneVerified ? "📱 Mobile OK" : "📱 Mobile Pending"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center sm:text-left">
                    <span className="text-xs font-black uppercase text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-md">
                      {u._count.orders} orders
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                    No customer accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
