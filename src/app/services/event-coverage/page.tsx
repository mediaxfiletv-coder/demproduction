import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, SectionHeading } from "@/components/Reveal";
import {
  EventBookingForm,
  FormBoundary,
} from "@/components/BookingForms";
import { EVENT_PACKAGES, COMPANY } from "@/lib/catalog";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Event Coverage Packages — Weddings, Corporate & Celebrations",
  description:
    "Professional event coverage in Nigeria by DEM PRODUCTION: video coverage, photography, photobooks, drone piloting, red carpet and projector services. Packages from ₦270,000. Book online.",
};

const DELIVERABLES = [
  {
    title: "Professional video coverage",
    copy: "Multi-camera 4K capture, gimbal movement and cinema-grade audio for every key moment.",
  },
  {
    title: "Photography & photoshoot",
    copy: "Edited, colour-graded stills delivered in a private online gallery within 14 days.",
  },
  {
    title: "Photobook",
    copy: "Lay-flat hardcover albums designed in-studio and printed on archival stock.",
  },
  {
    title: "Drone piloting",
    copy: "Licensed aerial cinematography of your venue, arrival and outdoor moments.",
  },
  {
    title: "Red carpet services",
    copy: "Carpet, step-and-repeat backdrop, ushers and on-the-spot guest portraits.",
  },
  {
    title: "Projector services",
    copy: "Full HD projection with screen, sound and a live highlight reel for your guests.",
  },
];

export default function EventCoveragePage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/event.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-ink" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="eyebrow">Event Coverage</span>
            <h1 className="mt-5 font-display text-[clamp(2.3rem,6vw,4.4rem)] font-black leading-[1.03] text-white">
              Every guest. Every glance. <span className="gold-text">Kept forever.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60">
              Weddings, birthdays, corporate galas, traditional marriages and red carpet
              premieres — covered by a crew that treats your day like a feature film.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#book" className="btn btn-gold">
                Book Our Services
              </a>
              <a
                href={COMPANY.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                WhatsApp the Team
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Packages */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Coverage Packages"
            title={
              <>
                Four sections. <span className="gold-text">One promise.</span>
              </>
            }
            subtitle="Select the section that fits your celebration — every package is delivered by our full in-house crew."
          />
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {EVENT_PACKAGES.map((pkg, index) => (
            <Reveal key={pkg.code} delay={index * 100} as="article">
              <div
                className={`luxe-card flex h-full flex-col p-7 ${
                  pkg.featured ? "border-gold/50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-gold">
                    Section {pkg.code}
                  </span>
                  {pkg.featured ? (
                    <span className="rounded-full bg-gold px-3 py-1 text-[0.54rem] font-bold uppercase tracking-[0.18em] text-black">
                      Full Package
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-white">{pkg.name}</h3>
                <p className="mt-5 font-display text-4xl font-black gold-text">
                  {formatNaira(pkg.price)}
                </p>
                <p className="mt-3 text-sm text-white/45">{pkg.tagline}</p>
                <div className="gold-line my-6" />
                <ul className="flex-1 space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-white/65">
                      <span className="mt-0.5 text-gold">✦</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={`?package=${pkg.code}#book`}
                  data-testid={`book-package-${pkg.code}`}
                  className={`btn mt-8 w-full ${pkg.featured ? "btn-gold" : "btn-outline"}`}
                >
                  Book Now
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="bg-ink-800 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Capabilities"
              title={
                <>
                  What our crew <span className="gold-text">brings.</span>
                </>
              }
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DELIVERABLES.map((item, index) => (
              <Reveal key={item.title} delay={index * 80} as="article">
                <div className="luxe-card h-full p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-gold">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <span className="eyebrow">Booking</span>
            <div className="gold-rule mt-4" />
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.12] text-white">
              Tell us the date. <span className="gold-text">We&apos;ll be there.</span>
            </h2>
            <p className="mt-6 text-[0.98rem] leading-relaxed text-white/55">
              Submit your event details and our production manager will call you within 24 hours
              to confirm availability, run a site visit and issue your deposit invoice.
            </p>

            <div className="mt-9 space-y-4">
              {[
                ["Instant confirmation", "A booking reference and email are sent immediately."],
                ["Flexible deposit", "50% deposit secures your date, balance on event day."],
                ["Nationwide travel", "Aba, Lagos, Abuja, Port Harcourt and beyond."],
                ["Edited in 14 days", "Full gallery and highlight film delivered within two weeks."],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <span className="mt-1 text-gold">✦</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/45">{copy}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 p-6">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
                Prefer to talk?
              </p>
              <p className="mt-3 text-sm text-white/55">
                Call{" "}
                <a href={`tel:${COMPANY.phoneHref}`} className="text-gold-light">
                  {COMPANY.phone}
                </a>{" "}
                or message us on{" "}
                <a
                  href={COMPANY.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-light"
                >
                  WhatsApp
                </a>
                .
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <FormBoundary>
              <EventBookingForm packages={EVENT_PACKAGES} />
            </FormBoundary>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 bg-ink-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-12 lg:px-8">
          <p className="max-w-xl font-display text-2xl font-bold text-white">
            Also booking{" "}
            <span className="gold-text">photography and photo enlargements</span>?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/services/photography" className="btn btn-outline">
              Photography Studio
            </Link>
            <Link href="/shop" className="btn btn-gold">
              Photo Enlargement Shop
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
