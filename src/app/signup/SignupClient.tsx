"use client";
 
import React, { useState, useEffect, useActionState, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  customerSignup, 
  verifyCustomerEmailCode, 
  verifyCustomerPhoneOTP, 
  resendVerificationCode 
} from "@/lib/actions/customerAuth";
import { Mail, Lock, User, Phone, ShieldCheck, Loader2 } from "lucide-react";
 
export default function SignupClient({ initialData }: { initialData: { categories: any[]; config: any } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/profile";
 
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
 
  // Verification states
  const [verificationStep, setVerificationStep] = useState<"form" | "email" | "mobile">("form");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
 
  // Resend OTP countdown timer
  const [resendTimer, setResendTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
 
  useEffect(() => {
    let interval: any = null;
    if (timerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, resendTimer]);
 
  const startResendTimer = () => {
    setResendTimer(60);
    setTimerActive(true);
  };
 
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await customerSignup(prevState, formData);
      if (res.success && res.email) {
        setVerificationEmail(res.email);
        setVerificationStep("email");
        setSuccessMessage("✅ Email Verification Sent");
        setVerificationError("");
        startResendTimer();
      }
      return res;
    },
    null
  );
 
  const handleEmailVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");
    setSuccessMessage("");
    if (!verificationCode) {
      setVerificationError("Please enter the verification code.");
      return;
    }
 
    setVerifying(true);
    const res = await verifyCustomerEmailCode(verificationEmail, verificationCode);
    setVerifying(false);
 
    if (res.success && res.step === "mobile") {
      setSuccessMessage("✅ Email Verified Successfully\n✅ OTP Sent Successfully");
      setVerificationCode(""); // Reset code field for mobile OTP
      setVerificationStep("mobile");
      startResendTimer(); // Reset timer for mobile verification step
    } else {
      setVerificationError(res.error || "❌ Invalid Verification Code");
    }
  };
 
  const handleMobileVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");
    setSuccessMessage("");
    if (!verificationCode) {
      setVerificationError("Please enter the OTP.");
      return;
    }
 
    setVerifying(true);
    const res = await verifyCustomerPhoneOTP(verificationEmail, verificationCode);
    setVerifying(false);
 
    if (res.success) {
      setSuccessMessage("✅ Mobile Number Verified\n✅ Account Created Successfully");
      alert("🎉 Welcome to Kavita's Kitchen!\n\nYour account has been successfully verified and created.");
      router.push(redirect);
      router.refresh();
    } else {
      setVerificationError(res.error || "❌ Invalid OTP");
    }
  };
 
  const handleResendCode = async () => {
    if (timerActive) return;
    setVerificationError("");
    setSuccessMessage("");
 
    const res = await resendVerificationCode(
      verificationEmail,
      verificationStep === "email" ? "email" : "mobile"
    );
 
    if (res.success) {
      if (verificationStep === "email") {
        setSuccessMessage("✅ Email Verification Sent");
      } else {
        setSuccessMessage("✅ OTP Sent Successfully");
      }
      startResendTimer();
    } else {
      setVerificationError(res.error || "Failed to resend code.");
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
              
              {verificationStep === "form" ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-2xl font-extrabold text-brand-green dark:text-brand-cream">
                      Create An Account
                    </h3>
                    <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold">
                      Join us and enjoy delicious, fresh homemade food delivered in Puri
                    </p>
                  </div>
 
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase text-brand-gold">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold"
                        />
                      </div>
                    </div>
 
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
 
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase text-brand-gold">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="Enter your mobile number"
                          className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold"
                        />
                      </div>
                    </div>
 
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase text-brand-gold">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                        <input
                          type="password"
                          name="password"
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="At least 6 characters"
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
                            Registering...
                          </span>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </div>
                  </form>
 
                  {/* Switch to Login */}
                  <div className="text-center text-xs font-semibold text-brand-green/60 dark:text-brand-cream/60 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    Already have an account?{" "}
                    <Link
                      href={`/login?redirect=${encodeURIComponent(redirect)}`}
                      className="text-brand-gold hover:text-brand-gold-dark font-extrabold"
                    >
                      Log In instead
                    </Link>
                  </div>
                </div>
              ) : verificationStep === "email" ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold mx-auto">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-extrabold text-brand-green dark:text-brand-cream">
                      Enter Email Verification Code
                    </h3>
                    <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold leading-relaxed">
                      We have simulated a 6-digit verification code to <strong className="text-brand-gold">{verificationEmail}</strong>. Please check your logs/console output to retrieve it.
                    </p>
                  </div>
 
                  <form onSubmit={handleEmailVerificationSubmit} className="space-y-4">
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
 
                    {successMessage && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center whitespace-pre-line">
                        {successMessage}
                      </div>
                    )}
 
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
                          "Verify"
                        )}
                      </Button>
                    </div>
                  </form>
 
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <span className="font-semibold text-brand-green/60 dark:text-brand-cream/60">
                      {timerActive ? `Resend in ${resendTimer}s` : "Didn't receive code?"}
                    </span>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={timerActive}
                      className={`font-bold hover:underline focus:outline-none ${
                        timerActive 
                          ? "text-gray-400 dark:text-zinc-600 cursor-not-allowed" 
                          : "text-brand-gold cursor-pointer"
                      }`}
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Mobile Step */}
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold mx-auto">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-extrabold text-brand-green dark:text-brand-cream">
                      Verify Mobile Number
                    </h3>
                    <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold leading-relaxed">
                      We have simulated a 6-digit OTP to your registered mobile number. Please check your logs/console output to retrieve it.
                    </p>
                  </div>
 
                  <form onSubmit={handleMobileVerificationSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase text-brand-gold text-center">Enter OTP</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="749382"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full text-center text-lg tracking-[0.4em] py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-brand-green dark:text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold font-black"
                      />
                    </div>
 
                    {successMessage && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center whitespace-pre-line">
                        {successMessage}
                      </div>
                    )}
 
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
                          "Verify"
                        )}
                      </Button>
                    </div>
                  </form>
 
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <span className="font-semibold text-brand-green/60 dark:text-brand-cream/60">
                      {timerActive ? `Resend OTP in ${resendTimer}s` : "Didn't receive OTP?"}
                    </span>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={timerActive}
                      className={`font-bold hover:underline focus:outline-none ${
                        timerActive 
                          ? "text-gray-400 dark:text-zinc-600 cursor-not-allowed" 
                          : "text-brand-gold cursor-pointer"
                      }`}
                    >
                      Resend OTP
                    </button>
                  </div>
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
