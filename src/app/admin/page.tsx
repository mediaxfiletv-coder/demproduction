import type { Metadata } from "next";
import { Suspense } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Secure administrator control room for DEM PRODUCTION orders, bookings, payments and gallery.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <Reveal>
        <span className="eyebrow">Operations</span>
        <h1 className="mt-4 font-display text-[clamp(2rem,4.6vw,3.2rem)] font-black leading-tight text-white">
          Admin <span className="gold-text">Dashboard</span>
        </h1>
      </Reveal>
      <div className="mt-10">
        <Suspense fallback={<div className="luxe-card h-96 animate-pulse" />}>
          <AdminDashboard />
        </Suspense>
      </div>
    </section>
  );
}
