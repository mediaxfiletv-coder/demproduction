import { db } from "@/db";
import { notifications } from "@/db/schema";

/**
 * Customer notification service.
 *
 * Order confirmations, payment receipts and booking confirmations are delivered
 * through every channel configured in the environment:
 *
 *  - RESEND_API_KEY / SMTP_WEBHOOK_URL -> transactional email API (optional)
 *  - WhatsApp/Telegram style webhooks  -> optional
 *
 * When no external provider is configured (default sandbox) the message is
 * persisted in the `notifications` table so the admin dashboard can display and
 * re-send every customer confirmation, and it is also logged server-side.
 */

type SendInput = {
  kind: string;
  recipient: string;
  subject: string;
  body: string;
};

export async function notify(input: SendInput) {
  let status = "logged";
  const provider = process.env.NOTIFY_PROVIDER;
  const endpoint = process.env.NOTIFY_WEBHOOK_URL;

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.NOTIFY_FROM_EMAIL ?? "DEM PRODUCTION <no-reply@demproduction.ng>",
          to: [input.recipient],
          subject: input.subject,
          html: input.body,
        }),
      });
      status = response.ok ? "sent" : "failed";
    } catch {
      status = "failed";
    }
  } else if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      status = response.ok ? "sent" : "failed";
    } catch {
      status = "failed";
    }
  }

  await db.insert(notifications).values({
    channel: "email",
    recipient: input.recipient,
    subject: input.subject,
    body: input.body,
    kind: input.kind,
    status,
  });

  console.log(
    `[notify:${status}] ${input.kind} -> ${input.recipient} :: ${input.subject}`,
  );
}

export function orderConfirmationEmail(input: {
  name: string;
  orderNumber: string;
  total: string;
  items: { name: string; sizeLabel: string; frameLabel: string; quantity: number; lineTotal: string }[];
  paymentStatus: string;
}) {
  const rows = input.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #222">${escapeHtml(item.name)} — ${escapeHtml(
          item.sizeLabel,
        )} · ${escapeHtml(item.frameLabel)} × ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #222;text-align:right;color:#d4af37">${item.lineTotal}</td></tr>`,
    )
    .join("");
  return {
    subject: `Order ${input.orderNumber} confirmed — DEM PRODUCTION`,
    body: `
      <div style="background:#050505;color:#fff;font-family:Arial,Helvetica,sans-serif;padding:32px;max-width:640px">
        <p style="letter-spacing:.35em;color:#d4af37;font-size:11px;margin:0 0 8px">DEM PRODUCTION</p>
        <h1 style="font-size:24px;margin:0 0 4px">Thank you, ${escapeHtml(input.name)}.</h1>
        <p style="color:#bbb;margin:0 0 24px">Your order <strong style="color:#fff">${input.orderNumber}</strong> has been received.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
        <p style="font-size:20px;margin:20px 0 0">Total: <span style="color:#d4af37">${input.total}</span></p>
        <p style="margin:6px 0 0;color:#bbb">Payment status: <strong style="color:#fff">${input.paymentStatus}</strong></p>
        <p style="margin:28px 0 0;color:#888;font-size:12px">DAVID EJIBE MOVIE PRODUCTION LIMITED · No. 56, St. Michael's Road, Aba, Abia State · +2347055546059</p>
      </div>`,
  };
}

export function paymentReceiptEmail(input: {
  name: string;
  reference: string;
  amount: string;
  channel: string;
}) {
  return {
    subject: `Payment received — ${input.reference}`,
    body: `
      <div style="background:#050505;color:#fff;font-family:Arial,Helvetica,sans-serif;padding:32px;max-width:640px">
        <p style="letter-spacing:.35em;color:#d4af37;font-size:11px;margin:0 0 8px">DEM PRODUCTION</p>
        <h1 style="font-size:22px;margin:0 0 12px">Payment successful</h1>
        <p style="color:#bbb">Hi ${escapeHtml(input.name)}, we have received your payment of
        <strong style="color:#d4af37">${input.amount}</strong> via ${escapeHtml(input.channel || "card")}.</p>
        <p style="color:#bbb">Transaction reference: <strong style="color:#fff">${input.reference}</strong></p>
        <p style="color:#888;font-size:12px;margin-top:28px">DAVID EJIBE MOVIE PRODUCTION LIMITED · Aba, Abia State, Nigeria</p>
      </div>`,
  };
}

export function bookingConfirmationEmail(input: {
  name: string;
  reference: string;
  title: string;
  date: string;
  venue: string;
}) {
  return {
    subject: `Booking ${input.reference} received — DEM PRODUCTION`,
    body: `
      <div style="background:#050505;color:#fff;font-family:Arial,Helvetica,sans-serif;padding:32px;max-width:640px">
        <p style="letter-spacing:.35em;color:#d4af37;font-size:11px;margin:0 0 8px">DEM PRODUCTION</p>
        <h1 style="font-size:22px;margin:0 0 12px">Booking received</h1>
        <p style="color:#bbb">Hi ${escapeHtml(input.name)}, your booking for
        <strong style="color:#fff">${escapeHtml(input.title)}</strong> has been logged.</p>
        <p style="color:#bbb">Reference: <strong style="color:#d4af37">${input.reference}</strong></p>
        <p style="color:#bbb">Date: <strong style="color:#fff">${input.date}</strong></p>
        <p style="color:#bbb">Venue: <strong style="color:#fff">${escapeHtml(input.venue || "To be confirmed")}</strong></p>
        <p style="color:#888;font-size:12px;margin-top:28px">Our production team will contact you within 24 hours.</p>
      </div>`,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
