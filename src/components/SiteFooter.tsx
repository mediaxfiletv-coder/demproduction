import Link from "next/link";
import { COMPANY } from "@/lib/catalog";

const COLUMNS = [
  {
    title: "Services",
    links: [
      { href: "/services/movie-production", label: "Movie Production" },
      { href: "/services/event-coverage", label: "Event Coverage" },
      { href: "/services/photography", label: "Photography Studio" },
      { href: "/shop", label: "Photo Enlargement" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/portfolio", label: "Portfolio" },
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/track", label: "Track an Order" },
    ],
  },
  {
    title: "Shop & Account",
    links: [
      { href: "/cart", label: "Shopping Cart" },
      { href: "/account", label: "My Account" },
      { href: "/account?tab=orders", label: "Order History" },
      { href: "/admin", label: "Admin Dashboard" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink-800">
      <div className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gold/5 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/60 bg-gradient-to-br from-gold/25 to-transparent font-display text-xl font-bold text-gold-light">
                D
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-white">
                  DEM <span className="gold-text">PRODUCTION</span>
                </p>
                <p className="text-[0.58rem] font-semibold tracking-[0.26em] text-champagne/60">
                  DAVID EJIBE MOVIE PRODUCTION LIMITED
                </p>
              </div>
            </div>
            <p className="mt-5 text-[0.62rem] font-semibold tracking-[0.3em] text-champagne/70">
              FILMMAKING · EVENT COVERAGE · PHOTOGRAPHY · PHOTO ENLARGEMENT
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/55">
              &ldquo;{COMPANY.tagline}&rdquo;
            </p>
            <div className="mt-7 flex gap-3">
              <a
                href={COMPANY.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-gold/60 hover:text-gold"
                aria-label="WhatsApp"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.9-.8-3.2-2.2-3.9-3.6-.1-.3 0-.5.2-.7l.7-.8c.2-.2.2-.4.1-.6L8.9 6.5c-.1-.3-.4-.3-.6-.3H7.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.8 5.9 5.3 2.9 1.2 3.5 1 4.1.9.7-.1 2.1-.9 2.4-1.7.3-.9.3-1.6.2-1.7-.1-.2-.3-.3-.6-.4Z" />
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
                </svg>
              </a>
              <a
                href={`tel:${COMPANY.phoneHref}`}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-gold/60 hover:text-gold"
                aria-label="Telephone"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l2-2c.3-.3.6-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2 2.3Z" />
                </svg>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-gold/60 hover:text-gold"
                aria-label="Email"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2l-10 6L2 6Zm0 2.4 10 6 10-6V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.4Z" />
                </svg>
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[0.66rem] font-bold uppercase tracking-[0.28em] text-gold">
                {column.title}
              </h3>
              <div className="gold-line my-4 max-w-[120px]" />
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition hover:text-gold-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-3">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
              Studio Address
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {COMPANY.address}
              <br />
              {COMPANY.addressNote}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
              Telephone
            </p>
            <p className="mt-2 text-sm text-white/60">
              <a href={`tel:${COMPANY.phoneHref}`} className="hover:text-gold">
                {COMPANY.phone}
              </a>
              <br />
              {COMPANY.hours}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
              Payments
            </p>
            <p className="mt-2 text-sm text-white/60">
              Secured by Paystack — Visa, Mastercard &amp; Verve accepted in Nigerian Naira.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} David Ejibe Movie Production Limited. All rights
            reserved. RC — DEM PRODUCTION.
          </p>
          <p className="text-[0.62rem] tracking-[0.24em] text-champagne/50">
            YOUR MOMENTS. OUR CREATIVITY. LASTING MEMORIES.
          </p>
        </div>
      </div>
    </footer>
  );
}
