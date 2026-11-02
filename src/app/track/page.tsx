import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import OrderLookup from "@/components/OrderLookup";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Enter your DEM PRODUCTION order number to see live status, payment state and delivery progress for your photo enlargement.",
};

export default function TrackPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-28">
      <Reveal>
        <span className="eyebrow">Order Tracking</span>
        <h1 className="mt-4 font-display text-[clamp(2.1rem,5vw,3.4rem)] font-black leading-tight text-white">
          Track your <span className="gold-text">order</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/50">
          Enter the order number from your confirmation email (it looks like{" "}
          <span className="font-mono text-gold-light">DEM-XXXXXX</span>).
        </p>
      </Reveal>
      <div className="mt-10">
        <OrderLookup />
      </div>
      <p className="mt-8 text-center text-sm text-white/45">
        Need help?{" "}
        <Link href="/contact" className="text-gold-light">
          Contact the studio
        </Link>{" "}
        or call +2347055546059.
      </p>
    </section>
  );
}
