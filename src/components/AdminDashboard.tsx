"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { formatNaira, formatDate, isEmail, statusTone, validate } from "@/lib/utils";

type Session = { role: string; name: string; email: string; id: number } | null;
type Errors = Record<string, string>;

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "orders", label: "Orders" },
  { key: "payments", label: "Payments" },
  { key: "bookings", label: "Event Bookings" },
  { key: "studio", label: "Studio & Film" },
  { key: "products", label: "Products & Prices" },
  { key: "gallery", label: "Gallery" },
  { key: "customers", label: "Customers" },
  { key: "messages", label: "Messages" },
] as const;

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"];

export default function AdminDashboard() {
  const { push } = useToast();
  const [session, setSession] = useState<Session>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<string>("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [auth, setAuth] = useState({ email: "", password: "" });
  const [authErrors, setAuthErrors] = useState<Errors>({});
  const [authPending, setAuthPending] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      const payload = (await response.json()) as { user: Session };
      setSession(payload.user);
    } catch {
      setSession(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) setData(await response.json());
      else if (response.status === 401) setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.role === "admin") void loadStats();
  }, [session, loadStats]);

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    const map: Errors = {};
    for (const error of validate(auth, {
      email: {
        required: true,
        label: "Email address",
        test: isEmail,
        message: "Enter a valid email address.",
      },
      password: { required: true, label: "Password" },
    })) {
      map[error.field] = error.message;
    }
    setAuthErrors(map);
    if (Object.keys(map).length) return;

    setAuthPending(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auth),
      });
      const payload = (await response.json()) as { ok?: boolean; role?: string; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Login failed.");
      if (payload.role !== "admin") throw new Error("That account is not an administrator.");
      push("Welcome back, administrator.");
      setSession({ role: "admin", name: "", email: auth.email, id: 0 });
      setChecking(false);
      await loadSession();
    } catch (error) {
      push(error instanceof Error ? error.message : "Login failed.", "error");
    } finally {
      setAuthPending(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/session", { method: "POST" });
    setSession(null);
    setData(null);
    push("Signed out.");
  }

  async function patch(url: string, body: unknown, okMessage: string) {
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Update failed.");
      push(okMessage);
      await loadStats();
      return true;
    } catch (error) {
      push(error instanceof Error ? error.message : "Update failed.", "error");
      return false;
    }
  }

  if (checking) {
    return <div className="luxe-card grid h-64 place-items-center text-white/50">Checking access…</div>;
  }

  if (session?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md">
        <form onSubmit={submitLogin} noValidate className="luxe-card p-8" data-testid="admin-login">
          <span className="eyebrow">Restricted area</span>
          <h1 className="mt-4 font-display text-3xl font-black text-white">Administrator sign in</h1>
          <p className="mt-3 text-sm text-white/50">
            Manage orders, prices, bookings, payments and the gallery.
          </p>
          <div className="gold-line my-6" />
          <div className="space-y-5">
            <div>
              <span className="label">Email address</span>
              <input
                type="email"
                value={auth.email}
                data-testid="admin-email"
                onChange={(event) => setAuth((c) => ({ ...c, email: event.target.value }))}
                className={`field ${authErrors.email ? "field-error" : ""}`}
                placeholder="admin@example.com"
              />
              {authErrors.email ? (
                <p className="mt-2 text-xs text-red-300">{authErrors.email}</p>
              ) : null}
            </div>
            <div>
              <span className="label">Password</span>
              <input
                type="password"
                value={auth.password}
                data-testid="admin-password"
                onChange={(event) => setAuth((c) => ({ ...c, password: event.target.value }))}
                className={`field ${authErrors.password ? "field-error" : ""}`}
                placeholder="••••••••"
              />
              {authErrors.password ? (
                <p className="mt-2 text-xs text-red-300">{authErrors.password}</p>
              ) : null}
            </div>
          </div>
          <button
            type="submit"
            disabled={authPending}
            data-testid="admin-submit"
            className="btn btn-gold mt-8 w-full"
          >
            {authPending ? "Verifying…" : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  const stats = data?.stats ?? {};

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1 className="mt-3 font-display text-3xl font-black text-white">Control Room</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void loadStats()}
            className="btn btn-outline"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" onClick={() => void logout()} className="btn btn-ghost">
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Revenue", formatNaira(stats.revenue ?? 0)],
          ["Orders", String(stats.orders ?? 0)],
          ["Paid Orders", String(stats.paidOrders ?? 0)],
          ["Event Bookings", String(stats.bookings ?? 0)],
          ["Payments OK", String(stats.successfulPayments ?? 0)],
          ["Failed Payments", String(stats.failedPayments ?? 0)],
          ["Customers", String(stats.customers ?? 0)],
          ["Pending Value", formatNaira(stats.pendingRevenue ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="luxe-card p-5">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.22em] text-white/40">
              {label}
            </p>
            <p className="mt-2 font-display text-2xl font-black gold-text">{value}</p>
          </div>
        ))}
      </div>

      {stats.monthly?.length ? (
        <div className="luxe-card mt-6 p-6">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
            Revenue by month
          </p>
          <div className="mt-5 flex h-40 items-end gap-3">
            {stats.monthly.map((item: any) => {
              const max = Math.max(...stats.monthly.map((m: any) => m.amount), 1);
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[0.55rem] text-white/45">
                    {formatNaira(item.amount)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-gold-deep to-gold-light"
                    style={{ height: `${Math.max(6, (item.amount / max) * 100)}%` }}
                  />
                  <span className="text-[0.55rem] text-white/40">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`shrink-0 rounded-full border px-4 py-2.5 text-[0.64rem] font-bold uppercase tracking-[0.14em] transition ${
              tab === item.key
                ? "border-gold bg-gold/15 text-gold-light"
                : "border-white/12 text-white/55 hover:border-white/30"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {tab === "overview" ? (
          <div className="luxe-card p-6">
            <p className="text-sm text-white/55">
              {stats.orders ?? 0} orders · {stats.bookings ?? 0} event bookings ·{" "}
              {stats.enquiries ?? 0} film enquiries · {stats.sessions ?? 0} photo sessions ·{" "}
              {stats.products ?? 0} products ({stats.variants ?? 0} price variants) ·{" "}
              {stats.images ?? 0} gallery images · {stats.messages ?? 0} unread messages.
            </p>
          </div>
        ) : null}

        {tab === "orders" && data?.orders ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Order status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="font-mono text-gold-light">{order.orderNumber}</td>
                    <td>
                      <span className="block text-white">{order.customerName}</span>
                      <span className="block text-xs text-white/45">{order.email}</span>
                      <span className="block text-xs text-white/35">{order.phone}</span>
                      <span className="block text-xs text-white/35">
                        {order.deliveryAddress}
                      </span>
                    </td>
                    <td className="max-w-[280px] text-xs text-white/60">
                      {(order as any).items?.length
                        ? (order as any).items.map((item: any) => (
                            <span key={item.id} className="block">
                              {item.productName} · {item.sizeLabel} · {item.frameLabel} ×{" "}
                              {item.quantity}
                              {item.uploadedImageUrl ? " 📎" : ""}
                            </span>
                          ))
                        : "—"}
                    </td>
                    <td className="font-semibold text-gold-light">
                      {formatNaira(order.total)}
                    </td>
                    <td>
                      <select
                        className="input-sm"
                        value={order.paymentStatus}
                        onChange={(event) =>
                          void patch(
                            `/api/orders/${order.id}`,
                            { paymentStatus: event.target.value },
                            "Payment status updated.",
                          )
                        }
                      >
                        {PAYMENT_STATUSES.map((value) => (
                          <option key={value} value={value} className="bg-black">
                            {value}
                          </option>
                        ))}
                      </select>
                      <span className={`badge badge-${statusTone(order.paymentStatus)} mt-2`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        className="input-sm"
                        value={order.status}
                        onChange={(event) =>
                          void patch(
                            `/api/orders/${order.id}`,
                            { status: event.target.value },
                            "Order status updated.",
                          )
                        }
                      >
                        {ORDER_STATUSES.map((value) => (
                          <option key={value} value={value} className="bg-black">
                            {value}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap text-xs text-white/45">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "payments" && data?.payments ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Channel</th>
                  <th>Customer</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment: any) => (
                  <tr key={payment.id}>
                    <td className="font-mono text-gold-light">{payment.reference}</td>
                    <td className="font-semibold text-white">{formatNaira(payment.amount)}</td>
                    <td>
                      <span className={`badge badge-${statusTone(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="text-white/55">{payment.channel || "—"}</td>
                    <td className="text-white/55">
                      {payment.email}
                      {payment.orderNumber ? ` · ${payment.orderNumber}` : ""}
                      {payment.bookingRef ? ` · ${payment.bookingRef}` : ""}
                    </td>
                    <td className="text-xs text-white/45">
                      {formatDate(payment.paidAt ?? payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "bookings" && data?.bookings ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Package</th>
                  <th>Customer</th>
                  <th>Event</th>
                  <th>Venue</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.bookings.map((booking: any) => (
                  <tr key={booking.id}>
                    <td className="font-mono text-gold-light">{booking.bookingRef}</td>
                    <td className="text-white">{booking.packageName}</td>
                    <td>
                      <span className="block text-white">{booking.customerName}</span>
                      <span className="block text-xs text-white/45">{booking.email}</span>
                      <span className="block text-xs text-white/35">{booking.phone}</span>
                    </td>
                    <td className="text-xs text-white/60">
                      {booking.eventType || "—"}
                      <br />
                      {formatDate(booking.eventDate)}
                    </td>
                    <td className="max-w-[200px] text-xs text-white/60">{booking.venue}</td>
                    <td className="font-semibold text-gold-light">
                      {formatNaira(booking.price)}
                    </td>
                    <td>
                      <select
                        className="input-sm"
                        value={booking.status}
                        onChange={(event) =>
                          void patch(
                            "/api/bookings",
                            { id: booking.id, status: event.target.value },
                            "Booking updated.",
                          )
                        }
                      >
                        {["pending", "confirmed", "completed", "cancelled"].map((value) => (
                          <option key={value} value={value} className="bg-black">
                            {value}
                          </option>
                        ))}
                      </select>
                      <span
                        className={`badge badge-${statusTone(booking.paymentStatus)} mt-2`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "studio" && data ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="table-wrap">
              <table className="admin-table" style={{ minWidth: 480 }}>
                <thead>
                  <tr>
                    <th>Film enquiry</th>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.enquiries ?? []).map((item: any) => (
                    <tr key={item.id}>
                      <td className="font-mono text-gold-light">{item.enquiryRef}</td>
                      <td>
                        <span className="block text-white">{item.serviceName}</span>
                        <span className="block text-xs text-white/45">
                          {formatNaira(item.price)}
                        </span>
                        <span className="mt-1 block max-w-[220px] text-xs text-white/40">
                          {item.projectBrief}
                        </span>
                      </td>
                      <td className="text-xs text-white/55">
                        {item.customerName}
                        <br />
                        {item.email}
                      </td>
                      <td>
                        <select
                          className="input-sm"
                          value={item.status}
                          onChange={(event) =>
                            void patch(
                              "/api/movie-enquiries",
                              { id: item.id, status: event.target.value },
                              "Enquiry updated.",
                            )
                          }
                        >
                          {["new", "reviewing", "quoted", "won", "lost"].map((value) => (
                            <option key={value} value={value} className="bg-black">
                              {value}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-wrap">
              <table className="admin-table" style={{ minWidth: 480 }}>
                <thead>
                  <tr>
                    <th>Photo session</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.sessions ?? []).map((item: any) => (
                    <tr key={item.id}>
                      <td className="font-mono text-gold-light">{item.sessionRef}</td>
                      <td>
                        <span className="block text-white">{item.sessionType}</span>
                        <span className="block text-xs text-white/45">
                          {formatDate(item.sessionDate)}
                        </span>
                      </td>
                      <td className="text-xs text-white/55">
                        {item.customerName}
                        <br />
                        {item.email}
                      </td>
                      <td>
                        <select
                          className="input-sm"
                          value={item.status}
                          onChange={(event) =>
                            void patch(
                              "/api/photo-sessions",
                              { id: item.id, status: event.target.value },
                              "Session updated.",
                            )
                          }
                        >
                          {["pending", "confirmed", "completed", "cancelled"].map((value) => (
                            <option key={value} value={value} className="bg-black">
                              {value}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "products" && data?.products ? (
          <div className="space-y-6">
            {(data.products as any[]).map((product) => (
              <div key={product.id} className="luxe-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{product.name}</h3>
                    <p className="mt-1 max-w-2xl text-xs text-white/45">{product.description}</p>
                  </div>
                  <span className="badge badge-slate">{product.slug}</span>
                </div>
                <div className="table-wrap mt-5">
                  <table className="admin-table" style={{ minWidth: 560 }}>
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Frame type</th>
                        <th>Frame label</th>
                        <th>Price (₦)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(product.variants ?? []).map((variant: any) => (
                        <tr key={variant.id}>
                          <td className="text-white">{variant.sizeLabel}</td>
                          <td className="font-mono text-xs text-white/45">{variant.frameType}</td>
                          <td>
                            <input
                              className="input-sm"
                              defaultValue={variant.frameLabel}
                              onBlur={(event) =>
                                event.target.value !== variant.frameLabel
                                  ? void patch(
                                      `/api/variants/${variant.id}`,
                                      { frameLabel: event.target.value },
                                      "Frame label updated.",
                                    )
                                  : null
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="input-sm"
                              defaultValue={variant.price}
                              onBlur={(event) =>
                                Number(event.target.value) !== variant.price
                                  ? void patch(
                                      `/api/variants/${variant.id}`,
                                      { price: Number(event.target.value) },
                                      "Price updated.",
                                    )
                                  : null
                              }
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={async () => {
                                const response = await fetch(
                                  `/api/variants/${variant.id}`,
                                  { method: "DELETE" },
                                );
                                if (response.ok) {
                                  push("Variant removed.");
                                  await loadStats();
                                } else {
                                  push("Could not remove variant.", "error");
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <AddVariantRow
                  productId={product.id}
                  onSaved={() => void loadStats()}
                />
              </div>
            ))}
          </div>
        ) : null}

        {tab === "gallery" && data ? (
          <GalleryManager images={data.images ?? []} onSaved={() => void loadStats()} />
        ) : null}

        {tab === "customers" && data?.customers ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((customer: any) => (
                  <tr key={customer.id}>
                    <td className="text-white">{customer.fullName}</td>
                    <td className="text-gold-light">{customer.email}</td>
                    <td className="text-white/55">{customer.phone}</td>
                    <td className="max-w-[260px] text-xs text-white/50">
                      {customer.address} {customer.city}
                    </td>
                    <td className="text-xs text-white/45">{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "messages" && data?.messages ? (
          <div className="space-y-4">
            {data.messages.map((message: any) => (
              <article key={message.id} className="luxe-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-white">{message.subject || "Website enquiry"}</p>
                  <span
                    className={`badge badge-${message.handled ? "green" : "gold"}`}
                  >
                    {message.handled ? "Handled" : "New"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-white/45">
                  {message.name} · {message.email} {message.phone ? `· ${message.phone}` : ""} ·{" "}
                  {formatDate(message.createdAt)}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm text-white/65">{message.message}</p>
                {!message.handled ? (
                  <button
                    type="button"
                    className="btn btn-outline mt-4"
                    onClick={async () => {
                      const response = await fetch("/api/admin/messages", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: message.id }),
                      });
                      if (response.ok) {
                        push("Marked as handled.");
                        await loadStats();
                      }
                    }}
                  >
                    Mark as handled
                  </button>
                ) : null}
              </article>
            ))}
            {!data.messages.length ? (
              <div className="luxe-card p-8 text-center text-sm text-white/50">
                No contact messages yet.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AddVariantRow({
  productId,
  onSaved,
}: {
  productId: number;
  onSaved: () => void;
}) {
  const { push } = useToast();
  const [draft, setDraft] = useState({
    sizeLabel: "",
    frameType: "normal_frame",
    frameLabel: "",
    price: "",
  });
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-4">
      <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold">
        Add size / frame type
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-5">
        <input
          className="input-sm"
          placeholder="Size, e.g. 20 × 30 in"
          value={draft.sizeLabel}
          onChange={(event) => setDraft((c) => ({ ...c, sizeLabel: event.target.value }))}
        />
        <select
          className="input-sm"
          value={draft.frameType}
          onChange={(event) => setDraft((c) => ({ ...c, frameType: event.target.value }))}
        >
          <option value="normal_frame" className="bg-black">
            normal_frame
          </option>
          <option value="acrylic_with_glass" className="bg-black">
            acrylic_with_glass
          </option>
          <option value="acrylic_without_glass" className="bg-black">
            acrylic_without_glass
          </option>
        </select>
        <input
          className="input-sm"
          placeholder="Frame label"
          value={draft.frameLabel}
          onChange={(event) => setDraft((c) => ({ ...c, frameLabel: event.target.value }))}
        />
        <input
          type="number"
          className="input-sm"
          placeholder="Price in ₦"
          value={draft.price}
          onChange={(event) => setDraft((c) => ({ ...c, price: event.target.value }))}
        />
        <button
          type="button"
          disabled={pending}
          className="btn btn-gold !px-4 !py-2.5 !text-[0.6rem]"
          onClick={async () => {
            if (!draft.sizeLabel || !draft.frameLabel || !draft.price) {
              push("Complete all variant fields.", "error");
              return;
            }
            setPending(true);
            try {
              const response = await fetch(`/api/products/${productId}/variants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
              });
              const payload = (await response.json()) as { ok?: boolean; error?: string };
              if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Could not add.");
              push("Variant added.");
              setDraft({ sizeLabel: "", frameType: "normal_frame", frameLabel: "", price: "" });
              onSaved();
            } catch (error) {
              push(error instanceof Error ? error.message : "Could not add.", "error");
            } finally {
              setPending(false);
            }
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function GalleryManager({ images, onSaved }: { images: any[]; onSaved: () => void }) {
  const { push } = useToast();
  const [collection, setCollection] = useState("portfolio");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const payload = (await response.json()) as { ok?: boolean; url?: string; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Upload failed.");
      setImageUrl(payload.url ?? "");
      push("Image uploaded.");
    } catch (error) {
      push(error instanceof Error ? error.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-4 sm:grid-cols-3">
        {images.map((image) => (
          <figure key={image.id} className="luxe-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.imageUrl}
              alt={image.title || image.category || "Gallery image"}
              className="h-44 w-full object-cover"
            />
            <figcaption className="p-4">
              <p className="text-xs font-semibold text-white">{image.title || "Untitled"}</p>
              <p className="mt-1 text-[0.58rem] uppercase tracking-[0.18em] text-gold">
                {image.collection} · {image.category || "—"}
              </p>
              <button
                type="button"
                className="mt-3 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-red-300"
                onClick={async () => {
                  const response = await fetch(`/api/images?id=${image.id}`, {
                    method: "DELETE",
                  });
                  if (response.ok) {
                    push("Image removed.");
                    onSaved();
                  }
                }}
              >
                Remove
              </button>
            </figcaption>
          </figure>
        ))}
        {!images.length ? (
          <div className="luxe-card col-span-full p-8 text-center text-sm text-white/50">
            No gallery images yet.
          </div>
        ) : null}
      </div>

      <aside className="luxe-card h-fit p-6">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
          Upload gallery image
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <span className="label">Collection</span>
            <select
              className="input-sm"
              value={collection}
              onChange={(event) => setCollection(event.target.value)}
            >
              <option value="portfolio" className="bg-black">
                portfolio
              </option>
              <option value="shop" className="bg-black">
                shop
              </option>
            </select>
          </div>
          <div>
            <span className="label">Title</span>
            <input
              className="input-sm"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Red carpet highlights"
            />
          </div>
          <div>
            <span className="label">Category</span>
            <input
              className="input-sm"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Events"
            />
          </div>
          <div>
            <span className="label">Image file</span>
            <input
              type="file"
              accept="image/*"
              className="text-xs text-white/60"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = "";
              }}
            />
            {uploading ? (
              <p className="mt-2 text-xs text-gold-light">Uploading…</p>
            ) : null}
          </div>
          {imageUrl ? (
            <p className="break-all text-[0.6rem] text-white/40">{imageUrl}</p>
          ) : null}
          <button
            type="button"
            className="btn btn-gold w-full"
            onClick={async () => {
              if (!imageUrl) {
                push("Upload an image first.", "error");
                return;
              }
              const response = await fetch("/api/images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ collection, title, category, imageUrl }),
              });
              const payload = (await response.json()) as { ok?: boolean; error?: string };
              if (!response.ok || !payload.ok) {
                push(payload.error ?? "Could not add image.", "error");
                return;
              }
              push("Added to gallery.");
              setImageUrl("");
              setTitle("");
              setCategory("");
              onSaved();
            }}
          >
            Add to gallery
          </button>
        </div>
      </aside>
    </div>
  );
}
