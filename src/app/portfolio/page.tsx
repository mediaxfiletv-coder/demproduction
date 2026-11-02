import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { siteImages } from "@/db/schema";
import { Reveal, SectionHeading } from "@/components/Reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Portfolio — Film, Events & Photography",
  description:
    "Selected work from DEM PRODUCTION: feature film sets, wedding and corporate event coverage, traditional ceremonies and studio photography from Aba, Nigeria.",
};

export default async function PortfolioPage() {
  let rows: (typeof siteImages.$inferSelect)[] = [];
  try {
    rows = await db
      .select()
      .from(siteImages)
      .where(eq(siteImages.collection, "portfolio"))
      .orderBy(asc(siteImages.id));
  } catch {
    rows = [];
  }

  const fallback = [
    { id: 0, title: "Feature Film Production", category: "Film", imageUrl: "/images/film.jpg" },
    { id: 1, title: "Red Carpet Coverage", category: "Events", imageUrl: "/images/event.jpg" },
    { id: 2, title: "Studio Portrait", category: "Studio", imageUrl: "/images/studio.jpg" },
  ];
  const items = rows.length ? rows : fallback;

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 py-20 lg:py-28">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/92 via-black/75 to-ink" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="eyebrow">Selected Work</span>
            <h1 className="mt-5 font-display text-[clamp(2.3rem,6vw,4.4rem)] font-black leading-[1.03] text-white">
              A portfolio of <span className="gold-text">lasting memories.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60">
              Films, weddings, ceremonies and portraits — every frame graded in the DEM house
              look.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Gallery"
            title={
              <>
                Recent <span className="gold-text">productions.</span>
              </>
            }
          />
        </Reveal>

        <div className="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {items.map((item, index) => (
            <Reveal
              key={`${item.id}-${index}`}
              delay={(index % 3) * 90}
              className="mb-6 break-inside-avoid"
            >
              <figure className="group relative overflow-hidden rounded-2xl border border-white/10">
                <div className={`relative ${index % 3 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 90vw, 33vw"
                    className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                </div>
                <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[0.56rem] font-bold uppercase tracking-[0.24em] text-gold">
                    {item.category || "Production"}
                  </p>
                  <p className="mt-1.5 font-display text-lg font-bold text-white">{item.title}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-ink-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-14 lg:px-8">
          <div>
            <p className="eyebrow">Your story, our lens</p>
            <p className="mt-4 max-w-xl font-display text-2xl font-bold text-white">
              Want work like this for <span className="gold-text">your event or film?</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/services/event-coverage" className="btn btn-gold">
              Book Event Coverage
            </Link>
            <Link href="/services/movie-production" className="btn btn-outline">
              Start a Film Project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
