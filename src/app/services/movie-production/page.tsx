import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { MovieEnquiryForm } from "@/components/BookingForms";
import { MOVIE_SERVICES, COMPANY } from "@/lib/catalog";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Movie Production — Directing, Editing & Special Effects",
  description:
    "Professional movie production in Nigeria: four-day movie directing (₦300,000), one-hour movie editing with special effects (₦200,000) and full special effects production (₦600,000) by DEM PRODUCTION.",
};

const PROCESS = [
  {
    step: "01",
    title: "Development",
    copy: "Script breakdown, shot list, casting notes and a realistic production schedule.",
  },
  {
    step: "02",
    title: "Production",
    copy: "On-set direction with a full camera, lighting and sound department.",
  },
  {
    step: "03",
    title: "Post",
    copy: "Assembly edit, sound design, colour grade and visual effects finishing.",
  },
  {
    step: "04",
    title: "Delivery",
    copy: "Master files in your required format plus a festival-ready DCP package.",
  },
];

const SHOWREEL = [
  { src: "/images/film.jpg", label: "Feature film set · Aba" },
  { src: "/images/studio.jpg", label: "Studio lighting test" },
  { src: "/images/event.jpg", label: "Live event coverage" },
];

export default function MovieProductionPage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/film.jpg"
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
            <span className="eyebrow">Movie Production</span>
            <h1 className="mt-5 font-display text-[clamp(2.3rem,6vw,4.4rem)] font-black leading-[1.03] text-white">
              We direct, cut and <span className="gold-text">build worlds.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60">
              Feature films, documentaries, music videos and brand cinema — produced end to end
              by DAVID EJIBE MOVIE PRODUCTION LIMITED.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#enquire" className="btn btn-gold">
                Start a Production Enquiry
              </a>
              <Link href="/portfolio" className="btn btn-outline">
                See Our Work
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services & pricing */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Production Services"
            title={
              <>
                Clear scope. <span className="gold-text">Fixed pricing.</span>
              </>
            }
            subtitle="Three core services, quoted exactly as listed — no hidden crew fees."
          />
        </Reveal>

        <div className="mt-16 space-y-6">
          {MOVIE_SERVICES.map((service, index) => (
            <Reveal key={service.key} delay={index * 100} as="article">
              <div className="luxe-card overflow-hidden">
                <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative min-h-[260px]">
                    <Image
                      src={SHOWREEL[index % SHOWREEL.length].src}
                      alt={service.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                    <span className="absolute bottom-5 left-5 rounded-full border border-gold/40 bg-black/60 px-4 py-1.5 text-[0.56rem] font-bold uppercase tracking-[0.2em] text-gold-light backdrop-blur">
                      {SHOWREEL[index % SHOWREEL.length].label}
                    </span>
                  </div>
                  <div className="p-7 sm:p-9">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="eyebrow">{service.duration}</span>
                        <h3 className="mt-3 font-display text-3xl font-bold text-white">
                          {service.name}
                        </h3>
                      </div>
                      <p className="font-display text-3xl font-black gold-text">
                        {formatNaira(service.price)}
                      </p>
                    </div>
                    <div className="gold-line my-6" />
                    <p className="text-[0.95rem] leading-relaxed text-white/55">
                      {service.description}
                    </p>
                    <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      {service.deliverables.map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm text-white/60">
                          <span className="text-gold">✦</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <a href="#enquire" className="btn btn-outline mt-8">
                      Enquire About {service.name}
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-ink-800 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Our Process"
              title={
                <>
                  From script to <span className="gold-text">master file.</span>
                </>
              }
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((item, index) => (
              <Reveal key={item.step} delay={index * 90} as="article">
                <div className="luxe-card h-full p-7">
                  <p className="font-display text-5xl font-black gold-text">{item.step}</p>
                  <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <span className="eyebrow">Enquiry</span>
            <div className="gold-rule mt-4" />
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.12] text-white">
              Tell us about <span className="gold-text">your film.</span>
            </h2>
            <p className="mt-6 text-[0.98rem] leading-relaxed text-white/55">
              Share your concept, runtime and timeline. Our director will come back within 24
              hours with a treatment approach, schedule and a call sheet draft.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {MOVIE_SERVICES.map((service) => (
                <div
                  key={service.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <p className="text-[0.56rem] font-bold uppercase tracking-[0.2em] text-gold">
                    {service.name}
                  </p>
                  <p className="mt-2 font-display text-xl font-bold text-white">
                    {formatNaira(service.price)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-9 rounded-2xl border border-white/10 p-6">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
                Direct line
              </p>
              <p className="mt-3 text-sm text-white/55">
                Call{" "}
                <a href={`tel:${COMPANY.phoneHref}`} className="text-gold-light">
                  {COMPANY.phone}
                </a>{" "}
                or email{" "}
                <a href={`mailto:${COMPANY.email}`} className="text-gold-light">
                  {COMPANY.email}
                </a>
                .
              </p>
              <p className="mt-3 text-xs text-white/40">{COMPANY.address}</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <MovieEnquiryForm services={MOVIE_SERVICES} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
