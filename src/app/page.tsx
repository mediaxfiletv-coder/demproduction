import Link from "next/link";
import Image from "next/image";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { EnlargementFrame } from "@/components/EnlargementFrame";
import { COMPANY, EVENT_PACKAGES, MOVIE_SERVICES } from "@/lib/catalog";
import { formatNaira } from "@/lib/utils";
import { db } from "@/db";
import { siteImages } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const STATS = [
  { value: "12+", label: "Years Behind The Lens" },
  { value: "480+", label: "Events Covered" },
  { value: "1,200+", label: "Prints Framed" },
  { value: "36", label: "States Reached" },
];

const SERVICES = [
  {
    title: "Movie Production",
    copy: "Directing, editing and special effects for feature films, documentaries and brand cinema.",
    href: "/services/movie-production",
    image: "/images/film.jpg",
    tag: "Film",
  },
  {
    title: "Event Coverage",
    copy: "Cinematic weddings, red carpets and celebrations with drone, projector and photobook services.",
    href: "/services/event-coverage",
    image: "/images/event.jpg",
    tag: "Events",
  },
  {
    title: "Photography Studio",
    copy: "Pre-wedding, birthday, traditional marriage, family and professional portrait sessions.",
    href: "/services/photography",
    image: "/images/studio.jpg",
    tag: "Studio",
  },
  {
    title: "Photo Enlargement",
    copy: "Museum-grade enlargements from 16 × 20 to 36 × 72 inches with premium frame finishing.",
    href: "/shop",
    image: "/images/shop-portrait.jpg",
    tag: "Shop",
  },
];

export default async function HomePage() {
  let portfolio: { imageUrl: string; title: string; category: string }[] = [];
  try {
    const rows = await db
      .select()
      .from(siteImages)
      .where(eq(siteImages.collection, "portfolio"))
      .orderBy(asc(siteImages.id))
      .limit(6);
    portfolio = rows;
  } catch {
    portfolio = [];
  }

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Cinematic film camera on a premium production set"
            fill
            priority
            sizes="100vw"
            className="animate-kenburns object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-ink" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.18),transparent_55%)]" />
          <div className="noise-overlay" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-32 lg:px-8">
          <div className="max-w-4xl">
            <p className="eyebrow animate-fade-up">David Ejibe Movie Production Limited</p>
            <h1 className="mt-6 font-display text-[clamp(2.9rem,8.2vw,6.4rem)] font-black leading-[0.95] tracking-tight text-white">
              <span className="block animate-fade-up">DEM</span>
              <span
                className="gold-text block animate-fade-up"
                style={{ animationDelay: "120ms" }}
              >
                PRODUCTION
              </span>
            </h1>
            <div
              className="gold-rule mt-8 animate-fade-up"
              style={{ animationDelay: "200ms" }}
            />
            <p
              className="mt-8 max-w-2xl font-display text-[clamp(1.25rem,3.1vw,2.1rem)] font-medium leading-snug text-white/90 animate-fade-up"
              style={{ animationDelay: "280ms" }}
            >
              We Capture Your Moments, We Create Your Memories.
            </p>
            <p
              className="mt-6 max-w-xl text-base leading-relaxed text-white/60 animate-fade-up"
              style={{ animationDelay: "360ms" }}
            >
              An African film and photography house from Aba, Abia State — crafting cinematic
              event coverage, feature film production, studio photography and museum-grade
              photo enlargements.
            </p>

            <div
              className="mt-10 flex flex-wrap gap-4 animate-fade-up"
              style={{ animationDelay: "440ms" }}
            >
              <Link href="/shop" className="btn btn-gold">
                Shop Photo Enlargements
              </Link>
              <Link href="/services/event-coverage" className="btn btn-outline">
                Book Our Services
              </Link>
              <Link href="#services" className="btn btn-ghost">
                Explore Our Services
              </Link>
            </div>

            <div
              className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 animate-fade-up"
              style={{ animationDelay: "540ms" }}
            >
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-champagne/50">
                Secured payments by
              </span>
              <span className="font-display text-lg font-bold text-white/70">Paystack</span>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-champagne/50">
                Visa · Mastercard · Verve
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-champagne/45">
            Scroll
          </span>
          <span className="h-12 w-px bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="border-y border-white/10 bg-ink-800">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-white/10 px-5 py-10 sm:grid-cols-4 sm:divide-x lg:px-8">
          {STATS.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 90}
              className="px-4 py-4 text-center sm:py-0"
            >
              <p className="font-display text-4xl font-bold gold-text">{stat.value}</p>
              <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/45">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ ABOUT ============================ */}
      <section className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10">
              <Image
                src="/images/studio.jpg"
                alt="DEM PRODUCTION studio portrait session"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-8 -right-4 w-48 rounded-2xl border border-gold/30 bg-ink-800/95 p-5 shadow-luxe backdrop-blur-xl sm:-right-8">
              <p className="font-display text-3xl font-bold gold-text">₦20k</p>
              <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/50">
                Enlargements from
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <span className="eyebrow">The House of DEM</span>
            <div className="gold-rule mt-4" />
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.12] text-white">
              Internationally styled. <span className="gold-text">Proudly African.</span>
            </h2>
            <div className="mt-6 space-y-5 text-[0.98rem] leading-relaxed text-white/55">
              <p>
                DAVID EJIBE MOVIE PRODUCTION LIMITED trades as DEM PRODUCTION — a full-service
                film and photography studio on St. Michael&apos;s Road, Aba. We direct feature
                films, cover weddings and red carpets, shoot studio portraits and hand-frame
                gallery prints.
              </p>
              <p>
                Every project moves through one pipeline: story, capture, grade, print. That is
                why a DEM photograph looks the same on a phone screen as it does on a 36 × 72
                inch acrylic wall piece.
              </p>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {[
                ["Cinematic colour grading", "on every frame"],
                ["Archival printing", "100-year pigment inks"],
                ["Secure Paystack checkout", "Naira, card & transfer"],
                ["Nationwide delivery", "from our Aba workshop"],
              ].map(([title, sub]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <p className="text-sm font-semibold text-gold-light">{title}</p>
                  <p className="mt-1 text-xs text-white/45">{sub}</p>
                </div>
              ))}
            </div>
            <Link href="/portfolio" className="btn btn-outline mt-9">
              View Our Portfolio
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============================ SERVICES ============================ */}
      <section id="services" className="relative bg-ink-800 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="What We Do"
              title={
                <>
                  Four studios. <span className="gold-text">One standard.</span>
                </>
              }
              subtitle="From a 16 × 20 inch framed portrait to a four-day feature film shoot — every service is delivered by our own in-house crew."
            />
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, index) => (
              <Reveal key={service.title} delay={index * 110} as="article">
                <Link href={service.href} className="group luxe-card block h-full overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 90vw, 25vw"
                      className="object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/20 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-black/60 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-gold-light backdrop-blur">
                      {service.tag}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-white">{service.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/50">{service.copy}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold">
                      Explore
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ SHOWCASE ============================ */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="Gallery Enlargement"
            title={
              <>
                Your photograph, <span className="gold-text">museum framed.</span>
              </>
            }
            subtitle="Upload your favourite frame and we will enlarge, colour-grade and hand-finish it. Choose your dimension and frame finishing — prices start at ₦20,000."
          />
        </Reveal>

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
          <Reveal className="mx-auto w-full max-w-md">
            <EnlargementFrame
              src="/images/shop-portrait.jpg"
              alt="Sample museum-framed portrait enlargement"
              sizeLabel="16 × 20 in"
              frameStyle="acrylic_with_glass"
              priority
            />
            <p className="mt-6 text-center text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-champagne/50">
              16 × 20 in · Acrylic With Glass · {formatNaira(45000)}
            </p>
          </Reveal>

          <Reveal delay={140}>
            <h3 className="font-display text-3xl font-bold text-white">
              The enlargement <span className="gold-text">price list</span>
            </h3>
            <div className="gold-line my-7" />
            <div className="space-y-5">
              {[
                {
                  size: "16 × 20 inches",
                  rows: [
                    ["Normal Frame", 20000],
                    ["Acrylic With Glass", 45000],
                    ["Acrylic Without Glass", 32000],
                  ],
                },
                {
                  size: "24 × 30 inches",
                  rows: [
                    ["Normal Frame", 71000],
                    ["Acrylic With Glass", 80000],
                    ["Acrylic Without Glass", 74000],
                  ],
                },
                {
                  size: "30 × 60 inches",
                  rows: [
                    ["Normal Frame", 100000],
                    ["Acrylic With Glass", 120000],
                    ["Acrylic Without Glass", 105000],
                  ],
                },
                {
                  size: "36 × 72 inches",
                  rows: [
                    ["Normal Frame", 150000],
                    ["Acrylic Frameless With Glass", 200000],
                    ["Acrylic Frameless Without Glass", 170000],
                  ],
                },
              ].map((group) => (
                <div
                  key={group.size}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.26em] text-gold">
                    {group.size}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {group.rows.map(([label, price]) => (
                      <li
                        key={label as string}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-white/60">{label}</span>
                        <span className="font-semibold text-gold-light">
                          {formatNaira(price as number)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link href="/shop" className="btn btn-gold mt-9">
              Shop Photo Enlargements
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============================ PACKAGES ============================ */}
      <section className="relative overflow-hidden bg-ink-800 py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(212,175,55,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Event Coverage"
              title={
                <>
                  Packages for every <span className="gold-text">celebration.</span>
                </>
              }
              subtitle="Professional video coverage, photography, photobooks, drone piloting, red carpet and projector services."
            />
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {EVENT_PACKAGES.map((pkg, index) => (
              <Reveal key={pkg.code} delay={index * 100} as="article">
                <div
                  className={`luxe-card flex h-full flex-col p-7 ${
                    pkg.featured ? "border-gold/45" : ""
                  }`}
                >
                  {pkg.featured ? (
                    <span className="mb-4 w-fit rounded-full bg-gold px-3 py-1 text-[0.56rem] font-bold uppercase tracking-[0.2em] text-black">
                      Most requested
                    </span>
                  ) : null}
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-gold">
                    Section {pkg.code}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold text-white">{pkg.name}</h3>
                  <p className="mt-4 font-display text-3xl font-bold gold-text">
                    {formatNaira(pkg.price)}
                  </p>
                  <p className="mt-3 text-sm text-white/45">{pkg.tagline}</p>
                  <div className="gold-line my-6" />
                  <ul className="flex-1 space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm text-white/65">
                        <span className="mt-1 text-gold">✦</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/services/event-coverage?package=${pkg.code}`}
                    className={`btn mt-8 w-full ${pkg.featured ? "btn-gold" : "btn-outline"}`}
                  >
                    Book Now
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ MOVIE ============================ */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow">Movie Production</span>
            <div className="gold-rule mt-4" />
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.12] text-white">
              Nollywood-grade <span className="gold-text">filmmaking.</span>
            </h2>
            <p className="mt-6 text-[0.98rem] leading-relaxed text-white/55">
              Directing, editing and special effects delivered by a crew that has shaped
              feature films, music videos and documentary cinema across Nigeria.
            </p>
            <div className="mt-9 space-y-4">
              {MOVIE_SERVICES.map((service) => (
                <div
                  key={service.key}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div>
                    <p className="font-semibold text-white">{service.name}</p>
                    <p className="mt-1 text-xs text-white/45">{service.duration}</p>
                  </div>
                  <p className="font-display text-xl font-bold gold-text">
                    {formatNaira(service.price)}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/services/movie-production" className="btn btn-gold mt-9">
              Start a Production Enquiry
            </Link>
          </Reveal>

          <Reveal delay={140} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10">
              <Image
                src="/images/film.jpg"
                alt="Movie production set with clapperboard"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-gold">
                  Behind the scenes
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-white">
                  Four days of professional movie directing
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ PORTFOLIO STRIP ============================ */}
      {portfolio.length > 0 ? (
        <section className="bg-ink-800 py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="Selected Work"
                title={
                  <>
                    A portfolio of <span className="gold-text">lasting memories.</span>
                  </>
                }
              />
            </Reveal>
          </div>
          <div className="mt-14 flex gap-5 overflow-x-auto px-5 pb-4 hide-scrollbar lg:px-8">
            {portfolio.map((item, index) => (
              <Reveal
                key={item.imageUrl + index}
                delay={index * 80}
                className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-[30vw]"
              >
                <figure className="luxe-card overflow-hidden">
                  <div className="relative h-72">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 78vw, 30vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    <figcaption className="absolute bottom-0 p-5">
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.24em] text-gold">
                        {item.category}
                      </p>
                      <p className="mt-1 font-display text-lg font-bold text-white">
                        {item.title}
                      </p>
                    </figcaption>
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-7xl px-5 lg:px-8">
            <Link href="/portfolio" className="btn btn-outline">
              View Full Portfolio
            </Link>
          </div>
        </section>
      ) : null}

      {/* ============================ TESTIMONIALS ============================ */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Client Words"
            title={
              <>
                Trusted across <span className="gold-text">Nigeria.</span>
              </>
            }
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "Our wedding film looked like a cinema release. The drone shots and the photobook are now family treasures.",
              name: "Chiamaka & Ifeanyi",
              role: "Wedding · Umuahia",
            },
            {
              quote:
                "I uploaded a portrait from my phone and received a 36 × 72 acrylic enlargement that stopped everyone at the lobby.",
              name: "Emeka O.",
              role: "Photo enlargement · Aba",
            },
            {
              quote:
                "Four days of directing reshaped our entire feature. Professional, calm and incredibly creative.",
              name: "Blessing A.",
              role: "Film producer · Lagos",
            },
          ].map((item, index) => (
            <Reveal key={item.name} delay={index * 110} as="article">
              <blockquote className="luxe-card h-full p-7">
                <span className="font-display text-5xl leading-none text-gold/40">“</span>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-white/70">
                  {item.quote}
                </p>
                <footer className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-sm font-semibold text-gold-light">{item.name}</p>
                  <p className="mt-1 text-xs text-white/40">{item.role}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/event.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Let&apos;s create</span>
            <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.6rem)] font-black leading-[1.05] text-white">
              Your moments. <br />
              <span className="gold-text">Our creativity.</span> <br />
              Lasting memories.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/60">
              Tell us about your event, film or print. Our production team replies within 24
              hours.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/services/event-coverage" className="btn btn-gold">
                Book Our Services
              </Link>
              <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                WhatsApp Us
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
