"use client";

import React, { useState, useActionState, startTransition } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { forgotPassword } from "@/lib/actions/customerAuth";
import { Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react";

export default function ForgotPasswordClient({ initialData }: { initialData: { categories: any[]; config: any } }) {
  const [emailInput, setEmailInput] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await forgotPassword(prevState, formData);
    },
    null
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header
        categories={initialData.categories}
        config={initialData.config}
        onCartOpen={() => {}}
      />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-left">
            <CardContent className="p-8">
              
              <div className="space-y-6">
                
                {/* Back button */}
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-gold hover:text-brand-gold-dark"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>

                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold mx-auto">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-extrabold text-brand-green dark:text-brand-cream">
                    Recover Password
                  </h3>
                  <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold leading-relaxed">
                    Enter your email below and we will simulate sending a password reset link in the console logs.
                  </p>
                </div>

                {state?.success ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center space-y-2">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Reset Link Generated!
                    </p>
                    <p className="text-[11px] text-brand-green/70 dark:text-brand-cream/70 font-semibold leading-relaxed">
                      {state.message}
                    </p>
                    <p className="text-[10px] text-brand-gold uppercase font-bold pt-1">
                      Check your backend console or terminal logs to copy the reset link!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase text-brand-gold">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="yourname@email.com"
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold"
                        />
                      </div>
                    </div>

                    {state?.error && (
                      <p className="text-xs text-red-500 font-bold">{state.error}</p>
                    )}

                    <div className="pt-2">
                      <Button variant="gold" fullWidth size="lg" type="submit" disabled={isPending} shimmer>
                        {isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </div>
                  </form>
                )}

              </div>

            </CardContent>
          </Card>
        </div>
      </main>

      <Footer
        categories={initialData.categories}
        config={initialData.config}
      />
    </div>
  );
}
