import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartProvider } from "@/components/CartProvider";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://demproduction.ng"),
  title: {
    default:
      "DEM PRODUCTION — Film, Event Coverage & Photo Enlargement | David Ejibe Movie Production Limited",
    template: "%s | DEM PRODUCTION",
  },
  description:
    "DEM PRODUCTION (David Ejibe Movie Production Limited) is an African film and photography house in Aba, Nigeria. Cinematic event coverage, movie production, professional photography and museum-grade photo enlargements.",
  keywords: [
    "DEM PRODUCTION",
    "David Ejibe Movie Production",
    "photo enlargement Nigeria",
    "event coverage Aba",
    "wedding videography Abia State",
    "movie production Nigeria",
    "photography studio Aba",
    "Paystack photo prints",
  ],
  authors: [{ name: "David Ejibe Movie Production Limited" }],
  creator: "DEM PRODUCTION",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "DEM PRODUCTION",
    title: "DEM PRODUCTION — Your Moments. Our Creativity. Lasting Memories.",
    description:
      "Cinematic film production, event coverage, professional photography and premium photo enlargements. Based in Aba, Abia State, Nigeria.",
    images: ["/images/hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "DEM PRODUCTION",
    description:
      "Your Moments. Our Creativity. Lasting Memories. — Film, Event Coverage, Photography & Photo Enlargement.",
    images: ["/images/hero.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-ink text-white antialiased">
        <ToastProvider>
          <CartProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2 focus:text-black"
            >
              Skip to content
            </a>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
            <WhatsAppFab />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
