import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { COMPANY } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact — Aba Studio, Abia State",
  description:
    "Contact DAVID EJIBE MOVIE PRODUCTION LIMITED (DEM PRODUCTION): No. 56, St. Michael's Road, Aba, Abia State, Nigeria. Phone +2347055546059, WhatsApp and contact form.",
};

const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  "St Michael's Road, Aba, Abia State, Nigeria",
)}&z=14&output=embed`;

const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "St Michael's Road, Aba, Abia State, Nigeria",
)}`;

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(212,175,55,0.16),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="eyebrow">Contact</span>
            <h1 className="mt-5 font-display text-[clamp(2.3rem,6vw,4.4rem)] font-black leading-[1.03] text-white">
              DAVID EJIBE MOVIE PRODUCTION <span className="gold-text">LIMITED</span>
            </h1>
            <div className="gold-rule mt-7" />
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/60">
              Visit the studio, call the production line or send us a message — we reply within
              24 hours.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Address",
              lines: [COMPANY.address, COMPANY.addressNote],
              href: MAPS_LINK,
              cta: "Open in Google Maps",
            },
            {
              label: "Telephone",
              lines: [COMPANY.phone, COMPANY.hours],
              href: `tel:${COMPANY.phoneHref}`,
              cta: "Call now",
            },
            {
              label: "WhatsApp",
              lines: [COMPANY.phone, "Instant replies during studio hours"],
              href: COMPANY.whatsapp,
              cta: "Start a chat",
            },
            {
              label: "Email",
              lines: [COMPANY.email, "For briefs, invoices and press"],
              href: `mailto:${COMPANY.email}`,
              cta: "Compose email",
            },
          ].map((card, index) => (
            <Reveal key={card.label} delay={index * 90} as="article">
              <a
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="luxe-card block h-full p-6"
              >
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.26em] text-gold">
                  {card.label}
                </p>
                <div className="mt-4 space-y-1.5">
                  {card.lines.map((line) => (
                    <p key={line} className="text-sm leading-relaxed text-white/65">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="mt-5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold-light">
                  {card.cta} →
                </p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={120} className="space-y-6">
            <div className="luxe-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
                  Find the studio
                </p>
                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold-light"
                >
                  Directions →
                </a>
              </div>
              <div className="relative h-[380px] w-full border-t border-white/10">
                <iframe
                  title="DEM PRODUCTION studio location on Google Maps"
                  src={MAPS_EMBED}
                  className="h-full w-full grayscale-[0.35] contrast-125"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              </div>
            </div>

            <div className="luxe-card p-6">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
                Studio hours
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <dt className="text-white/55">Monday – Saturday</dt>
                  <dd className="text-white">9:00am – 7:00pm</dd>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <dt className="text-white/55">Sunday</dt>
                  <dd className="text-white">By appointment</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/55">Event shoots</dt>
                  <dd className="text-white">Any day, any location</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 bg-ink-800">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Prefer instant?"
              title={
                <>
                  Message us on <span className="gold-text">WhatsApp.</span>
                </>
              }
              subtitle={`Chat directly with the production team on ${COMPANY.phone}.`}
            />
            <div className="mt-8 flex justify-center">
              <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                Open WhatsApp Chat
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
