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
  return (
    <html lang="en" className="scroll-smooth">
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
