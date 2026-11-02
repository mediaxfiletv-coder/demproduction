/**
 * Idempotent seed for DEM PRODUCTION.
 * Run with:  npx tsx scripts/seed.ts
 */
import { randomBytes, scryptSync } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { admins, productVariants, products, siteImages } from "../src/db/schema";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@demproduction.ng").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@12345";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "David Ejibe";

function hash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

/** Official DEM PRODUCTION enlargement price list (Nigeran Naira). */
const PRICE_LIST: {
  size: string;
  finishes: { frameType: string; frameLabel: string; price: number }[];
}[] = [
  {
    size: "36 × 72 in",
    finishes: [
      { frameType: "normal_frame", frameLabel: "Normal Frame", price: 150_000 },
      {
        frameType: "acrylic_with_glass",
        frameLabel: "Acrylic Frameless With Glass",
        price: 200_000,
      },
      {
        frameType: "acrylic_without_glass",
        frameLabel: "Acrylic Frameless Without Glass",
        price: 170_000,
      },
    ],
  },
  {
    size: "16 × 20 in",
    finishes: [
      { frameType: "normal_frame", frameLabel: "Normal Frame", price: 20_000 },
      { frameType: "acrylic_with_glass", frameLabel: "Acrylic With Glass", price: 45_000 },
      {
        frameType: "acrylic_without_glass",
        frameLabel: "Acrylic Without Glass",
        price: 32_000,
      },
    ],
  },
  {
    size: "24 × 30 in",
    finishes: [
      { frameType: "normal_frame", frameLabel: "Normal Frame", price: 71_000 },
      { frameType: "acrylic_with_glass", frameLabel: "Acrylic With Glass", price: 80_000 },
      {
        frameType: "acrylic_without_glass",
        frameLabel: "Acrylic Without Glass",
        price: 74_000,
      },
    ],
  },
  {
    size: "30 × 60 in",
    finishes: [
      { frameType: "normal_frame", frameLabel: "Normal Frame", price: 100_000 },
      { frameType: "acrylic_with_glass", frameLabel: "Acrylic With Glass", price: 120_000 },
      {
        frameType: "acrylic_without_glass",
        frameLabel: "Acrylic Without Glass",
        price: 105_000,
      },
    ],
  },
];

const SHOP_SAMPLES = [
  {
    title: "Editorial Portrait Sample",
    imageUrl: "/images/shop-portrait.jpg",
    category: "Portrait",
  },
  {
    title: "Golden Savanna Landscape Sample",
    imageUrl: "/images/shop-landscape.jpg",
    category: "Landscape",
  },
  { title: "Studio Session Sample", imageUrl: "/images/studio.jpg", category: "Studio" },
  { title: "Traditional Ceremony Sample", imageUrl: "/images/portrait-traditional.jpg", category: "Culture" },
];

const PORTFOLIO = [
  { title: "Red Carpet Event Coverage", imageUrl: "/images/event.jpg", category: "Events" },
  { title: "Feature Film Production", imageUrl: "/images/film.jpg", category: "Film" },
  { title: "Pre-Wedding Story", imageUrl: "/images/portrait-prewedding.jpg", category: "Wedding" },
  { title: "Birthday Celebration", imageUrl: "/images/portrait-birthday.jpg", category: "Events" },
  { title: "Traditional Marriage", imageUrl: "/images/portrait-traditional.jpg", category: "Wedding" },
  { title: "Family Portrait", imageUrl: "/images/portrait-family.jpg", category: "Studio" },
  { title: "Studio Portrait", imageUrl: "/images/studio.jpg", category: "Studio" },
];

async function seedAdmin() {
  const existing = await db.select().from(admins).where(eq(admins.email, ADMIN_EMAIL)).limit(1);
  if (existing[0]) {
    console.log(`admin already exists: ${ADMIN_EMAIL}`);
    return;
  }
  await db.insert(admins).values({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash: hash(ADMIN_PASSWORD),
  });
  console.log(`admin created: ${ADMIN_EMAIL}`);
}

async function seedProducts() {
  const existing = await db.select().from(products).limit(1);
  if (existing[0]) {
    console.log("products already seeded");
    return;
  }
  const inserted = await db
    .insert(products)
    .values({
      name: "Signature Photo Enlargement",
      slug: "signature-photo-enlargement",
      description:
        "Museum-grade photographic enlargements printed on archival paper and finished by hand in our Aba studio. Choose your dimension and frame finishing — every print is colour-graded and inspected before dispatch.",
      imageUrl: "/images/shop-portrait.jpg",
    })
    .returning({ id: products.id });
  const productId = inserted[0].id;

  for (const size of PRICE_LIST) {
    for (const finish of size.finishes) {
      await db.insert(productVariants).values({
        productId,
        sizeLabel: size.size,
        frameType: finish.frameType,
        frameLabel: finish.frameLabel,
        price: finish.price,
      });
    }
  }
  console.log(`product + ${PRICE_LIST.length * 3} variants seeded`);
}

async function seedImages() {
  const existing = await db.select().from(siteImages).limit(1);
  if (existing[0]) {
    console.log("images already seeded");
    return;
  }
  for (const image of SHOP_SAMPLES) {
    await db.insert(siteImages).values({ collection: "shop", ...image });
  }
  for (const image of PORTFOLIO) {
    await db.insert(siteImages).values({ collection: "portfolio", ...image });
  }
  console.log(`${SHOP_SAMPLES.length + PORTFOLIO.length} site images seeded`);
}

async function main() {
  await seedAdmin();
  await seedProducts();
  await seedImages();
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
