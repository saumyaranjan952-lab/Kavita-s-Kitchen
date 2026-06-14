"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, checkSession } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  Utensils,
  Tags,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  // Verify and set current active admin username
  useEffect(() => {
    if (pathname !== "/admin/login") {
      checkSession().then((user) => {
        if (user) {
          setAdminUser(user.username);
        }
      });
    }
  }, [pathname]);

  // If on the login page, render purely without any sidebar wrapper
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Menu Items", href: "/admin/menu", icon: Utensils },
    { label: "Categories", href: "/admin/categories", icon: Tags },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: Calendar },
    { label: "Testimonials", href: "/admin/reviews", icon: MessageSquare },
    { label: "Config & Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0f3d2e] text-[#FCFAF2] border-r border-white/10 shrink-0">
        {/* Brand logo header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="h-10 w-10 rounded-full border border-[#D4AF37] overflow-hidden bg-[#FCFAF2] flex items-center justify-center shrink-0">
            <img src="/images/logo.jpg" alt="Kavita's Kitchen" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-sm text-[#D4AF37] tracking-wider leading-none">
              KAVITA&apos;S
            </h1>
            <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">
              Kitchen CMS
            </span>
          </div>
        </div>

        {/* Active Session info panel */}
        {adminUser && (
          <div className="px-6 py-4 border-b border-white/5 bg-[#072219]/40 flex items-center gap-3 text-xs font-semibold text-gray-300">
            <User className="w-4 h-4 text-[#D4AF37]" />
            <span>
              Hello, <strong className="text-[#D4AF37]">{adminUser}</strong>
            </span>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#D4AF37] text-[#072219] shadow-md"
                    : "text-gray-300 hover:bg-[#072219] hover:text-[#D4AF37]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-200 hover:bg-red-950/35 hover:text-red-400 rounded-xl cursor-pointer transition-all focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Drawer Layout */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0f3d2e] text-[#FCFAF2] border-r border-white/10 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full border border-[#D4AF37] overflow-hidden bg-[#FCFAF2] flex items-center justify-center shrink-0">
              <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-serif font-extrabold text-sm text-[#D4AF37]">
              Kavita&apos;s CMS
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#D4AF37] text-[#072219]"
                    : "text-gray-300 hover:bg-[#072219] hover:text-[#D4AF37]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-200 hover:bg-red-950/35 hover:text-red-400 rounded-xl focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Page Layout Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 md:px-8 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-serif font-extrabold text-[#0f3d2e] dark:text-[#FCFAF2]">
              {navItems.find((i) => i.href === pathname)?.label || "Overview"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 text-xs font-bold text-[#0f3d2e] dark:text-[#FCFAF2] border-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#072219] rounded-full transition-all duration-300"
            >
              View Live Website
            </Link>
          </div>
        </header>

        {/* Content Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
