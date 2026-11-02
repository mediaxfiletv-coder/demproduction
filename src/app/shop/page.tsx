import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { asc, eq } from "drizzle-orm";
import { productVariants, products, siteImages } from "@/db/schema";
import { AddToCartPanel } from "@/components/AddToCartPanel";
import { EnlargementFrame, type FrameStyle } from "@/components/EnlargementFrame";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Photo Enlargement Online Shop",
  description:
    "Order museum-grade photo enlargements from DEM PRODUCTION. Choose 16×20, 24×30, 30×60 or 36×72 inches with normal frames or acrylic frameless finishing. Secure Paystack checkout in Nigerian Naira.",
};

const STEPS = [
  {
    title: "Choose your dimension",
    copy: "Four gallery sizes from 16 × 20 in to a statement 36 × 72 in.",
  },
  {
    title: "Pick a frame finishing",
    copy: "Normal frame, acrylic frameless with glass or acrylic frameless without glass.",
  },
  {
    title: "Upload your photograph",
    copy: "Send us the frame you love — we enlarge and colour-grade it.",
  },
  {
    title: "Pay securely with Paystack",
    copy: "Visa, Mastercard and Verve accepted. Order confirmation sent instantly.",
  },
];

export default async function ShopPage() {
  const [productRows, variantRows, imageRows] = await Promise.all([
    db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.id)),
    db.select().from(productVariants).where(eq(productVariants.active, true)).orderBy(asc(productVariants.price)),
    db
      .select()
      .from(siteImages)
      .where(eq(siteImages.collection, "shop"))
      .orderBy(asc(siteImages.id)),
  ]);

  const catalogue = productRows.map((product) => ({
    ...product,
    variants: variantRows.filter((variant) => variant.productId === product.id),
  }));

  const samples = imageRows.length
    ? imageRows
    : [{ id: 0, title: "Sample", imageUrl: "/images/shop-portrait.jpg", category: "Portrait" }];

  const sizes = [...new Set(variantRows.map((variant) => variant.sizeLabel))];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 py-24 lg:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/shop-landscape.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-ink" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="eyebrow">Photo Enlargement Online Shop</span>
            <h1 className="mt-5 font-display text-[clamp(2.3rem,6vw,4.4rem)] font-black leading-[1.03] text-white">
              Gallery prints, <span className="gold-text">framed by hand.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60">
              Browse sample enlargements, select your dimension and frame finishing, upload your
              own photograph and check out securely. Every print is produced in our Aba workshop
              on archival paper with 100-year pigment inks.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#configurator" className="btn btn-gold">
                Build Your Enlargement
              </a>
              <Link href="/cart" className="btn btn-outline">
                View Cart
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {sizes.map((size) => (
                <span key={size} className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-champagne/55">
                  {size}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-white/10 bg-ink-800">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 90} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 font-display font-bold text-gold">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/45">{step.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sample gallery */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Sample Enlargements"
            title={
              <>
                See the finish <span className="gold-text">before you order.</span>
              </>
            }
            subtitle="Each sample below is shown as it will arrive — mounted, framed and ready to hang."
          />
        </Reveal>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {samples.map((sample, index) => {
            const frameStyles: FrameStyle[] = [
              "acrylic_with_glass",
              "normal_frame",
              "acrylic_without_glass",
              "normal_frame",
            ];
            const sizeLabels = sizes.length ? sizes : ["16 × 20 in"];
            return (
              <Reveal key={sample.id} delay={index * 90} as="figure">
                <EnlargementFrame
                  src={sample.imageUrl}
                  alt={sample.title}
                  sizeLabel={sizeLabels[index % sizeLabels.length]}
                  frameStyle={frameStyles[index % frameStyles.length]}
                />
                <figcaption className="mt-5 text-center">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.24em] text-gold">
                    {sample.category || "Sample"}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-white">{sample.title}</p>
                </figcaption>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Configurator */}
      <section id="configurator" className="scroll-mt-24 bg-ink-800 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Build Your Order"
              title={
                <>
                  Configure, upload and <span className="gold-text">add to cart.</span>
                </>
              }
            />
          </Reveal>
          <div className="mt-14 space-y-10">
            {catalogue.map((product) => (
              <Reveal key={product.id}>
                <AddToCartPanel
                  product={product}
                  sampleImage={samples[0]?.imageUrl ?? ""}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Full price list */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Official Price List"
            title={
              <>
                Transparent pricing, <span className="gold-text">no surprises.</span>
              </>
            }
          />
        </Reveal>
        <Reveal delay={100} className="mt-12">
          <div className="table-wrap">
            <table className="admin-table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Normal Frame</th>
                  <th>Acrylic With Glass</th>
                  <th>Acrylic Without Glass</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((size) => {
                  const row = variantRows.filter((variant) => variant.sizeLabel === size);
                  const find = (type: string) =>
                    row.find((variant) => variant.frameType === type);
                  return (
                    <tr key={size}>
                      <td className="font-semibold text-gold-light">{size}</td>
                      <td>{find("normal_frame") ? formatNaira(find("normal_frame")!.price) : "—"}</td>
                      <td>
                        {find("acrylic_with_glass")
                          ? formatNaira(find("acrylic_with_glass")!.price)
                          : "—"}
                      </td>
                      <td>
                        {find("acrylic_without_glass")
                          ? formatNaira(find("acrylic_without_glass")!.price)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>
    </>
  );
}
