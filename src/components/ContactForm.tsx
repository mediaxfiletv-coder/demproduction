"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { isEmail, isPhone, validate } from "@/lib/utils";

type Errors = Record<string, string>;

export function ContactForm() {
  const { push } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const map: Errors = {};
    for (const error of validate(form, {
      name: { required: true, label: "Name" },
      email: {
        required: true,
        label: "Email address",
        test: isEmail,
        message: "Enter a valid email address.",
      },
      phone: { test: isPhone, label: "Phone number", message: "Enter a valid phone number." },
      message: { required: true, label: "Message" },
    })) {
      map[error.field] = error.message;
    }
    setErrors(map);
    if (Object.keys(map).length) {
      push("Please complete the highlighted fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Message could not be sent.");
      }
      setSent(true);
      push("Message sent. Our team replies within 24 hours.");
    } catch (error) {
      push(error instanceof Error ? error.message : "Message failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="luxe-card p-8 text-center sm:p-10" data-testid="contact-confirmation">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-gold/10 text-2xl text-gold">
          ✓
        </span>
        <h3 className="mt-6 font-display text-2xl font-bold text-white">Message received</h3>
        <p className="mt-3 text-sm text-white/55">
          Thank you, {form.name.split(" ")[0]}. A member of the DEM team will reply to{" "}
          <strong className="text-gold-light">{form.email}</strong> within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
          }}
          className="btn btn-outline mt-7"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="luxe-card p-7 sm:p-9" data-testid="contact-form">
      <span className="eyebrow">Send a message</span>
      <h3 className="mt-4 font-display text-2xl font-bold text-white">Let&apos;s talk</h3>
      <div className="gold-line my-6" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <span className="label">Name</span>
          <input
            value={form.name}
            data-testid="contact-name"
            onChange={(event) => update("name", event.target.value)}
            className={`field ${errors.name ? "field-error" : ""}`}
            placeholder="Your full name"
          />
          {errors.name ? <p className="mt-2 text-xs text-red-300">{errors.name}</p> : null}
        </div>
        <div>
          <span className="label">Email address</span>
          <input
            type="email"
            value={form.email}
            data-testid="contact-email"
            onChange={(event) => update("email", event.target.value)}
            className={`field ${errors.email ? "field-error" : ""}`}
            placeholder="you@example.com"
          />
          {errors.email ? <p className="mt-2 text-xs text-red-300">{errors.email}</p> : null}
        </div>
        <div>
          <span className="label">Phone number</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className={`field ${errors.phone ? "field-error" : ""}`}
            placeholder="+234 800 000 0000"
          />
          {errors.phone ? <p className="mt-2 text-xs text-red-300">{errors.phone}</p> : null}
        </div>
        <div>
          <span className="label">Subject</span>
          <input
            value={form.subject}
            onChange={(event) => update("subject", event.target.value)}
            className="field"
            placeholder="Event coverage, print, film…"
          />
        </div>
        <div className="sm:col-span-2">
          <span className="label">Message</span>
          <textarea
            rows={5}
            data-testid="contact-message"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            className={`field resize-none ${errors.message ? "field-error" : ""}`}
            placeholder="Tell us what you need, with dates and locations."
          />
          {errors.message ? <p className="mt-2 text-xs text-red-300">{errors.message}</p> : null}
        </div>
      </div>

      <button type="submit" disabled={submitting} className="btn btn-gold mt-8 w-full">
        {submitting ? "Sending…" : "Send Message"}
      </button>
      <p className="mt-4 text-center text-[0.62rem] tracking-[0.14em] text-white/35">
        YOUR DETAILS ARE PROTECTED AND NEVER SHARED.
      </p>
    </form>
  );
}
