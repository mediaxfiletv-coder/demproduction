"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/lib/utils";

export function CartView() {
  const { items, subtotal, setQuantity, remove, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="luxe-card grid place-items-center p-16 text-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        <p className="mt-5 text-sm text-white/50">Loading your cart…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="luxe-card p-12 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/40 text-2xl text-gold">
          ✦
        </span>
        <h2 className="mt-6 font-display text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/50">
          Browse our enlargement gallery, choose a dimension and frame finishing, and your
          selection will appear here.
        </p>
        <Link href="/shop" className="btn btn-gold mt-8">
          Shop Photo Enlargements
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.key}
            data-testid="cart-item"
            className="luxe-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center"
          >
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
              <Image
                src={item.imageUrl || "/images/shop-portrait.jpg"}
                alt={item.productName}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-white">{item.productName}</h3>
              <p className="mt-1.5 text-xs text-white/50">
                {item.sizeLabel} · {item.frameLabel}
              </p>
              {item.uploadedImageUrl ? (
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-gold-light">
                  ✓ Your photograph attached
                </p>
              ) : null}
              <p className="mt-2 text-sm text-white/40">
                {formatNaira(item.unitPrice)} each
              </p>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.productName}`}
                  onClick={() => setQuantity(item.key, item.quantity - 1)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white transition hover:border-gold/60 hover:text-gold"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-white">{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.productName}`}
                  onClick={() => setQuantity(item.key, item.quantity + 1)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white transition hover:border-gold/60 hover:text-gold"
                >
                  +
                </button>
              </div>
              <p className="font-display text-xl font-bold gold-text">
                {formatNaira(item.unitPrice * item.quantity)}
              </p>
              <button
                type="button"
                onClick={() => remove(item.key)}
                className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/40 transition hover:text-red-300"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <aside className="luxe-card h-fit p-7 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl font-bold text-white">Order Summary</h2>
        <div className="gold-line my-6" />
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/50">Items</dt>
            <dd className="text-white">{items.reduce((sum, item) => sum + item.quantity, 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/50">Subtotal</dt>
            <dd className="text-white">{formatNaira(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/50">Delivery</dt>
            <dd className="text-gold-light">Calculated at checkout</dd>
          </div>
        </dl>
        <div className="gold-line my-6" />
        <div className="flex items-baseline justify-between">
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white/45">
            Total
          </span>
          <span data-testid="cart-total" className="font-display text-3xl font-black gold-text">
            {formatNaira(subtotal)}
          </span>
        </div>
        <Link href="/checkout" className="btn btn-gold mt-7 w-full">
          Proceed to Checkout
        </Link>
        <Link href="/shop" className="btn btn-ghost mt-3 w-full">
          Continue Shopping
        </Link>
        <p className="mt-6 text-center text-[0.6rem] leading-relaxed tracking-[0.16em] text-white/35">
          SECURED BY PAYSTACK · VISA · MASTERCARD · VERVE
        </p>
      </aside>
    </div>
  );
}
