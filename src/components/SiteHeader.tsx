"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Photo Enlargement" },
  { href: "/services/event-coverage", label: "Event Coverage" },
  { href: "/services/movie-production", label: "Movie Production" },
  { href: "/services/photography", label: "Photography" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 420 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Announcement bar */}
      <div className="relative z-40 hidden overflow-hidden border-b border-white/10 bg-ink-800 py-2 md:block">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-10 pr-10">
              {[
                "YOUR MOMENTS. OUR CREATIVITY. LASTING MEMORIES.",
                "MUSEUM-GRADE PHOTO ENLARGEMENTS — FROM ₦20,000",
                "EVENT COVERAGE PACKAGES FROM ₦270,000",
                "ABIA STATE'S CINEMATIC PRODUCTION HOUSE",
                "SECURE PAYSTACK PAYMENTS",
              ].map((text) => (
                <span
                  key={text}
                  className="text-[0.62rem] font-semibold tracking-[0.32em] text-champagne/70"
                >
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-500 ${
          scrolled
            ? "border-white/10 bg-ink/90 py-2 shadow-[0_18px_50px_-30px_rgba(0,0,0,1)] backdrop-blur-xl"
            : "border-transparent bg-gradient-to-b from-black/80 to-transparent py-4"
        } ${hidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="relative grid h-11 w-11 place-items-center rounded-full border border-gold/60 bg-gradient-to-br from-gold/25 to-transparent">
              <span className="font-display text-lg font-bold text-gold-light">D</span>
              <span className="absolute inset-0 rounded-full border border-gold/20 transition group-hover:scale-125" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-xl font-bold tracking-wide text-white">
                DEM <span className="gold-text">PRODUCTION</span>
              </span>
              <span className="mt-1 block text-[0.53rem] font-semibold tracking-[0.28em] text-champagne/60">
                DAVID EJIBE MOVIE PRODUCTION LTD
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-3.5 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition ${
                    active ? "text-gold" : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-3.5 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-gold to-transparent transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="hidden rounded-full border border-white/15 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:border-gold/50 hover:text-gold sm:inline-flex"
            >
              Account
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold-light transition hover:bg-gold/20"
            >
              <CartIcon />
              <span className="hidden sm:inline">Cart</span>
              <span
                data-testid="cart-count"
                className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.62rem] font-bold text-black"
              >
                {count}
              </span>
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition hover:border-gold/50 lg:hidden"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-full bg-current transition-all duration-300 ${
                    open ? "top-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition-opacity duration-200 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition-all duration-300 ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[min(88vw,380px)] border-l border-white/10 bg-ink-800 px-7 pb-10 pt-6 transition-transform duration-500 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-white">
              DEM <span className="gold-text">PRODUCTION</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white"
            >
              ✕
            </button>
          </div>
          <div className="gold-line my-6" />
          <nav className="flex flex-col gap-1">
            {NAV.map((item, index) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ transitionDelay: `${index * 45}ms` }}
                  className={`rounded-xl px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] transition ${
                    active
                      ? "bg-gold/12 text-gold"
                      : "text-white/75 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="gold-line my-6" />
          <div className="flex flex-col gap-3">
            <Link href="/account" className="btn btn-ghost w-full">
              My Account
            </Link>
            <Link href="/admin" className="btn btn-outline w-full">
              Admin Dashboard
            </Link>
            <a href="tel:+2347055546059" className="btn btn-gold w-full">
              Call +234 705 554 6059
            </a>
          </div>
          <p className="mt-8 text-[0.62rem] leading-relaxed tracking-[0.2em] text-champagne/45">
            NO. 56, ST. MICHAEL&apos;S ROAD, ABA, ABIA STATE, NIGERIA
          </p>
        </div>
      </div>
    </>
  );
}

function CartIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
