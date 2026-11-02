/**
 * Paystack integration.
 *
 * The secret key is only ever read on the server from the environment.
 * It is never exposed to the browser bundle.
 */

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string | null {
  const key = process.env.PAYSTACK_SECRET_KEY;
  return key && key.startsWith("sk_") ? key : null;
}

export const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

/** Paystack amounts are in kobo (1 Naira = 100 kobo). */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function toNaira(kobo: number): number {
  return Math.round(kobo / 100);
}

export function isDemoMode(): boolean {
  return !secretKey() && process.env.PAYSTACK_DEMO_MODE !== "false";
}

type InitializeInput = {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

type InitializeResult = {
  ok: boolean;
  demo: boolean;
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  message?: string;
};

export async function initializeTransaction(
  input: InitializeInput,
): Promise<InitializeResult> {
  const key = secretKey();

  if (!key) {
    if (!isDemoMode()) {
      return {
        ok: false,
        demo: false,
        authorizationUrl: "",
        accessCode: "",
        reference: input.reference,
        message:
          "Online payment is not configured. Please add PAYSTACK_SECRET_KEY to the server environment.",
      };
    }
    return {
      ok: true,
      demo: true,
      authorizationUrl: `${input.callbackUrl.split("?")[0]}?reference=${encodeURIComponent(
        input.reference,
      )}&demo=1`,
      accessCode: "demo",
      reference: input.reference,
    };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: toKobo(input.amount),
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: input.metadata ?? {},
        currency: "NGN",
        channels: ["card", "bank", "ussd", "bank_transfer"],
      }),
      cache: "no-store",
    });
    const payload = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string; access_code?: string; reference?: string };
    };
    if (!response.ok || !payload.status || !payload.data?.authorization_url) {
      return {
        ok: false,
        demo: false,
        authorizationUrl: "",
        accessCode: "",
        reference: input.reference,
        message: payload.message ?? "Paystack could not initialise this transaction.",
      };
    }
    return {
      ok: true,
      demo: false,
      authorizationUrl: payload.data.authorization_url,
      accessCode: payload.data.access_code ?? "",
      reference: payload.data.reference ?? input.reference,
    };
  } catch (error) {
    return {
      ok: false,
      demo: false,
      authorizationUrl: "",
      accessCode: "",
      reference: input.reference,
      message: error instanceof Error ? error.message : "Payment gateway unreachable.",
    };
  }
}

export type VerificationResult = {
  ok: boolean;
  demo: boolean;
  status: "success" | "failed" | "pending" | "abandoned";
  amount: number;
  channel: string;
  paidAt: string | null;
  reference: string;
  message?: string;
  raw?: unknown;
};

export async function verifyTransaction(reference: string): Promise<VerificationResult> {
  const key = secretKey();

  if (!key && isDemoMode()) {
    return {
      ok: true,
      demo: true,
      status: "success",
      amount: 0,
      channel: "demo-card",
      paidAt: new Date().toISOString(),
      reference,
      raw: { demo: true },
    };
  }

  if (!key) {
    return {
      ok: false,
      demo: false,
      status: "pending",
      amount: 0,
      channel: "",
      paidAt: null,
      reference,
      message: "Payment gateway is not configured.",
    };
  }

  try {
    const response = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      },
    );
    const payload = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: {
        status?: string;
        amount?: number;
        channel?: string;
        paid_at?: string | null;
        reference?: string;
      };
    };
    if (!response.ok || !payload.status || !payload.data) {
      return {
        ok: false,
        demo: false,
        status: "failed",
        amount: 0,
        channel: "",
        paidAt: null,
        reference,
        message: payload.message ?? "Verification failed.",
      };
    }
    const data = payload.data;
    return {
      ok: true,
      demo: false,
      status: (data.status ?? "pending") as VerificationResult["status"],
      amount: toNaira(data.amount ?? 0),
      channel: data.channel ?? "",
      paidAt: data.paid_at ?? null,
      reference: data.reference ?? reference,
      raw: data,
    };
  } catch (error) {
    return {
      ok: false,
      demo: false,
      status: "failed",
      amount: 0,
      channel: "",
      paidAt: null,
      reference,
      message: error instanceof Error ? error.message : "Verification request failed.",
    };
  }
}
