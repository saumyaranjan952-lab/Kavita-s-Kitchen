import React from "react";
import { db } from "@/lib/db";
import { checkSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CheckCircle2,
  AlertTriangle,
  History,
  DollarSign,
  Utensils
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const session = await checkSession();
  if (!session) {
    redirect("/admin/login");
  }

  // 1. Run real aggregate queries
  const [
    menuItemCount,
    categoryCount,
    approvedReviews,
    pendingReviews,
    totalOrders,
    paidOrders,
    totalUsers,
    recentOrders,
    recentLogs,
    popularItems
  ] = await Promise.all([
    db.menuItem.count(),
    db.category.count(),
    db.review.count({ where: { approved: true } }),
    db.review.count({ where: { approved: false } }),
    db.order.count(),
    db.order.findMany({ where: { paymentStatus: "PAID" } }),
    db.user.count(),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true }
    }),
    db.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    db.orderItem.groupBy({
      by: ["menuItemId", "name"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 4
    })
  ]);

  // 2. Revenue calculation
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const conversionRate = totalOrders > 0 
    ? Math.round((paidOrders.length / totalOrders) * 100) 
    : 0;

  // 3. Simulated/Mock historical trend data for the SVG charts
  const salesHistory = [
    { date: "Mon", sales: 2400 },
    { date: "Tue", sales: 3200 },
    { date: "Wed", sales: 1800 },
    { date: "Thu", sales: 4100 },
    { date: "Fri", sales: 3800 },
    { date: "Sat", sales: 5200 },
    { date: "Sun", sales: 6400 }
  ];

  const maxSales = Math.max(...salesHistory.map(h => h.sales));
  const chartHeight = 120;
  const chartWidth = 500;

  // SVG coordinates converter for line path
  const points = salesHistory.map((h, i) => {
    const x = (i / (salesHistory.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (h.sales / maxSales) * (chartHeight - 30) - 10;
    return `${x},${y}`;
  }).join(" ");

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Active Customers",
      value: totalUsers,
      icon: Users,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-serif font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
          CMS Overview
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
          Monitor real-time sales revenue, analytics metrics, and manage user interactions.
        </p>
      </div>

      {/* Metric Cards Grid */}
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

      {/* Grid of Chart + Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Chart (SVG) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm transition-colors duration-300 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-850 pb-3">
            <h4 className="font-serif text-base font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
              Weekly Revenue Trend
            </h4>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-black uppercase px-2 py-0.5 rounded">
              Live updates
            </span>
          </div>

          {/* SVG line chart */}
          <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
              {/* Grids */}
              <line x1="20" y1="10" x2={chartWidth - 20} y2="10" stroke="#e5e7eb" strokeDasharray="3 3" className="dark:stroke-zinc-800" />
              <line x1="20" y1="60" x2={chartWidth - 20} y2="60" stroke="#e5e7eb" strokeDasharray="3 3" className="dark:stroke-zinc-800" />
              <line x1="20" y1="110" x2={chartWidth - 20} y2="110" stroke="#e5e7eb" className="dark:stroke-zinc-800" />

              {/* Area path */}
              <path
                d={`M 20,${chartHeight - 10} L ${points} L ${chartWidth - 20},${chartHeight - 10} Z`}
                fill="url(#chartGrad)"
                opacity="0.15"
              />

              {/* Line path */}
              <polyline
                fill="none"
                stroke="#D4AF37"
                strokeWidth="3.5"
                points={points}
              />

              {/* Node points */}
              {salesHistory.map((h, i) => {
                const x = (i / (salesHistory.length - 1)) * (chartWidth - 40) + 20;
                const y = chartHeight - (h.sales / maxSales) * (chartHeight - 30) - 10;
                return (
                  <g key={i} className="group/dot cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#0f3d2e"
                      stroke="#D4AF37"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      className="text-[8px] font-black fill-brand-gold hidden group-hover/dot:block"
                    >
                      ₹{h.sales}
                    </text>
                  </g>
                );
              })}

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between px-2 pt-2 text-[10px] font-bold text-gray-400">
              {salesHistory.map((h, i) => (
                <span key={i}>{h.date}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm transition-colors duration-300 space-y-4">
          <h4 className="font-serif text-base font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2] border-b border-gray-100 dark:border-zinc-850 pb-3 flex items-center gap-1.5">
            <Utensils className="w-4.5 h-4.5 text-[#D4AF37]" />
            Best Selling Dishes
          </h4>

          <div className="space-y-4">
            {popularItems.map((item, idx) => (
              <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-serif font-black text-gray-400">#{idx + 1}</span>
                  <p className="font-bold text-brand-green dark:text-brand-cream">{item.name}</p>
                </div>
                <span className="text-xs font-black uppercase text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded">
                  {item._sum.quantity} orders
                </span>
              </div>
            ))}

            {popularItems.length === 0 && (
              <p className="text-xs text-gray-400 font-semibold italic text-center py-6">
                No orders compiled yet.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Grid of Recent Orders + Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4 transition-colors duration-300">
          <h4 className="font-serif text-base font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2] border-b border-gray-100 dark:border-zinc-850 pb-3">
            Recent Orders
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 font-bold uppercase text-gray-400">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-850 font-semibold text-gray-600 dark:text-gray-300">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20">
                    <td className="py-3 px-3 text-[#D4AF37] font-black">{ord.orderId}</td>
                    <td className="py-3 px-3 truncate max-w-[120px]">{ord.user.name}</td>
                    <td className="py-3 px-3 font-serif font-extrabold">₹{ord.total}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] uppercase font-black bg-brand-gold/15 text-brand-gold border border-brand-gold/20">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400 italic">
                      No order transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4 transition-colors duration-300 text-left">
          <h4 className="font-serif text-base font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2] border-b border-gray-100 dark:border-zinc-850 pb-3 flex items-center gap-1.5">
            <History className="w-4.5 h-4.5 text-[#D4AF37]" />
            Recent Logs
          </h4>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {recentLogs.map((log) => (
              <div key={log.id} className="text-[11px] leading-relaxed border-b border-gray-50 dark:border-zinc-850/60 pb-2">
                <p className="font-extrabold text-[#D4AF37]">{log.adminName} &bull; <span className="text-gray-400 font-bold uppercase">{log.action}</span></p>
                <p className="text-gray-600 dark:text-gray-400 mt-0.5 font-semibold leading-relaxed">{log.details}</p>
                <span className="text-[9px] text-gray-400 block mt-1">{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}

            {recentLogs.length === 0 && (
              <p className="text-xs text-gray-400 font-semibold italic text-center py-6">
                No activity logs recorded.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
