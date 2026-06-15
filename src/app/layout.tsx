import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Kavita's Kitchen | Authentic Taste of Odisha | Cloud Kitchen Puri",
  description:
    "Fresh, hygienic, and affordable homemade Odia food delivered directly to your doorstep in Puri, Odisha. Try our legendary Dalma, homestyle Veg & Chicken Thalis, and daily meal subscriptions for students and office workers.",
  keywords: [
    "Kavita's Kitchen",
    "Cloud Kitchen Puri",
    "Home food delivery Puri",
    "Authentic Odia food",
    "Odia Thali Puri",
    "Dalma Puri",
    "Pakhala Puri",
    "Student meal plans Puri",
    "Tiffin Service Puri",
    "Hygienic food delivery Odisha"
  ],
  openGraph: {
    title: "Kavita's Kitchen | Authentic Taste of Odisha",
    description:
      "Fresh, hygienic, and affordable homemade Odia food delivered directly to your doorstep in Puri, Odisha.",
    url: "https://kavitaskitchenpuri.com",
    siteName: "Kavita's Kitchen",
    locale: "en_IN",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": "https://kavitaskitchenpuri.com/#establishment",
    "name": "Kavita's Kitchen",
    "image": "https://kavitaskitchenpuri.com/images/logo.jpg",
    "url": "https://kavitaskitchenpuri.com",
    "telephone": "+919438062973",
    "priceRange": "₹",
    "servesCuisine": "Odia, Indian, Homemade, Thali, Dalma",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "VIP Road, Near Jagannath Temple, Puri, Odisha",
      "addressLocality": "Puri",
      "addressRegion": "Odisha",
      "postalCode": "752001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 19.8135,
      "longitude": 85.8312
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "08:00",
      "closes": "22:30"
    },
    "menu": "https://kavitaskitchenpuri.com/#menu",
    "acceptsReservations": "false"
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${playfair.variable} ${outfit.variable} font-sans antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <ThemeProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
