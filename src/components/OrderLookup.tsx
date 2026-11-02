"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { formatDate, formatNaira, statusTone } from "@/lib/utils";

export default function OrderLookup() {
  const { push } = useToast();
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setOrder(null);
    if (!reference.trim()) {
      setError("Enter your order number.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(reference.trim().toUpperCase())}`,
      );
      const payload = (await response.json()) as { order?: any; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Order not found.");
      setOrder(payload.order);
      push("Order found.");
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Order not found.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row" data-testid="track-form">
        <input
          value={reference}
          onChange={(event) => {
            setReference(event.target.value);
            setError("");
          }}
          placeholder="DEM-XXXXXX"
          data-testid="track-input"
          className="field flex-1 font-mono uppercase"
          aria-label="Order number"
        />
        <button type="submit" disabled={pending} className="btn btn-gold">
          {pending ? "Searching…" : "Track Order"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {order ? (
        <div className="luxe-card mt-6 p-6 sm:p-8" data-testid="track-result">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-sm font-bold text-gold-light">{order.orderNumber}</p>
              <p className="mt-2 text-xs text-white/50">
                Placed {formatDate(order.createdAt)} · {order.customerName}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`badge badge-${statusTone(order.status)}`}>{order.status}</span>
              <span className={`badge badge-${statusTone(order.paymentStatus)}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="gold-line my-6" />

          <ol className="flex flex-wrap gap-3">
            {["pending", "processing", "shipped", "delivered"].map((stage) => {
              const stages = ["pending", "processing", "shipped", "delivered"];
              const currentIndex = stages.indexOf(order.status);
              const active = stages.indexOf(stage) <= currentIndex && currentIndex >= 0;
              return (
                <li
                  key={stage}
                  className={`flex-1 rounded-xl border px-3 py-3 text-center text-[0.6rem] font-bold uppercase tracking-[0.16em] ${
                    active
                      ? "border-gold bg-gold/12 text-gold-light"
                      : "border-white/10 text-white/35"
                  }`}
                >
                  {stage}
                </li>
              );
            })}
          </ol>

          <ul className="mt-6 space-y-3">
            {order.items?.map((item: any) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">
                  {item.productName}
                  <span className="mt-1 block text-xs text-white/40">
                    {item.sizeLabel} · {item.frameLabel} × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-gold-light">
                  {formatNaira(item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <div className="gold-line my-5" />
          <div className="flex items-baseline justify-between">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white/45">
              Total
            </span>
            <span className="font-display text-2xl font-black gold-text">
              {formatNaira(order.total)}
            </span>
          </div>
          {order.paymentStatus !== "paid" ? (
            <p className="mt-4 text-xs text-white/45">
              Payment still pending — check your email for the Paystack link, or call
              +2347055546059.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
