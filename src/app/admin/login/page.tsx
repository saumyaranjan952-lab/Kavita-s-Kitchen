"use client";

import React, { useActionState, startTransition } from "react";
import { login } from "@/lib/actions/auth";
import { Lock, User, Sparkles } from "lucide-react";

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(login, null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  // Redirect to admin dashboard upon successful authentication
  if (state?.success) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin";
    }
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#072219] text-[#FCFAF2] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-[#D4AF37]/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-[#0f3d2e]/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 rounded-full border-2 border-[#D4AF37] overflow-hidden bg-[#FCFAF2] flex items-center justify-center shadow-lg">
            <img src="/images/logo.jpg" alt="Kavita's Kitchen" className="w-full h-full object-cover" />
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-[#D4AF37]">
            Admin Portal
          </h2>
          <p className="text-sm text-gray-300">
            Sign in to manage Kavita&apos;s Kitchen Content
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-[#0f3d2e]/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl"
          onSubmit={handleSubmit}
        >
          {state?.error && (
            <div className="p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-red-200 text-sm font-semibold text-center">
              ⚠️ {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-[#072219]/60 rounded-xl text-sm placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-[#D4AF37] transition-all font-semibold"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-[#072219]/60 rounded-xl text-sm placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-[#D4AF37] transition-all font-semibold"
                  placeholder="Enter password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-[#D4AF37] text-sm font-bold tracking-wide rounded-xl text-[#072219] bg-[#D4AF37] hover:bg-transparent hover:text-[#D4AF37] transition-all duration-300 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              {isPending ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[3px]" />
                  SIGN IN
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
