"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatNaira } from "@/lib/utils";

type Result = {
  ok: boolean;
  status: "success" | "failed" | "pending";
  reference: string;
  amount?: number;
  channel?: string;
  orderNumber?: string | null;
  bookingRef?: string | null;
  message?: string;
};

function CallbackContent() {
  const params = useSearchParams();
  const reference =
    params.get("reference") ?? params.get("trxref") ?? params.get("trref") ?? "";
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const attempted = useRef(false);

  const verify = useCallback(async () => {
    if (!reference) {
      setError("No payment reference was provided.");
      return;
    }
    try {
      const response = await fetch(
        `/api/payments/verify?reference=${encodeURIComponent(reference)}`,
      );
      const payload = (await response.json()) as Result & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Verification failed.");
      setResult(payload);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Verification failed.");
    }
  }, [reference]);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    void verify();
  }, [verify]);

  // Retry a pending transaction a couple of times — settlement can lag.
  useEffect(() => {
    if (!result || result.status !== "pending") return;
    const timer = window.setTimeout(() => void verify(), 3500);
    return () => window.clearTimeout(timer);
  }, [result, verify]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-24 lg:px-8">
      <div className="luxe-card p-8 text-center sm:p-12" data-testid="payment-result">
        {error ? (
          <>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-red-400/50 bg-red-500/10 text-2xl text-red-300">
              !
            </span>
            <h1 className="mt-6 font-display text-3xl font-black text-white">
              Verification unavailable
            </h1>
            <p className="mt-3 text-sm text-white/55">{error}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => void verify()} className="btn btn-gold">
                Try Again
              </button>
              <Link href="/contact" className="btn btn-outline">
                Contact Support
              </Link>
            </div>
          </>
        ) : !result ? (
          <>
            <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
            <h1 className="mt-7 font-display text-2xl font-bold text-white">
              Confirming your transaction…
            </h1>
            <p className="mt-3 text-sm text-white/50">
              Verifying with Paystack. This takes a few seconds.
            </p>
            <p className="mt-4 text-xs tracking-[0.14em] text-white/35">
              REFERENCE: {reference || "—"}
            </p>
          </>
        ) : result.status === "success" ? (
          <>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-gold/10 text-2xl text-gold">
              ✓
            </span>
            <p className="eyebrow mt-6">Payment successful</p>
            <h1 className="mt-3 font-display text-3xl font-black text-white">
              Thank you. Your payment is confirmed.
            </h1>
            <p className="mt-4 text-sm text-white/55">
              {formatNaira(result.amount ?? 0)} received via {result.channel || "card"}.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-white/45">
                Transaction reference
              </p>
              <p className="mt-2 break-all font-mono text-sm text-gold-light">
                {result.reference}
              </p>
              {result.orderNumber ? (
                <p className="mt-3 text-sm text-white/60">
                  Order: <strong className="text-white">{result.orderNumber}</strong> — now marked
                  as paid and moving to production.
                </p>
              ) : null}
              {result.bookingRef ? (
                <p className="mt-3 text-sm text-white/60">
                  Booking: <strong className="text-white">{result.bookingRef}</strong> — confirmed.
                </p>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/account?tab=payments" className="btn btn-gold">
                View Payment History
              </Link>
              <Link href="/shop" className="btn btn-outline">
                Continue Shopping
              </Link>
            </div>
          </>
        ) : result.status === "failed" ? (
          <>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-red-400/50 bg-red-500/10 text-2xl text-red-300">
              ✕
            </span>
            <p className="eyebrow mt-6" style={{ color: "#fca5a5" }}>
              Payment failed
            </p>
            <h1 className="mt-3 font-display text-3xl font-black text-white">
              The transaction was not completed
            </h1>
            <p className="mt-4 text-sm text-white/55">
              {result.message ??
                "No money was deducted. Please try again or contact your bank."}
            </p>
            <p className="mt-3 text-xs text-white/40">Reference: {result.reference}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/checkout" className="btn btn-gold">
                Try Payment Again
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Contact Support
              </Link>
            </div>
          </>
        ) : (
          <>
            <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
            <h1 className="mt-7 font-display text-2xl font-bold text-white">
              We&apos;re still confirming…
            </h1>
            <p className="mt-3 text-sm text-white/50">
              Your transaction is being confirmed with Paystack. Your order will update
              automatically.
            </p>
            <p className="mt-3 text-xs text-white/40">Reference: {result.reference}</p>
            <button
              type="button"
              onClick={() => void verify()}
              className="btn btn-outline mt-7"
            >
              Check Again
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-3xl px-5 py-24">
          <div className="luxe-card grid h-56 place-items-center text-white/50">
            Loading payment result…
          </div>
        </section>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
