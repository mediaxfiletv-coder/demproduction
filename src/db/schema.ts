import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Customers & authentication                                          */
/* ------------------------------------------------------------------ */

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    address: text("address").notNull().default(""),
    city: varchar("city", { length: 120 }).notNull().default(""),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("customers_email_idx").on(table.email),
  }),
);

export const admins = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("admins_email_idx").on(table.email),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token", { length: 128 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(), // 'customer' | 'admin'
    customerId: integer("customer_id"),
    adminId: integer("admin_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("sessions_token_idx").on(table.token),
  }),
);

/* ------------------------------------------------------------------ */
/* Shop: products, variants (size + frame finishing)                   */
/* ------------------------------------------------------------------ */

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 190 }).notNull(),
    slug: varchar("slug", { length: 190 }).notNull(),
    description: text("description").notNull().default(""),
    imageUrl: varchar("image_url", { length: 500 }).notNull().default(""),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
  }),
);

export type FrameType =
  | "normal_frame"
  | "acrylic_with_glass"
  | "acrylic_without_glass";

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sizeLabel: varchar("size_label", { length: 60 }).notNull(), // "36 × 72 in"
    frameType: varchar("frame_type", { length: 60 }).notNull(),
    frameLabel: varchar("frame_label", { length: 120 }).notNull(),
    price: integer("price").notNull(), // stored in Naira
    active: boolean("active").notNull().default(true),
  },
  (table) => ({
    productIdx: index("product_variants_product_idx").on(table.productId),
  }),
);

/* ------------------------------------------------------------------ */
/* Orders & payments                                                   */
/* ------------------------------------------------------------------ */

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 40 }).notNull(),
    customerId: integer("customer_id"),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    notes: text("notes").notNull().default(""),
    subtotal: integer("subtotal").notNull().default(0),
    total: integer("total").notNull().default(0),
    status: varchar("status", { length: 40 }).notNull().default("pending"),
    paymentStatus: varchar("payment_status", { length: 40 }).notNull().default("unpaid"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("orders_number_idx").on(table.orderNumber),
    customerIdx: index("orders_customer_idx").on(table.customerId),
  }),
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id"),
    variantId: integer("variant_id"),
    productName: varchar("product_name", { length: 190 }).notNull(),
    sizeLabel: varchar("size_label", { length: 60 }).notNull().default(""),
    frameLabel: varchar("frame_label", { length: 120 }).notNull().default(""),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull().default(1),
    lineTotal: integer("line_total").notNull(),
    uploadedImageUrl: text("uploaded_image_url").notNull().default(""),
  },
  (table) => ({
    orderIdx: index("order_items_order_idx").on(table.orderId),
  }),
);

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 120 }).notNull(),
    orderId: integer("order_id"),
    bookingId: integer("booking_id"),
    customerId: integer("customer_id"),
    email: varchar("email", { length: 190 }).notNull().default(""),
    amount: integer("amount").notNull(),
    status: varchar("status", { length: 40 }).notNull().default("pending"),
    channel: varchar("channel", { length: 80 }).notNull().default(""),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    meta: jsonb("meta"),
  },
  (table) => ({
    referenceIdx: uniqueIndex("payments_reference_idx").on(table.reference),
  }),
);

/* ------------------------------------------------------------------ */
/* Bookings: events, movie production, photography sessions            */
/* ------------------------------------------------------------------ */

export const eventBookings = pgTable(
  "event_bookings",
  {
    id: serial("id").primaryKey(),
    bookingRef: varchar("booking_ref", { length: 40 }).notNull(),
    packageCode: varchar("package_code", { length: 10 }).notNull(),
    packageName: varchar("package_name", { length: 160 }).notNull(),
    price: integer("price").notNull(),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    eventType: varchar("event_type", { length: 120 }).notNull().default(""),
    eventDate: varchar("event_date", { length: 40 }).notNull(),
    venue: text("venue").notNull(),
    notes: text("notes").notNull().default(""),
    status: varchar("status", { length: 40 }).notNull().default("pending"),
    paymentStatus: varchar("payment_status", { length: 40 }).notNull().default("unpaid"),
    customerId: integer("customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    refIdx: uniqueIndex("event_bookings_ref_idx").on(table.bookingRef),
  }),
);

export const movieEnquiries = pgTable(
  "movie_enquiries",
  {
    id: serial("id").primaryKey(),
    enquiryRef: varchar("enquiry_ref", { length: 40 }).notNull(),
    serviceKey: varchar("service_key", { length: 60 }).notNull(),
    serviceName: varchar("service_name", { length: 160 }).notNull(),
    price: integer("price").notNull().default(0),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    projectBrief: text("project_brief").notNull().default(""),
    preferredDate: varchar("preferred_date", { length: 40 }).notNull().default(""),
    status: varchar("status", { length: 40 }).notNull().default("new"),
    customerId: integer("customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    refIdx: uniqueIndex("movie_enquiries_ref_idx").on(table.enquiryRef),
  }),
);

export const photoSessions = pgTable(
  "photo_sessions",
  {
    id: serial("id").primaryKey(),
    sessionRef: varchar("session_ref", { length: 40 }).notNull(),
    sessionType: varchar("session_type", { length: 120 }).notNull(),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    sessionDate: varchar("session_date", { length: 40 }).notNull(),
    location: varchar("location", { length: 190 }).notNull().default(""),
    notes: text("notes").notNull().default(""),
    status: varchar("status", { length: 40 }).notNull().default("pending"),
    customerId: integer("customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    refIdx: uniqueIndex("photo_sessions_ref_idx").on(table.sessionRef),
  }),
);

/* ------------------------------------------------------------------ */
/* Media, contact messages                                             */
/* ------------------------------------------------------------------ */

export const siteImages = pgTable(
  "site_images",
  {
    id: serial("id").primaryKey(),
    collection: varchar("collection", { length: 40 }).notNull(), // 'shop' | 'portfolio'
    category: varchar("category", { length: 120 }).notNull().default(""),
    title: varchar("title", { length: 190 }).notNull().default(""),
    imageUrl: varchar("image_url", { length: 500 }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    collectionIdx: index("site_images_collection_idx").on(table.collection),
  }),
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    channel: varchar("channel", { length: 40 }).notNull().default("email"),
    recipient: varchar("recipient", { length: 190 }).notNull().default(""),
    subject: varchar("subject", { length: 220 }).notNull().default(""),
    body: text("body").notNull().default(""),
    kind: varchar("kind", { length: 60 }).notNull().default(""),
    status: varchar("status", { length: 40 }).notNull().default("queued"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull().default(""),
    subject: varchar("subject", { length: 190 }).notNull().default(""),
    message: text("message").notNull(),
    handled: boolean("handled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export type Customer = typeof customers.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type EventBooking = typeof eventBookings.$inferSelect;
export type MovieEnquiry = typeof movieEnquiries.$inferSelect;
export type PhotoSession = typeof photoSessions.$inferSelect;
export type SiteImage = typeof siteImages.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
