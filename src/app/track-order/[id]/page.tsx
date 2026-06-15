import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderDetails } from "@/lib/actions/orders";
import { db } from "@/lib/db";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Clock, MapPin, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderDetails(id);

  if (!order) {
    notFound();
  }

  // Fetch header categories & config
  const [categories, config] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.businessConfig.findUnique({ where: { id: "config" } }),
  ]);

  const parsedConfig = config || {
    phone: "+91 78480 37181",
    whatsApp: "917848037181",
    instagram: "kavita.kitchen_",
    address: "Puri, Odisha, India",
    operatingHours: "Daily Cooking: 10:00 AM - 10:00 PM",
    heroTitle: "Authentic Homemade Food in Puri",
    heroSubtitle: "Fresh • Hygienic • Delicious • Made With Love",
  };

  const statusWorkflow = [
    { id: "PENDING", title: "Order Placed", desc: "Awaiting confirmation from kitchen", step: 1 },
    { id: "CONFIRMED", title: "Confirmed", desc: "Chef accepted and verified payment", step: 2 },
    { id: "PREPARING", title: "Preparing", desc: "Your meal is cooking with love", step: 3 },
    { id: "OUT_FOR_DELIVERY", title: "Out for Delivery", desc: "Rider picked up box, en route in Puri", step: 4 },
    { id: "DELIVERED", title: "Delivered", desc: "Meal received successfully! Bon appétit!", step: 5 },
  ];

  const currentStep = statusWorkflow.findIndex((s) => s.id === order.status) + 1;
  const isCancelled = order.status === "CANCELLED";
  const isRefunded = order.status === "REFUNDED";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header
        categories={categories}
        config={parsedConfig as any}
        onCartOpen={() => {}}
      />

      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Card className="border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl text-left transition-colors duration-300">
            <CardContent className="p-6 sm:p-8 space-y-8">
              
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-5">
                <div className="text-left">
                  <h3 className="font-serif text-2xl font-extrabold text-brand-green dark:text-brand-cream">
                    Track Your Food
                  </h3>
                  <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold mt-1">
                    Order Number: <strong className="text-brand-gold">{order.orderId}</strong>
                  </p>
                </div>
                <Link href={`/order-confirmation/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View Receipt Details
                  </Button>
                </Link>
              </div>

              {/* Cancelled/Refunded Warning Banner */}
              {(isCancelled || isRefunded) && (
                <div className="p-4 rounded-xl flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="text-sm font-extrabold uppercase">
                      Order {isCancelled ? "Cancelled" : "Refunded"}
                    </h4>
                    <p className="text-xs font-semibold text-red-600/80 mt-0.5">
                      This order has been {isCancelled ? "marked as cancelled by the restaurant" : "fully refunded to your account"}. Please contact support if you have any questions.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              {!(isCancelled || isRefunded) && (
                <div className="space-y-6 pt-2">
                  {statusWorkflow.map((status, index) => {
                    const isDone = index + 1 < currentStep;
                    const isActive = index + 1 === currentStep;
                    const isAwaiting = index + 1 > currentStep;

                    return (
                      <div key={status.id} className="relative flex gap-4 text-left">
                        {/* Vertical line connector */}
                        {index < statusWorkflow.length - 1 && (
                          <div
                            className={`absolute left-5 top-8 bottom-0 w-0.5 -translate-x-1/2 -z-10 ${
                              isDone ? "bg-emerald-500" : "bg-gray-200 dark:bg-zinc-800"
                            }`}
                            style={{ height: "calc(100% + 24px)" }}
                          />
                        )}

                        {/* Step indicator circle */}
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-serif font-black shrink-0 transition-all ${
                            isDone
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : isActive
                              ? "bg-brand-gold border-brand-gold text-brand-green-dark animate-pulse shadow-md"
                              : "bg-[var(--card-bg)] border-[var(--card-border)] text-brand-green/40 dark:text-brand-cream/40"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 stroke-[2.5px]" />
                          ) : (
                            status.step
                          )}
                        </div>

                        {/* Text labels */}
                        <div className="pt-1.5">
                          <h4
                            className={`text-sm font-extrabold transition-colors ${
                              isActive
                                ? "text-brand-gold text-base"
                                : isDone
                                ? "text-brand-green dark:text-brand-cream"
                                : "text-brand-green/40 dark:text-brand-cream/40"
                            }`}
                          >
                            {status.title}
                          </h4>
                          <p
                            className={`text-xs font-semibold mt-0.5 leading-relaxed ${
                              isActive
                                ? "text-brand-green dark:text-brand-cream"
                                : isDone
                                ? "text-brand-green/60 dark:text-brand-cream/60"
                                : "text-brand-green/30 dark:text-brand-cream/30"
                            }`}
                          >
                            {status.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Delivery Details Recap */}
              <div className="bg-gray-100/50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-[var(--card-border)] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Delivery To
                </h4>
                <p className="text-xs font-bold text-brand-green/80 dark:text-brand-cream/80 leading-relaxed">
                  {order.deliveryAddress}
                </p>
              </div>

              {/* Support contact info */}
              <div className="flex items-center justify-between text-xs font-bold text-brand-green/50 dark:text-brand-cream/50 pt-2 uppercase tracking-wide">
                <span>Cooking hours: 10AM - 10PM</span>
                <Link
                  href={`https://wa.me/${parsedConfig.whatsApp}`}
                  target="_blank"
                  className="text-brand-gold hover:text-brand-gold-dark flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Contact Kitchen
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </CardContent>
          </Card>
        </div>
      </main>

      <Footer
        categories={categories}
        config={parsedConfig as any}
      />
    </div>
  );
}
