"use client";

import React, { useState, useEffect, useActionState, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { customerLogin, verifyCustomerEmail } from "@/lib/actions/customerAuth";
import { Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginClient({ initialData }: { initialData: { categories: any[]; config: any } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/profile";

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [randomPhone, setRandomPhone] = useState("9876543210");

  useEffect(() => {
    const start = Math.floor(Math.random() * 4) + 6; // starts with 6, 7, 8, or 9
    let rest = "";
    for (let i = 0; i < 9; i++) {
      rest += Math.floor(Math.random() * 10).toString();
    }
    setRandomPhone(`${start}${rest}`);
  }, []);

  // Email verification states
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await customerLogin(prevState, formData);
      if (res.success) {
        router.push(redirect);
        router.refresh();
      } else if (res.requiresVerification && res.email) {
        setVerificationEmail(res.email);
        setNeedsVerification(true);
      }
      return res;
    },
    null
  );

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");
    if (!verificationCode) {
      setVerificationError("Please enter the verification code.");
      return;
    }

    setVerifying(true);
    const res = await verifyCustomerEmail(verificationEmail, verificationCode);
    setVerifying(false);

    if (res.success) {
      router.push(redirect);
      router.refresh();
    } else {
      setVerificationError(res.error || "Verification failed.");
    }
  };

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
              
              {!needsVerification ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-2xl font-extrabold text-brand-green dark:text-brand-cream">
                      Welcome Back!
                    </h3>
                    <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold">
                      Log in to order delicious homemade Odia food in Puri
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase text-brand-gold">Email Address or Mobile Number</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                        <input
                          type="text"
                          name="emailOrPhone"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Enter your email or mobile number"
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold"
                        />
                      </div>
                      <p className="text-[10px] text-brand-green/45 dark:text-brand-cream/45 mt-1 font-semibold pl-1">
                        Examples: user@gmail.com or {randomPhone}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold uppercase text-brand-gold">Password</label>
                        <Link
                          href="/forgot-password"
                          className="text-[11px] font-bold text-brand-gold hover:text-brand-gold-dark"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                        <input
                          type="password"
                          name="password"
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
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
                            Signing In...
                          </span>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Switch to Signup */}
                  <div className="text-center text-xs font-semibold text-brand-green/60 dark:text-brand-cream/60 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    Don&apos;t have an account?{" "}
                    <Link
                      href={`/signup?redirect=${encodeURIComponent(redirect)}`}
                      className="text-brand-gold hover:text-brand-gold-dark font-extrabold"
                    >
                      Sign Up Now
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Verification Screen */}
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold mx-auto">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-extrabold text-brand-green dark:text-brand-cream">
                      Verify Your Email
                    </h3>
                    <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold leading-relaxed">
                      We have simulated a 6-digit verification code to your email <strong className="text-brand-gold">{verificationEmail}</strong>. Please check your logs/console output to retrieve it.
                    </p>
                  </div>

                  <form onSubmit={handleVerificationSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase text-brand-gold text-center">6-Digit Verification Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full text-center text-lg tracking-[0.4em] py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-black"
                      />
                    </div>

                    {verificationError && (
                      <p className="text-xs text-red-500 font-bold text-center">{verificationError}</p>
                    )}

                    <div className="pt-2">
                      <Button variant="gold" fullWidth size="lg" type="submit" disabled={verifying} shimmer>
                        {verifying ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          "Verify & Log In"
                        )}
                      </Button>
                    </div>
                  </form>

                  <button
                    onClick={() => setNeedsVerification(false)}
                    className="w-full text-center text-xs font-bold text-brand-gold hover:text-brand-gold-dark cursor-pointer focus:outline-none"
                  >
                    Back to Login
                  </button>
                </div>
              )}

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
