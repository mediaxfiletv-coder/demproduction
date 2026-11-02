"use client";

import { useEffect, useState } from "react";
import { COMPANY } from "@/lib/catalog";

export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={COMPANY.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with DEM PRODUCTION on WhatsApp"
      data-testid="whatsapp-fab"
      className={`fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-full border border-gold/50 bg-ink-800/95 py-3 pl-3 pr-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,1)] backdrop-blur-xl transition-all duration-500 hover:border-gold ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <span className="whatsapp-pulse grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-black">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.9-.8-3.2-2.2-3.9-3.6-.1-.3 0-.5.2-.7l.7-.8c.2-.2.2-.4.1-.6L8.9 6.5c-.1-.3-.4-.3-.6-.3H7.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.8 5.9 5.3 2.9 1.2 3.5 1 4.1.9.7-.1 2.1-.9 2.4-1.7.3-.9.3-1.6.2-1.7-.1-.2-.3-.3-.6-.4Z" />
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
        </svg>
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block text-[0.6rem] font-bold uppercase tracking-[0.22em] text-gold">
          Chat with us
        </span>
        <span className="block text-xs text-white/70">WhatsApp · Instant reply</span>
      </span>
    </a>
  );
}
