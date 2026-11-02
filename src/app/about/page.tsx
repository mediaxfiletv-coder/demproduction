import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { COMPANY } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "About — David Ejibe Movie Production Limited",
  description:
    "DEM PRODUCTION is the trading name of DAVID EJIBE MOVIE PRODUCTION LIMITED, a film, event coverage and photography house based on St. Michael's Road, Aba, Abia State, Nigeria.",
};

const TIMELINE = [
  ["2013", "First camera", "David Ejibe picks up a camera and begins documenting weddings across Abia State."],
  ["2016", "The studio opens", "A permanent photography studio opens on St. Michael's Road, Aba."],
  ["2019", "First feature", "DEM directs and edits its first feature-length movie."],
  ["2022", "Aerial division", "Licensed drone piloting added to every event coverage package."],
  ["2026", "Print workshop", "Museum-grade photo enlargement workshop opens for nationwide orders."],
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0">
          <Image
            src="/images/film.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/92 via-black/75 to-ink" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="eyebrow">About Us</span>
            <h1 className="mt-5 font-display text-[clamp(2.2rem,5.6vw,4.2rem)] font-black leading-[1.04] text-white">
              DAVID EJIBE MOVIE PRODUCTION <span className="gold-text">LIMITED</span>
            </h1>
            <div className="gold-rule mt-7" />
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/60">
              Trading as DEM PRODUCTION — a film, event coverage, photography and print house
              built in Aba and working across Nigeria.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow">Our story</span>
            <div className="gold-rule mt-4" />
            <h2 className="mt-6 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.14] text-white">
              Craft first. <span className="gold-text">Always.</span>
            </h2>
            <div className="mt-6 space-y-5 text-[0.98rem] leading-relaxed text-white/55">
              <p>
                DEM PRODUCTION was founded on one belief: an African story deserves
                international-grade production values. From a single camera to a full
                production house, we have directed films, covered thousands of events and
                framed countless family portraits.
              </p>
              <p>
                Today our pipeline covers four disciplines — filmmaking, event coverage,
                photography and photo enlargement — so a client can move from shoot to screen
                to wall print without ever leaving the house.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ol className="space-y-4">
              {TIMELINE.map(([year, title, copy]) => (
                <li
                  key={year}
                  className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <span className="font-display text-2xl font-black gold-text">{year}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/45">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink-800 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="What we stand for"
              title={
                <>
                  Four disciplines, <span className="gold-text">one house.</span>
                </>
              }
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Filmmaking", "Directing, editing and special effects for features and documentaries.", "/services/movie-production"],
              ["Event Coverage", "Video, photography, photobook, drone, red carpet and projector services.", "/services/event-coverage"],
              ["Photography", "Studio and location sessions for every milestone and occasion.", "/services/photography"],
              ["Photo Enlargement", "Museum-grade prints from 16 × 20 to 36 × 72 inches.", "/shop"],
            ].map(([title, copy, href], index) => (
              <Reveal key={title} delay={index * 90} as="article">
                <Link href={href} className="luxe-card block h-full p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-gold">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{copy}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 text-center lg:px-8">
        <Reveal>
          <p className="font-display text-2xl font-bold text-white sm:text-3xl">
            &ldquo;{COMPANY.tagline}&rdquo;
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn btn-gold">
              Visit the Studio
            </Link>
            <Link href="/portfolio" className="btn btn-outline">
              See Our Work
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
