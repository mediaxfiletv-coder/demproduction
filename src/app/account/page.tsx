import type { Metadata } from "next";
import { Suspense } from "react";
import AccountClient from "@/components/AccountClient";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "My Account — Orders, Bookings & Payments",
  description:
    "Sign in to your DEM PRODUCTION account to track orders, view payment history, manage bookings and update your profile.",
};

export default function AccountPage() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-28">
      <Reveal>
        <span className="eyebrow">Customer Experience</span>
        <h1 className="mt-4 font-display text-[clamp(2.1rem,5vw,3.4rem)] font-black leading-tight text-white">
          My <span className="gold-text">account</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50">
          Register or sign in to see your order history, payment history, booking history and
          tracking — all in one place.
        </p>
      </Reveal>
      <div className="mt-12">
        <Suspense fallback={<div className="luxe-card h-96 animate-pulse" />}>
          <AccountClient />
        </Suspense>
      </div>
    </section>
  );
}
