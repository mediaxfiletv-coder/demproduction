"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useToast } from "@/components/Toast";
import { UploadField } from "@/components/UploadField";
import { formatNaira, isEmail, isPhone, validate } from "@/lib/utils";

type FieldErrors = Record<string, string>;

export default function CheckoutClient() {
  const { items, subtotal, clear, hydrated } = useCart();
  const { push } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    deliveryAddress: "",
    city: "",
    notes: "",
  });
  const [extraUploads, setExtraUploads] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"details" | "pay">("details");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function createOrder() {
    const validation = validate(form, {
      customerName: { required: true, label: "Full name" },
      email: {
        required: true,
        label: "Email address",
        test: isEmail,
        message: "Enter a valid email address.",
      },
      phone: {
        required: true,
        label: "Phone number",
        test: isPhone,
        message: "Enter a valid phone number.",
      },
      deliveryAddress: { required: true, label: "Delivery address" },
    });
    const nextErrors: FieldErrors = {};
    for (const error of validation) nextErrors[error.field] = error.message;
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      push("Please complete the highlighted fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            uploadedImageUrl: item.uploadedImageUrl || extraUploads[item.key] || "",
          })),
          ...form,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        orderNumber?: string;
        total?: number;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.orderNumber) {
        throw new Error(payload.error ?? "Could not create your order.");
      }
      setOrderNumber(payload.orderNumber);
      setOrderTotal(payload.total ?? subtotal);
      setStep("pay");
      push(`Order ${payload.orderNumber} created. Confirmation sent to ${form.email}.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      push(error instanceof Error ? error.message : "Could not create your order.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function payNow() {
    setSubmitting(true);
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email: form.email }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        authorizationUrl?: string;
        demo?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.authorizationUrl) {
        throw new Error(payload.error ?? "Could not start payment.");
      }
      // Secure hosted checkout — card details never touch our servers.
      window.location.href = payload.authorizationUrl;
    } catch (error) {
      push(error instanceof Error ? error.message : "Could not start payment.", "error");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="luxe-card grid h-48 place-items-center p-10 text-white/50">Loading checkout…</div>;
  }

  if (items.length === 0 && step === "details") {
    return (
      <div className="luxe-card p-12 text-center">
        <h2 className="font-display text-2xl font-bold text-white">Nothing to check out</h2>
        <p className="mt-3 text-sm text-white/50">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-gold mt-7">
          Shop Photo Enlargements
        </Link>
      </div>
    );
  }

  if (step === "pay" && orderNumber) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="luxe-card p-8 text-center sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-gold/10 text-2xl text-gold">
            ✓
          </span>
          <h1 className="mt-6 font-display text-3xl font-black text-white">Order received</h1>
          <p className="mt-3 text-sm text-white/55">
            Your order number is{" "}
            <strong className="text-gold-light" data-testid="order-number">
              {orderNumber}
            </strong>
          </p>
          <p className="mt-2 text-sm text-white/55">
            A confirmation email has been sent to <strong className="text-white">{form.email}</strong>.
          </p>
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-white/45">
              Amount due
            </p>
            <p className="mt-2 font-display text-4xl font-black gold-text">
              {formatNaira(orderTotal)}
            </p>
            <p className="mt-3 text-xs text-white/40">
              Visa · Mastercard · Verve · Bank transfer — processed securely by Paystack.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              data-testid="pay-now"
              onClick={payNow}
              disabled={submitting}
              className="btn btn-gold"
            >
              {submitting ? "Redirecting…" : "Pay Now with Paystack"}
            </button>
            <Link
              href={`/payment/callback?reference=${orderNumber}`}
              className="btn btn-outline"
            >
              I&apos;ve Already Paid
            </Link>
            <Link href="/shop" className="btn btn-ghost">
              Keep Shopping
            </Link>
          </div>
          <button
            type="button"
            onClick={() => {
              clear();
              setStep("details");
              setOrderNumber("");
              router.push("/account?tab=orders");
            }}
            className="mt-6 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/40 hover:text-gold"
          >
            View my orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <form
        className="luxe-card p-7 sm:p-9"
        onSubmit={(event) => {
          event.preventDefault();
          void createOrder();
        }}
        noValidate
      >
        <h2 className="font-display text-2xl font-bold text-white">Delivery details</h2>
        <div className="gold-line my-6" />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full name"
            value={form.customerName}
            error={errors.customerName}
            onChange={(value) => update("customerName", value)}
            placeholder="Adaeze Okonkwo"
            testId="checkout-name"
          />
          <Field
            label="Email address"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(value) => update("email", value)}
            placeholder="you@example.com"
            testId="checkout-email"
          />
          <Field
            label="Phone number"
            type="tel"
            value={form.phone}
            error={errors.phone}
            onChange={(value) => update("phone", value)}
            placeholder="+234 800 000 0000"
            testId="checkout-phone"
          />
          <Field
            label="City / State"
            value={form.city}
            onChange={(value) => update("city", value)}
            placeholder="Aba, Abia State"
          />
          <div className="sm:col-span-2">
            <Field
              label="Delivery address"
              value={form.deliveryAddress}
              error={errors.deliveryAddress}
              onChange={(value) => update("deliveryAddress", value)}
              placeholder="Street, area, state"
              testId="checkout-address"
            />
          </div>
          <div className="sm:col-span-2">
            <span className="label">Order notes (optional)</span>
            <textarea
              rows={3}
              className="field resize-none"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Colour preferences, delivery instructions…"
            />
          </div>
        </div>

        {items.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
              Your photograph files
            </p>
            <p className="mt-2 text-xs text-white/45">
              Already attached during configuration? Leave these empty.
            </p>
            <div className="mt-5 space-y-5">
              {items.map((item) => (
                <div key={item.key}>
                  <p className="mb-2 text-sm font-semibold text-white">
                    {item.productName} · {item.sizeLabel}
                  </p>
                  <UploadField
                    value={item.uploadedImageUrl || extraUploads[item.key] || ""}
                    onChange={(url) =>
                      setExtraUploads((current) => ({ ...current, [item.key]: url }))
                    }
                    label="Upload photograph"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          data-testid="place-order"
          disabled={submitting}
          className="btn btn-gold mt-8 w-full"
        >
          {submitting ? "Processing…" : "Place Order & Continue"}
        </button>
        <p className="mt-4 text-center text-[0.62rem] tracking-[0.14em] text-white/35">
          YOUR DETAILS ARE ENCRYPTED AND NEVER SOLD.
        </p>
      </form>

      <aside className="luxe-card h-fit p-7 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl font-bold text-white">Order Summary</h2>
        <div className="gold-line my-6" />
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between gap-4 text-sm">
              <span>
                <span className="block text-white">{item.productName}</span>
                <span className="mt-0.5 block text-xs text-white/45">
                  {item.sizeLabel} · {item.frameLabel} × {item.quantity}
                </span>
              </span>
              <span className="shrink-0 font-semibold text-gold-light">
                {formatNaira(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="gold-line my-6" />
        <div className="flex items-baseline justify-between">
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white/45">
            Total
          </span>
          <span className="font-display text-3xl font-black gold-text">{formatNaira(subtotal)}</span>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-white/40">
          Final order total is confirmed server-side from our price list before payment. Shipping
          is quoted by our team for large-format prints.
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  testId?: string;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <input
        type={type}
        value={value}
        data-testid={testId}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`field ${error ? "field-error" : ""}`}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
