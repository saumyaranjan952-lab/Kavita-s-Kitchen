"use client";

import React from "react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Phone, MapPin, Navigation, MessageSquare } from "lucide-react";

export const Contact: React.FC = () => {
  const handleCall = () => {
    window.location.href = "tel:7848037181";
  };

  const handleWhatsApp = () => {
    const defaultMsg = encodeURIComponent("Hello Kavita's Kitchen, I would like to place an order.");
    window.open(`https://wa.me/917848037181?text=${defaultMsg}`, "_blank");
  };

  const handleDirections = () => {
    window.open("https://maps.google.com/?q=Puri,Odisha,India", "_blank");
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-[var(--card-bg)] border-t border-[var(--card-border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-gold">
            Order & Location
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-cream">
            Get In Touch With Us
          </h2>
          <div className="h-1 w-20 bg-brand-gold mx-auto rounded-full" />
        </div>

        {/* Info & Map grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Info Card Col */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <Card hoverEffect={false} className="h-full">
              <CardContent className="p-8 sm:p-10 space-y-8 flex flex-col justify-between h-full">
                
                <div className="space-y-6 text-left">
                  <h3 className="font-serif text-2xl font-extrabold text-brand-green dark:text-brand-cream">
                    Kavita&apos;s Kitchen Puri
                  </h3>
                  <p className="text-sm sm:text-base text-brand-green/75 dark:text-brand-cream/70 leading-relaxed font-semibold">
                    We deliver fresh home-cooked Odia meals right to your door. Call us directly or chat on WhatsApp to schedule subscriptions or request instant delivery.
                  </p>
                  
                  {/* Address List */}
                  <ul className="space-y-5">
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="text-left font-semibold">
                        <p className="text-xs text-brand-gold font-bold uppercase tracking-wider">Address</p>
                        <p className="text-sm text-brand-green dark:text-brand-cream mt-0.5">Puri, Odisha, India</p>
                      </div>
                    </li>

                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="text-left font-semibold">
                        <p className="text-xs text-brand-gold font-bold uppercase tracking-wider">Phone</p>
                        <a href="tel:7848037181" className="text-sm text-brand-green dark:text-brand-cream mt-0.5 hover:underline block">
                          +91 78480 37181
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* CTAs */}
                <div className="space-y-3 pt-6 border-t border-[var(--card-border)]/60">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="primary" size="md" onClick={handleCall}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="gold" size="md" onClick={handleWhatsApp} shimmer>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp Order
                    </Button>
                  </div>
                  <Button variant="outline" size="md" fullWidth onClick={handleDirections}>
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Embedded Map Column */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-md border border-[var(--card-border)] min-h-[350px]">
            <iframe
              title="Google Map showing Puri, Odisha, India"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59955.51268688432!2d85.79586395379967!3d19.81429468903565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19c4179379fa45%3A0xea21d5828551fa16!2sPuri%2C%20Odisha!5e0!3m2!1sen!2sin!4v1718300000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "380px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>

        </div>
      </div>
    </section>
  );
};
export default Contact;
