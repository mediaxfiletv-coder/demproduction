"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { formatNaira, formatDate, isEmail, isPhone, statusTone, validate } from "@/lib/utils";

type Session = { role: "admin" | "customer"; name: string; email: string; id: number } | null;
type Errors = Record<string, string>;

const TABS = [
  { key: "orders", label: "Order History" },
  { key: "bookings", label: "Bookings" },
  { key: "payments", label: "Payments" },
  { key: "studio", label: "Studio Requests" },
  { key: "profile", label: "Profile" },
] as const;

export default function AccountClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { push } = useToast();

  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>(params.get("tab") ?? "orders");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [auth, setAuth] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });
  const [authErrors, setAuthErrors] = useState<Errors>({});
  const [authPending, setAuthPending] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [profileDraft, setProfileDraft] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    password: "",
  });
  const [profileErrors, setProfileErrors] = useState<Errors>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      const payload = (await response.json()) as { user: Session };
      setSession(payload.user);
      if (payload.user?.role === "admin") router.replace("/admin");
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!session || session.role !== "customer") return;
    const active = tab === "studio" ? "studio" : tab;
    const endpoints: [string, (data: any) => void][] = [
      ["/api/orders", (data) => setOrders(data.orders ?? [])],
      ["/api/bookings", (data) => setBookings(data.bookings ?? [])],
      ["/api/payments", (data) => setPayments(data.payments ?? [])],
      ["/api/movie-enquiries", (data) => setEnquiries(data.enquiries ?? [])],
      ["/api/photo-sessions", (data) => setSessions(data.sessions ?? [])],
      ["/api/account/profile", (data) => {
        setProfile(data.customer ?? null);
        if (data.customer) {
          setProfileDraft((draft) => ({
            ...draft,
            fullName: data.customer.fullName ?? "",
            email: data.customer.email ?? "",
            phone: data.customer.phone ?? "",
            address: data.customer.address ?? "",
            city: data.customer.city ?? "",
          }));
        }
      }],
    ];
    void (async () => {
      for (const [url, apply] of endpoints) {
        try {
          const response = await fetch(url);
          if (response.ok) apply(await response.json());
        } catch {
          /* partial data is acceptable */
        }
      }
    })();
  }, [session, tab]);

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    const rules: Parameters<typeof validate>[1] =
      mode === "login"
        ? {
            email: {
              required: true,
              label: "Email address",
              test: isEmail,
              message: "Enter a valid email address.",
            },
            password: { required: true, label: "Password" },
          }
        : {
            fullName: { required: true, label: "Full name" },
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
            password: { required: true, label: "Password" },
          };
    const map: Errors = {};
    for (const error of validate(auth, rules)) map[error.field] = error.message;
    if (mode === "register" && auth.password.length < 8) {
      map.password = "Password must be at least 8 characters.";
    }
    setAuthErrors(map);
    if (Object.keys(map).length) {
      push("Please complete the highlighted fields.", "error");
      return;
    }

    setAuthPending(true);
    try {
      const response = await fetch(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(auth),
        },
      );
      const payload = (await response.json()) as { ok?: boolean; error?: string; role?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Authentication failed.");
      }
      push(mode === "login" ? "Welcome back." : "Account created.");
      await loadSession();
    } catch (error) {
      push(error instanceof Error ? error.message : "Authentication failed.", "error");
    } finally {
      setAuthPending(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/session", { method: "POST" });
    setSession(null);
    push("You have been signed out.");
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const map: Errors = {};
    for (const error of validate(profileDraft, {
      fullName: { required: true, label: "Full name" },
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
    })) {
      map[error.field] = error.message;
    }
    setProfileErrors(map);
    if (Object.keys(map).length) {
      push("Please correct the highlighted fields.", "error");
      return;
    }
    setSavingProfile(true);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileDraft),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Update failed.");
      push("Profile updated.");
    } catch (error) {
      push(error instanceof Error ? error.message : "Update failed.", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  /* ---------------------------- auth screen ---------------------------- */
  if (loading) {
    return <div className="luxe-card grid h-64 place-items-center text-white/50">Loading your account…</div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md">
        <form onSubmit={submitAuth} noValidate className="luxe-card p-8" data-testid="auth-form">
          <div className="flex gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
            {(["login", "register"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMode(option);
                  setAuthErrors({});
                }}
                className={`flex-1 rounded-full py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] transition ${
                  mode === option ? "bg-gold text-black" : "text-white/60"
                }`}
              >
                {option === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <h1 className="mt-7 font-display text-2xl font-bold text-white">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {mode === "login"
              ? "Track orders, bookings and payment history."
              : "Save your details and track every order in one place."}
          </p>
          <div className="gold-line my-6" />

          <div className="space-y-5">
            {mode === "register" ? (
              <div>
                <span className="label">Full name</span>
                <input
                  value={auth.fullName}
                  onChange={(event) =>
                    setAuth((c) => ({ ...c, fullName: event.target.value }))
                  }
                  className={`field ${authErrors.fullName ? "field-error" : ""}`}
                  placeholder="Adaeze Okonkwo"
                />
                {authErrors.fullName ? (
                  <p className="mt-2 text-xs text-red-300">{authErrors.fullName}</p>
                ) : null}
              </div>
            ) : null}
            <div>
              <span className="label">Email address</span>
              <input
                type="email"
                value={auth.email}
                data-testid="auth-email"
                onChange={(event) => setAuth((c) => ({ ...c, email: event.target.value }))}
                className={`field ${authErrors.email ? "field-error" : ""}`}
                placeholder="you@example.com"
              />
              {authErrors.email ? (
                <p className="mt-2 text-xs text-red-300">{authErrors.email}</p>
              ) : null}
            </div>
            {mode === "register" ? (
              <div>
                <span className="label">Phone number</span>
                <input
                  type="tel"
                  value={auth.phone}
                  onChange={(event) => setAuth((c) => ({ ...c, phone: event.target.value }))}
                  className={`field ${authErrors.phone ? "field-error" : ""}`}
                  placeholder="+234 800 000 0000"
                />
                {authErrors.phone ? (
                  <p className="mt-2 text-xs text-red-300">{authErrors.phone}</p>
                ) : null}
              </div>
            ) : null}
            <div>
              <span className="label">Password</span>
              <input
                type="password"
                value={auth.password}
                data-testid="auth-password"
                onChange={(event) => setAuth((c) => ({ ...c, password: event.target.value }))}
                className={`field ${authErrors.password ? "field-error" : ""}`}
                placeholder="Minimum 8 characters"
              />
              {authErrors.password ? (
                <p className="mt-2 text-xs text-red-300">{authErrors.password}</p>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={authPending}
            className="btn btn-gold mt-8 w-full"
            data-testid="auth-submit"
          >
            {authPending ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <p className="mt-4 text-center text-[0.62rem] tracking-[0.14em] text-white/35">
            YOUR DATA IS ENCRYPTED AND NEVER SOLD.
          </p>
        </form>
        <p className="mt-5 text-center text-sm text-white/45">
          Prefer to order as a guest?{" "}
          <Link href="/shop" className="text-gold-light">
            Shop photo enlargements
          </Link>
        </p>
      </div>
    );
  }

  /* ---------------------------- dashboard ---------------------------- */
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Customer account</p>
          <h1 className="mt-3 font-display text-3xl font-black text-white">
            Hello, {session.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-sm text-white/45">{session.email}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/shop" className="btn btn-outline">
            Shop
          </Link>
          <button type="button" onClick={() => void logout()} className="btn btn-ghost">
            Log out
          </button>
        </div>
      </div>

      <div className="mt-9 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`shrink-0 rounded-full border px-5 py-2.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] transition ${
              tab === item.key
                ? "border-gold bg-gold/15 text-gold-light"
                : "border-white/12 text-white/55 hover:border-white/30"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "orders" ? (
          <Panel
            empty="No orders yet. Your photo enlargement orders will appear here."
            rows={orders.map((order) => ({
              title: order.orderNumber,
              badge: order.paymentStatus,
              meta: `${order.items?.length ?? 0} item(s) · ${formatDate(order.createdAt)}`,
              detail:
                order.items
                  ?.map(
                    (item: any) =>
                      `${item.productName} · ${item.sizeLabel} · ${item.frameLabel} × ${item.quantity}`,
                  )
                  .join(" / ") ?? "",
              amount: formatNaira(order.total),
              status: order.status,
            }))}
          />
        ) : null}

        {tab === "bookings" ? (
          <Panel
            empty="No event bookings yet. Book a coverage package to see it here."
            rows={bookings.map((booking) => ({
              title: booking.bookingRef,
              badge: booking.status,
              meta: `${booking.packageName} · ${formatDate(booking.eventDate)} · ${booking.venue}`,
              detail: booking.email,
              amount: formatNaira(booking.price),
              status: booking.paymentStatus,
            }))}
          />
        ) : null}

        {tab === "payments" ? (
          <Panel
            empty="No payments recorded yet."
            rows={payments.map((payment) => ({
              title: payment.reference,
              badge: payment.status,
              meta: `${payment.channel || "card"} · ${formatDate(payment.paidAt ?? payment.createdAt)}${
                payment.orderNumber ? ` · Order ${payment.orderNumber}` : ""
              }`,
              detail: payment.bookingRef ? `Booking ${payment.bookingRef}` : "",
              amount: formatNaira(payment.amount),
              status: payment.status,
            }))}
          />
        ) : null}

        {tab === "studio" ? (
          <>
            <p className="mb-4 text-sm text-white/50">Photography session bookings and film enquiries.</p>
            <Panel
              empty="No studio requests yet."
              rows={[
                ...sessions.map((item) => ({
                  title: item.sessionRef,
                  badge: item.status,
                  meta: `${item.sessionType} · ${formatDate(item.sessionDate)}`,
                  detail: item.location ?? "",
                  amount: "",
                  status: item.status,
                })),
                ...enquiries.map((item) => ({
                  title: item.enquiryRef,
                  badge: item.status,
                  meta: `${item.serviceName} · ${formatDate(item.createdAt)}`,
                  detail: item.projectBrief?.slice(0, 90) ?? "",
                  amount: formatNaira(item.price),
                  status: item.status,
                })),
              ]}
            />
          </>
        ) : null}

        {tab === "profile" ? (
          <form onSubmit={saveProfile} className="luxe-card max-w-2xl p-7 sm:p-9" noValidate>
            <h2 className="font-display text-2xl font-bold text-white">Profile management</h2>
            <div className="gold-line my-6" />
            <div className="grid gap-5 sm:grid-cols-2">
              {(
                [
                  ["fullName", "Full name", "text"],
                  ["email", "Email address", "email"],
                  ["phone", "Phone number", "tel"],
                  ["city", "City / State", "text"],
                ] as const
              ).map(([key, label, type]) => (
                <div key={key}>
                  <span className="label">{label}</span>
                  <input
                    type={type}
                    value={(profileDraft as any)[key]}
                    onChange={(event) => {
                      setProfileDraft((draft) => ({ ...draft, [key]: event.target.value }));
                      setProfileErrors((c) => ({ ...c, [key]: "" }));
                    }}
                    className={`field ${profileErrors[key] ? "field-error" : ""}`}
                  />
                  {profileErrors[key] ? (
                    <p className="mt-2 text-xs text-red-300">{profileErrors[key]}</p>
                  ) : null}
                </div>
              ))}
              <div className="sm:col-span-2">
                <span className="label">Delivery address</span>
                <input
                  value={profileDraft.address}
                  onChange={(event) =>
                    setProfileDraft((draft) => ({ ...draft, address: event.target.value }))
                  }
                  className="field"
                />
              </div>
              <div className="sm:col-span-2">
                <span className="label">New password (leave blank to keep current)</span>
                <input
                  type="password"
                  value={profileDraft.password}
                  onChange={(event) =>
                    setProfileDraft((draft) => ({ ...draft, password: event.target.value }))
                  }
                  className="field"
                  placeholder="Minimum 8 characters"
                />
              </div>
            </div>
            <button type="submit" disabled={savingProfile} className="btn btn-gold mt-8">
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function Panel({
  rows,
  empty,
}: {
  rows: { title: string; badge: string; meta: string; detail: string; amount: string; status: string }[];
  empty: string;
}) {
  if (!rows.length) {
    return (
      <div className="luxe-card p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/40 text-gold">
          ✦
        </span>
        <p className="mt-5 text-sm text-white/55">{empty}</p>
        <Link href="/shop" className="btn btn-outline mt-6">
          Explore the Shop
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <article key={`${row.title}-${index}`} className="luxe-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-sm font-bold text-white">{row.title}</p>
                <span className={`badge badge-${statusTone(row.badge)}`}>{row.badge}</span>
              </div>
              <p className="mt-2 text-xs text-white/50">{row.meta}</p>
              {row.detail ? <p className="mt-1.5 text-xs text-white/40">{row.detail}</p> : null}
            </div>
            <div className="text-right">
              {row.amount ? (
                <p className="font-display text-xl font-bold gold-text">{row.amount}</p>
              ) : null}
              <span className={`badge badge-${statusTone(row.status)} mt-2`}>{row.status}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
