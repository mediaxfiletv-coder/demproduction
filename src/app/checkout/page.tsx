import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description:
    "Complete your DEM PRODUCTION photo enlargement order and pay securely with Paystack in Nigerian Naira via Visa, Mastercard or Verve.",
};

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <Reveal>
        <span className="eyebrow">Secure Checkout</span>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5.4vw,3.6rem)] font-black leading-tight text-white">
          Complete your <span className="gold-text">order</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50">
          Payment is processed by Paystack. Our server initialises and verifies every
          transaction — your card details never reach our servers.
        </p>
      </Reveal>
      <div className="mt-12">
        <CheckoutClient />
      </div>
    </section>
  );
}
