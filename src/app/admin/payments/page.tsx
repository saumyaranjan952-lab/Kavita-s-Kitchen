import React from "react";
import { db } from "@/lib/db";
import { checkSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const session = await checkSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch payments
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          orderId: true,
          id: true,
        }
      }
    }
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-2xl font-serif font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
          Payment Records
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
          Monitor transaction logs, online success ratios, and track refunds.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-zinc-900/50">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-850 font-semibold text-gray-600 dark:text-gray-300">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-800/10">
                  <td className="py-4 px-4 font-mono text-gray-500 dark:text-gray-400 text-xs">{p.transactionId}</td>
                  <td className="py-4 px-4 text-[#D4AF37] font-black">
                    <Link href={`/admin/orders`} className="hover:underline flex items-center gap-1">
                      {p.order.orderId}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="py-4 px-4 uppercase text-[10px] tracking-wider text-brand-gold">{p.method}</td>
                  <td className="py-4 px-4 font-serif font-extrabold">₹{p.amount}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-0.5 border rounded-md text-[9px] uppercase font-black ${
                      p.status === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-gray-400">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                    No payment records found.
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
