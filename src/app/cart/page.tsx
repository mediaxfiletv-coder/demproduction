import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description:
    "Review your DEM PRODUCTION photo enlargement order, adjust quantities and proceed to secure Paystack checkout.",
};

export default function CartPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <Reveal>
        <span className="eyebrow">Photo Enlargement Shop</span>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5.4vw,3.6rem)] font-black leading-tight text-white">
          Your <span className="gold-text">shopping cart</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50">
          Review your selections, change quantities and remove items. Totals update instantly.
        </p>
      </Reveal>
      <div className="mt-12">
        <CartView />
      </div>
    </section>
  );
}
