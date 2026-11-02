import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { PhotoSessionForm } from "@/components/BookingForms";
import { PHOTO_SESSIONS, COMPANY } from "@/lib/catalog";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Photography Studio — Pre-Wedding, Birthday, Family & Portraits",
  description:
    "Professional photography in Aba, Abia State: pre-wedding, birthday, traditional marriage, family portraits, individual studio portraits and professional photo sessions. Book online with DEM PRODUCTION.",
};

const SAMPLES = [
  {
    src: "/images/portrait-prewedding.jpg",
    category: "Pre-Wedding",
    title: "Golden hour engagement",
    key: "pre-wedding",
  },
  {
    src: "/images/portrait-birthday.jpg",
    category: "Birthday",
    title: "Black & gold milestone",
    key: "birthday",
  },
  {
    src: "/images/portrait-traditional.jpg",
    category: "Traditional Marriage",
    title: "Coral & kente ceremony",
    key: "traditional-marriage",
  },
  {
    src: "/images/portrait-family.jpg",
    category: "Family Portraits",
    title: "Three generations",
    key: "family-portrait",
  },
  {
    src: "/images/studio.jpg",
    category: "Individual Studio",
    title: "Editorial headshot",
    key: "individual-portrait",
  },
  {
    src: "/images/shop-portrait.jpg",
    category: "Professional Session",
    title: "Campaign portrait",
    key: "professional-session",
  },
];

export default function PhotographyPage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/studio.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-top"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-ink" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="eyebrow">Photography Studio</span>
            <h1 className="mt-5 font-display text-[clamp(2.3rem,6vw,4.4rem)] font-black leading-[1.03] text-white">
              Light, poise and <span className="gold-text">presence.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60">
              Pre-wedding, birthday, traditional marriage, family and professional portrait
              sessions — shot in our Aba studio or on location across Nigeria.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#book" className="btn btn-gold">
                Book a Photography Session
              </a>
              <Link href="/shop" className="btn btn-outline">
                Enlarge Your Favourite Shot
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Samples */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Studio Portfolio"
            title={
              <>
                Six ways to be <span className="gold-text">remembered.</span>
              </>
            }
            subtitle="Every session includes a private gallery, professional retouching and print-ready files."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLES.map((sample, index) => (
            <Reveal key={sample.key} delay={index * 80} as="figure">
              <div className="group relative overflow-hidden rounded-2xl border border-white/10">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={sample.src}
                    alt={`${sample.category} photography by DEM PRODUCTION`}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                </div>
                <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[0.56rem] font-bold uppercase tracking-[0.24em] text-gold">
                    {sample.category}
                  </p>
                  <p className="mt-1.5 font-display text-lg font-bold text-white">
                    {sample.title}
                  </p>
                </figcaption>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Session pricing */}
      <section className="bg-ink-800 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Session Rates"
              title={
                <>
                  Book the session, <span className="gold-text">keep the frame.</span>
                </>
              }
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PHOTO_SESSIONS.map((session, index) => (
              <Reveal key={session.key} delay={index * 70} as="article">
                <div className="luxe-card flex h-full flex-col p-7">
                  <span className="text-[0.58rem] font-bold uppercase tracking-[0.24em] text-gold">
                    {session.duration}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-white">
                    {session.name}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">
                    {session.description}
                  </p>
                  <p className="mt-6 font-display text-3xl font-black gold-text">
                    {formatNaira(session.price)}
                  </p>
                  <a href="#book" className="btn btn-outline mt-6 w-full">
                    Book Now
                  </a>
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
              Reserve your <span className="gold-text">studio slot.</span>
            </h2>
            <p className="mt-6 text-[0.98rem] leading-relaxed text-white/55">
              Choose your session type and preferred date. We confirm within 24 hours with a
              call time, styling guidance and location details.
            </p>

            <div className="mt-9 relative overflow-hidden rounded-3xl border border-white/10">
              <div className="relative aspect-[16/10]">
                <Image
                  src="/images/portrait-family.jpg"
                  alt="Family portrait session"
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              <div className="absolute bottom-0 p-6">
                <p className="text-[0.56rem] font-bold uppercase tracking-[0.24em] text-gold">
                  Studio Aba · St. Michael&apos;s Road
                </p>
                <p className="mt-2 font-display text-xl font-bold text-white">
                  Professional light, timeless portraits.
                </p>
              </div>
            </div>

            <div className="mt-9 rounded-2xl border border-white/10 p-6">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
                Questions?
              </p>
              <p className="mt-3 text-sm text-white/55">
                Call{" "}
                <a href={`tel:${COMPANY.phoneHref}`} className="text-gold-light">
                  {COMPANY.phone}
                </a>{" "}
                or chat on{" "}
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
            <PhotoSessionForm sessions={PHOTO_SESSIONS} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
