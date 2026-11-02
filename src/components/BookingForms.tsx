"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { isDate, isEmail, isPhone, validate } from "@/lib/utils";
import type { EventPackage, MovieService, SessionType } from "@/lib/catalog";

type Errors = Record<string, string>;

function errorMap(values: Record<string, string>, rules: Parameters<typeof validate>[1]): Errors {
  const map: Errors = {};
  for (const error of validate(values, rules)) map[error.field] = error.message;
  return map;
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

/* ==================================================================
   EVENT COVERAGE BOOKING
   ================================================================== */

export function EventBookingForm({ packages }: { packages: EventPackage[] }) {
  const params = useSearchParams();
  const { push } = useToast();
  const initial =
    packages.find((pkg) => pkg.code === params.get("package")?.toUpperCase())?.code ??
    packages[0]?.code ??
    "";

  const [packageCode, setPackageCode] = useState(initial);
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    venue: "",
    notes: "",
  });

  // Keep the selected package in sync with ?package= deep links.
  useEffect(() => {
    const requested = params.get("package")?.toUpperCase();
    if (requested && packages.some((pkg) => pkg.code === requested)) {
      setPackageCode(requested);
    }
  }, [params, packages]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    ref: string;
    name: string;
    total: number;
  } | null>(null);

  const selected = packages.find((pkg) => pkg.code === packageCode) ?? packages[0];

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const map = errorMap(form, {
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
      eventDate: {
        required: true,
        label: "Event date",
        test: isDate,
        message: "Select a valid event date.",
      },
      venue: { required: true, label: "Venue" },
    });
    setErrors(map);
    if (Object.keys(map).length) {
      push("Please complete the highlighted fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, packageCode }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        bookingRef?: string;
        packageName?: string;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.bookingRef) {
        throw new Error(payload.error ?? "Booking could not be submitted.");
      }
      setConfirmation({
        ref: payload.bookingRef,
        name: form.customerName,
        total: selected?.price ?? 0,
      });
      push(`Booking ${payload.bookingRef} received. Confirmation sent to ${form.email}.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      push(
        submitError instanceof Error ? submitError.message : "Booking failed.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="luxe-card p-8 text-center sm:p-10" data-testid="booking-confirmation">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-gold/10 text-2xl text-gold">
          ✓
        </span>
        <p className="eyebrow mt-6">Booking confirmed</p>
        <h3 className="mt-3 font-display text-3xl font-black text-white">
          Thank you, {confirmation.name.split(" ")[0]}.
        </h3>
        <p className="mt-4 text-sm text-white/55">
          Your booking reference is{" "}
          <strong className="text-gold-light" data-testid="booking-reference">
            {confirmation.ref}
          </strong>
        </p>
        <p className="mt-2 text-sm text-white/55">
          Package total {new Intl.NumberFormat("en-NG").format(confirmation.total)} Naira. A
          confirmation has been sent to your email and our team will call you within 24 hours.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/account?tab=bookings" className="btn btn-gold">
            View My Bookings
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Contact the Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="luxe-card p-7 sm:p-9"
      data-testid="booking-form"
    >
      <span className="eyebrow">Book this package</span>
      <h3 className="mt-4 font-display text-2xl font-bold text-white">
        Reserve your event date
      </h3>
      <div className="gold-line my-6" />

      <span className="label">Package</span>
      <div className="grid gap-2 sm:grid-cols-2">
        {packages.map((pkg) => (
          <button
            key={pkg.code}
            type="button"
            onClick={() => setPackageCode(pkg.code)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              pkg.code === packageCode
                ? "border-gold bg-gold/10"
                : "border-white/12 hover:border-white/30"
            }`}
          >
            <span className="block text-[0.58rem] font-bold uppercase tracking-[0.2em] text-gold">
              Section {pkg.code}
            </span>
            <span className="mt-1 block text-sm font-semibold text-white">{pkg.name}</span>
            <span className="mt-0.5 block text-xs text-white/45">
              {new Intl.NumberFormat("en-NG").format(pkg.price)} Naira
            </span>
          </button>
        ))}
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          value={form.customerName}
          error={errors.customerName}
          onChange={(value) => update("customerName", value)}
          placeholder="Adaeze Okonkwo"
          testId="event-name"
        />
        <Field
          label="Email address"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(value) => update("email", value)}
          placeholder="you@example.com"
          testId="event-email"
        />
        <Field
          label="Phone number"
          type="tel"
          value={form.phone}
          error={errors.phone}
          onChange={(value) => update("phone", value)}
          placeholder="+234 800 000 0000"
          testId="event-phone"
        />
        <Field
          label="Event type"
          value={form.eventType}
          onChange={(value) => update("eventType", value)}
          placeholder="Wedding, birthday, corporate…"
        />
        <Field
          label="Event date"
          type="date"
          value={form.eventDate}
          error={errors.eventDate}
          onChange={(value) => update("eventDate", value)}
          testId="event-date"
        />
        <Field
          label="Venue"
          value={form.venue}
          error={errors.venue}
          onChange={(value) => update("venue", value)}
          placeholder="Hall, city, state"
          testId="event-venue"
        />
        <div className="sm:col-span-2">
          <span className="label">Special requirements (optional)</span>
          <textarea
            rows={4}
            className="field resize-none"
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Guest count, drone permissions, projector screen size…"
          />
        </div>
      </div>

      <button
        type="submit"
        data-testid="booking-submit"
        disabled={submitting}
        className="btn btn-gold mt-8 w-full"
      >
        {submitting ? "Submitting…" : "Confirm Booking"}
      </button>
      <p className="mt-4 text-center text-[0.62rem] tracking-[0.14em] text-white/35">
        NO PAYMENT REQUIRED TO RESERVE · 50% DEPOSIT INVOICED AFTER CONFIRMATION
      </p>
    </form>
  );
}

/* ==================================================================
   MOVIE PRODUCTION ENQUIRY
   ================================================================== */

export function MovieEnquiryForm({ services }: { services: MovieService[] }) {
  const { push } = useToast();
  const [serviceKey, setServiceKey] = useState(services[0]?.key ?? "");
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    preferredDate: "",
    projectBrief: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string>("");

  const selected = services.find((service) => service.key === serviceKey) ?? services[0];

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const map = errorMap(form, {
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
      projectBrief: { required: true, label: "Project brief" },
    });
    setErrors(map);
    if (Object.keys(map).length) {
      push("Please complete the highlighted fields.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/movie-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceKey }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        enquiryRef?: string;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.enquiryRef) {
        throw new Error(payload.error ?? "Enquiry could not be sent.");
      }
      setConfirmation(payload.enquiryRef);
      push(`Enquiry ${payload.enquiryRef} received. We reply within 24 hours.`);
    } catch (submitError) {
      push(submitError instanceof Error ? submitError.message : "Enquiry failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="luxe-card p-8 text-center sm:p-10" data-testid="enquiry-confirmation">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-gold/10 text-2xl text-gold">
          ✓
        </span>
        <p className="eyebrow mt-6">Enquiry received</p>
        <h3 className="mt-3 font-display text-3xl font-black text-white">
          Your production brief is with us.
        </h3>
        <p className="mt-4 text-sm text-white/55">
          Reference:{" "}
          <strong className="text-gold-light" data-testid="enquiry-reference">
            {confirmation}
          </strong>
        </p>
        <p className="mt-2 text-sm text-white/55">
          Our production lead will respond within 24 hours with a schedule and call sheet.
        </p>
        <Link href="/contact" className="btn btn-outline mt-7">
          Talk to the Studio
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="luxe-card p-7 sm:p-9" data-testid="enquiry-form">
      <span className="eyebrow">Production enquiry</span>
      <h3 className="mt-4 font-display text-2xl font-bold text-white">
        Brief our production team
      </h3>
      <div className="gold-line my-6" />

      <span className="label">Service</span>
      <div className="grid gap-2 sm:grid-cols-3">
        {services.map((service) => (
          <button
            key={service.key}
            type="button"
            onClick={() => setServiceKey(service.key)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              service.key === serviceKey
                ? "border-gold bg-gold/10"
                : "border-white/12 hover:border-white/30"
            }`}
          >
            <span className="block text-sm font-semibold text-white">{service.name}</span>
            <span className="mt-1 block text-xs text-gold-light">
              {new Intl.NumberFormat("en-NG").format(service.price)} Naira
            </span>
          </button>
        ))}
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          value={form.customerName}
          error={errors.customerName}
          onChange={(value) => update("customerName", value)}
          placeholder="Blessing Adeyemi"
          testId="movie-name"
        />
        <Field
          label="Email address"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(value) => update("email", value)}
          placeholder="you@example.com"
          testId="movie-email"
        />
        <Field
          label="Phone number"
          type="tel"
          value={form.phone}
          error={errors.phone}
          onChange={(value) => update("phone", value)}
          placeholder="+234 800 000 0000"
          testId="movie-phone"
        />
        <Field
          label="Preferred start date"
          type="date"
          value={form.preferredDate}
          onChange={(value) => update("preferredDate", value)}
          testId="movie-date"
        />
        <div className="sm:col-span-2">
          <span className="label">Project brief</span>
          <textarea
            rows={5}
            data-testid="movie-brief"
            className={`field resize-none ${errors.projectBrief ? "field-error" : ""}`}
            value={form.projectBrief}
            onChange={(event) => update("projectBrief", event.target.value)}
            placeholder="Genre, runtime, cast, locations, deliverables…"
          />
          {errors.projectBrief ? (
            <p className="mt-2 text-xs text-red-300">{errors.projectBrief}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <span className="text-sm text-white/55">{selected?.name} starting from</span>
        <span className="font-display text-2xl font-bold gold-text">
          {new Intl.NumberFormat("en-NG").format(selected?.price ?? 0)} Naira
        </span>
      </div>

      <button
        type="submit"
        data-testid="enquiry-submit"
        disabled={submitting}
        className="btn btn-gold mt-7 w-full"
      >
        {submitting ? "Sending…" : "Send Enquiry"}
      </button>
    </form>
  );
}

/* ==================================================================
   PHOTOGRAPHY SESSION BOOKING
   ================================================================== */

export function PhotoSessionForm({ sessions }: { sessions: SessionType[] }) {
  const { push } = useToast();
  const [sessionType, setSessionType] = useState(sessions[0]?.name ?? "");
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    sessionDate: "",
    location: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const selected = useMemo(
    () => sessions.find((session) => session.name === sessionType) ?? sessions[0],
    [sessions, sessionType],
  );

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const map = errorMap(form, {
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
      sessionDate: {
        required: true,
        label: "Session date",
        test: isDate,
        message: "Select a valid session date.",
      },
    });
    setErrors(map);
    if (Object.keys(map).length) {
      push("Please complete the highlighted fields.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/photo-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sessionType }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        sessionRef?: string;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.sessionRef) {
        throw new Error(payload.error ?? "Session could not be booked.");
      }
      setConfirmation(payload.sessionRef);
      push(`Session ${payload.sessionRef} booked. Confirmation sent to ${form.email}.`);
    } catch (submitError) {
      push(submitError instanceof Error ? submitError.message : "Booking failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="luxe-card p-8 text-center sm:p-10" data-testid="session-confirmation">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-gold/10 text-2xl text-gold">
          ✓
        </span>
        <p className="eyebrow mt-6">Session booked</p>
        <h3 className="mt-3 font-display text-3xl font-black text-white">
          Your shoot is on the calendar.
        </h3>
        <p className="mt-4 text-sm text-white/55">
          Reference:{" "}
          <strong className="text-gold-light" data-testid="session-reference">
            {confirmation}
          </strong>
        </p>
        <p className="mt-2 text-sm text-white/55">
          Our studio team will confirm your slot and send a styling guide within 24 hours.
        </p>
        <Link href="/contact" className="btn btn-outline mt-7">
          Contact the Studio
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="luxe-card p-7 sm:p-9"
      data-testid="session-form"
    >
      <span className="eyebrow">Book a session</span>
      <h3 className="mt-4 font-display text-2xl font-bold text-white">
        Reserve your studio slot
      </h3>
      <div className="gold-line my-6" />

      <span className="label">Session type</span>
      <div className="grid gap-2 sm:grid-cols-2">
        {sessions.map((session) => (
          <button
            key={session.key}
            type="button"
            onClick={() => setSessionType(session.name)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              session.name === sessionType
                ? "border-gold bg-gold/10"
                : "border-white/12 hover:border-white/30"
            }`}
          >
            <span className="block text-sm font-semibold text-white">{session.name}</span>
            <span className="mt-1 block text-xs text-white/45">{session.duration}</span>
            <span className="mt-1 block text-xs text-gold-light">
              {new Intl.NumberFormat("en-NG").format(session.price)} Naira
            </span>
          </button>
        ))}
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          value={form.customerName}
          error={errors.customerName}
          onChange={(value) => update("customerName", value)}
          placeholder="Chiamaka Obi"
          testId="photo-name"
        />
        <Field
          label="Email address"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(value) => update("email", value)}
          placeholder="you@example.com"
          testId="photo-email"
        />
        <Field
          label="Phone number"
          type="tel"
          value={form.phone}
          error={errors.phone}
          onChange={(value) => update("phone", value)}
          placeholder="+234 800 000 0000"
          testId="photo-phone"
        />
        <Field
          label="Session date"
          type="date"
          value={form.sessionDate}
          error={errors.sessionDate}
          onChange={(value) => update("sessionDate", value)}
          testId="photo-date"
        />
        <div className="sm:col-span-2">
          <Field
            label="Location / studio preference"
            value={form.location}
            onChange={(value) => update("location", value)}
            placeholder="Aba studio, or on location…"
          />
        </div>
        <div className="sm:col-span-2">
          <span className="label">Notes (optional)</span>
          <textarea
            rows={3}
            className="field resize-none"
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Wardrobe, group size, reference images…"
          />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <span className="text-sm text-white/55">{selected?.name}</span>
        <span className="font-display text-2xl font-bold gold-text">
          {new Intl.NumberFormat("en-NG").format(selected?.price ?? 0)} Naira
        </span>
      </div>

      <button
        type="submit"
        data-testid="session-submit"
        disabled={submitting}
        className="btn btn-gold mt-7 w-full"
      >
        {submitting ? "Booking…" : "Book Photography Session"}
      </button>
    </form>
  );
}

/** Wraps forms that read the query string. */
export function FormBoundary({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="luxe-card h-64 animate-pulse" />}>{children}</Suspense>;
}
