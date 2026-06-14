import React from "react";
import { getAdminStats, getActivityLogs } from "@/lib/actions/config";
import {
  Utensils,
  Tags,
  CheckCircle2,
  AlertTriangle,
  History,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const stats = await getAdminStats();
  const logs = await getActivityLogs(15);

  const statCards = [
    {
      label: "Active Dishes",
      value: stats.menuItemCount,
      icon: Utensils,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Food Categories",
      value: stats.categoryCount,
      icon: Tags,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Approved Reviews",
      value: stats.approvedReviews,
      icon: CheckCircle2,
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingReviews,
      icon: AlertTriangle,
      color:
        stats.pendingReviews > 0
          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse"
          : "bg-gray-500/10 text-gray-500 dark:text-gray-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header text */}
      <div>
        <h3 className="text-2xl font-serif font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
          CMS Overview
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
          Monitor your menu data and review moderation activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl flex items-center gap-5 shadow-sm transition-colors duration-300"
            >
              <div className={`p-4 rounded-xl shrink-0 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {card.label}
                </span>
                <p className="text-2xl font-black text-[#0f3d2e] dark:text-[#FCFAF2] leading-none">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity logs trail */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors duration-300">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4">
          <History className="w-5 h-5 text-[#D4AF37]" />
          <h4 className="font-serif text-lg font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
            Recent Admin Activity
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-semibold text-gray-600 dark:text-gray-300">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-4 px-4 text-[#D4AF37] font-bold">
                    {log.adminName}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-md">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs sm:text-sm max-w-md truncate">
                    {log.details}
                  </td>
                  <td className="py-4 px-4 text-right text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-gray-400 font-medium"
                  >
                    No activity logs recorded yet.
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
