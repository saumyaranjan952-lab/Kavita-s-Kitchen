"use client";

import React, { useState } from "react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Calendar, User, ShieldCheck } from "lucide-react";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  weeklyPrice: number;
  monthlyPrice: number;
  image: string;
  features: string[];
  type: string;
};

interface SubscriptionsProps {
  plans: SubscriptionPlan[];
  whatsApp?: string;
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({ plans, whatsApp = "917848037181" }) => {
  const [billingCycle, setBillingCycle] = useState<"weekly" | "monthly">("monthly");

  const handleSubscribe = (planName: string, price: number) => {
    const cycleText = billingCycle === "weekly" ? "Weekly" : "Monthly";
    const text = encodeURIComponent(
      `Hello Kavita's Kitchen, I am interested in subscribing to the "${planName}" on a ${cycleText} basis (Price: ₹${price}). Please provide more details.`
    );
    window.open(`https://wa.me/${whatsApp}?text=${text}`, "_blank");
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case "student":
        return <User className="w-6 h-6 text-brand-gold" />;
      case "office":
        return <Calendar className="w-6 h-6 text-brand-gold" />;
      case "family":
        return <ShieldCheck className="w-6 h-6 text-brand-gold" />;
      default:
        return null;
    }
  };

  return (
    <section id="subscriptions" className="py-20 md:py-28 mandala-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-5">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-gold">
            Daily Meal Plans
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-cream">
            Choose Your Subscription
          </h2>
          <p className="text-sm text-brand-green/70 dark:text-brand-cream/65 font-semibold leading-relaxed">
            Fresh, hot meals delivered to you daily in Puri. Pause or resume your plan whenever you go out of town.
          </p>
          
          {/* Billing Cycle Switch */}
          <div className="inline-flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--card-border)] p-1 rounded-full shadow-sm mt-3">
            <button
              onClick={() => setBillingCycle("weekly")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                billingCycle === "weekly"
                  ? "bg-brand-green text-brand-cream dark:bg-brand-gold dark:text-brand-green-dark shadow-sm"
                  : "text-brand-green dark:text-brand-cream hover:bg-brand-cream dark:hover:bg-brand-green-light"
              }`}
            >
              Weekly Plan
            </button>
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-brand-green text-brand-cream dark:bg-brand-gold dark:text-brand-green-dark shadow-sm"
                  : "text-brand-green dark:text-brand-cream hover:bg-brand-cream dark:hover:bg-brand-green-light"
              }`}
            >
              Monthly Plan
            </button>
          </div>
        </div>

        {/* Subscription Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === "weekly" ? plan.weeklyPrice : plan.monthlyPrice;
            const savingsText = billingCycle === "monthly" ? "Save up to 15%" : "Flexible commitment";
            
            return (
              <Card key={plan.id} className="flex flex-col h-full group">
                {/* Plan Image Header */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={plan.image}
                    alt={plan.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Floating plan icon overlay */}
                  <div className="absolute bottom-4 left-4 bg-[var(--card-bg)] p-2.5 rounded-xl border border-brand-gold shadow-md flex items-center justify-center">
                    {getPlanIcon(plan.type)}
                  </div>
                </div>

                {/* Card Info Content */}
                <CardContent className="flex flex-col flex-grow p-6 sm:p-8 space-y-6 text-left">
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-brand-green dark:text-brand-cream">
                      {plan.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-green/70 dark:text-brand-cream/65 leading-relaxed font-semibold">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing Details */}
                  <div className="py-4 border-y border-[var(--card-border)]/60 flex items-baseline justify-between">
                    <div>
                      <span className="font-serif text-3xl font-black text-brand-gold">₹{price}</span>
                      <span className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold ml-1.5">
                        / {billingCycle === "weekly" ? "Week" : "Month"}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2 py-1 rounded-md">
                      {savingsText}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-brand-green/85 dark:text-brand-cream/80 font-bold">
                        <span className="text-brand-gold shrink-0 mt-0.5">✦</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Get Subscription Button */}
                  <div className="pt-4">
                    <Button
                      variant="gold"
                      fullWidth
                      shimmer
                      onClick={() => handleSubscribe(plan.name, price)}
                    >
                      Get Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default Subscriptions;
