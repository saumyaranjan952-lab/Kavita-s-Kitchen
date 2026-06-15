import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderDetails } from "@/lib/actions/orders";
import { db } from "@/lib/db";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle2, ShoppingBag, MapPin, CreditCard, Send, Printer, Calendar, Clock } from "lucide-react";
import OrderShareButtons from "./OrderShareButtons";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
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

  const deliveryTimeEst = order.paymentMethod === "COD" 
    ? "40 - 55 mins (Standard COD)" 
    : "30 - 45 mins (Express Delivery)";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header
        categories={categories}
        config={parsedConfig as any}
        onCartOpen={() => {}}
      />

      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* Main Card */}
          <Card className="border border-emerald-500/20 overflow-hidden shadow-xl text-left bg-white dark:bg-zinc-900 transition-colors duration-300">
            {/* Top Header Panel */}
            <div className="bg-[#0f3d2e] p-8 text-white text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#D4AF37] mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#D4AF37]">Order Placed Successfully!</h2>
                <p className="text-xs text-gray-300 font-semibold uppercase tracking-wider">
                  Thank you for ordering from Kavita&apos;s Kitchen
                </p>
              </div>

              <div className="inline-block bg-[#072219]/60 px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-[#D4AF37]">
                Order Number: {order.orderId}
              </div>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {/* Delivery Estimation banner */}
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-4 rounded-xl flex items-center gap-3 text-brand-green dark:text-brand-cream">
                <Clock className="w-5 h-5 text-brand-gold shrink-0" />
                <div>
                  <h4 className="text-sm font-extrabold">Estimated Delivery Time</h4>
                  <p className="text-xs font-semibold text-brand-green/70 dark:text-brand-cream/70 mt-0.5">{deliveryTimeEst}</p>
                </div>
              </div>

              {/* Receipt Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 dark:border-zinc-800 pb-6 text-sm">
                
                {/* Left - Deliver to */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Delivery Destination
                  </h4>
                  <p className="text-xs text-brand-green/80 dark:text-brand-cream/80 font-bold whitespace-pre-line leading-relaxed">
                    {order.deliveryAddress}
                  </p>
                  {order.instructions && (
                    <p className="text-xs italic bg-gray-100 dark:bg-zinc-800 p-2 rounded-lg text-brand-green/70 dark:text-brand-cream/70">
                      <strong>Note:</strong> &ldquo;{order.instructions}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right - Payment details */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    Payment Details
                  </h4>
                  <div className="space-y-1.5 font-semibold text-brand-green/80 dark:text-brand-cream/80 text-xs">
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <span className="font-extrabold uppercase text-[#D4AF37]">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <span className={`font-extrabold uppercase ${order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-500"}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Your Dishes
                </h4>
                
                <div className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs sm:text-sm font-semibold">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-brand-green dark:text-brand-cream">{item.name}</span>
                        <span className="text-brand-gold font-bold ml-1.5">x{item.quantity}</span>
                      </div>
                      <span className="font-serif text-brand-green dark:text-brand-cream font-bold">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-brand-gold/10 pt-4 space-y-2 font-semibold text-xs text-brand-green/80 dark:text-brand-cream/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-serif">₹{order.subtotal}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                      <span className="font-serif">-₹{order.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    {order.deliveryCharge === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 uppercase font-extrabold">FREE</span>
                    ) : (
                      <span className="font-serif">₹{order.deliveryCharge}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-serif">₹{order.tax}</span>
                  </div>
                  <div className="flex justify-between border-t border-brand-gold/20 pt-3 font-serif text-lg font-black text-brand-green dark:text-brand-cream">
                    <span>Total Paid</span>
                    <span className="text-brand-gold font-extrabold">₹{order.total}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Notification Dispatcher */}
              <OrderShareButtons order={order as any} whatsAppPhone={parsedConfig.whatsApp} />

              {/* Redirect Action Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <Link href={`/track-order/${order.id}`}>
                  <Button variant="gold" fullWidth shimmer>
                    Track Order Status
                  </Button>
                </Link>
                <Link href="/#menu">
                  <Button variant="outline" fullWidth>
                    Return to Main Page
                  </Button>
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
