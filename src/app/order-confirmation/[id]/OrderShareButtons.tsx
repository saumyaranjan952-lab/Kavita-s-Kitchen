"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Send, Check, Loader2, Mail } from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  orderId: string;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  orderItems: OrderItem[];
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
};

export default function OrderShareButtons({ order, whatsAppPhone }: { order: Order; whatsAppPhone: string }) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleWhatsAppShare = () => {
    let messageText = `*🍽️ KAVITA'S KITCHEN - ORDER CONFIRMATION*\n`;
    messageText += `==================================\n`;
    messageText += `*Order Number:* ${order.orderId}\n`;
    messageText += `*Name:* ${order.user.name}\n`;
    messageText += `*Payment:* ${order.paymentMethod} (${order.paymentStatus})\n`;
    messageText += `==================================\n\n`;

    order.orderItems.forEach((item) => {
      messageText += `• *${item.name}* (x${item.quantity}) - ₹${item.price * item.quantity}\n`;
    });

    messageText += `\n==================================\n`;
    messageText += `*Subtotal:* ₹${order.subtotal}\n`;
    if (order.discount > 0) messageText += `*Discount:* -₹${order.discount}\n`;
    messageText += `*Delivery:* ₹${order.deliveryCharge}\n`;
    messageText += `*Tax (GST):* ₹${order.tax}\n`;
    messageText += `*Total Paid:* ₹${order.total}\n\n`;
    messageText += `*Delivery Address:*\n${order.deliveryAddress}\n\n`;
    messageText += `Please prepare my food quickly! Thank you!`;

    const encodedText = encodeURIComponent(messageText);
    window.open(`https://wa.me/${whatsAppPhone}?text=${encodedText}`, "_blank");
  };

  const handleSimulateEmail = () => {
    setEmailSending(true);
    setEmailSent(false);

    // Simulate standard SMTP server dispatching delay of 1.5s
    setTimeout(() => {
      setEmailSending(false);
      setEmailSent(true);
      console.log(`[SIMULATED EMAIL DISPATCH] Sent receipt email to: ${order.user.email} for order ${order.orderId}`);
    }, 1500);
  };

  return (
    <div className="bg-gray-100/50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-[var(--card-border)] space-y-4">
      <div className="text-left">
        <h4 className="text-sm font-extrabold text-brand-green dark:text-brand-cream">Receipt Notifications</h4>
        <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 font-semibold mt-0.5">
          Share your order details to WhatsApp or trigger a simulated receipt email to {order.user.email}.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={handleWhatsAppShare}
          className="flex-grow flex items-center justify-center gap-2 font-bold hover:border-[#25D366] hover:text-[#25D366] transition-colors"
        >
          <Send className="w-4 h-4" />
          Share to WhatsApp
        </Button>

        <Button
          variant="outline"
          onClick={handleSimulateEmail}
          disabled={emailSending}
          className="flex-grow flex items-center justify-center gap-2 font-bold transition-colors"
        >
          {emailSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending Email...
            </>
          ) : emailSent ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              Email Sent!
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Email Receipt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
