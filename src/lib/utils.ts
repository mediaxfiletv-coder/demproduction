export function formatNaira(amount: number): string {
  return `₦${new Intl.NumberFormat("en-NG").format(Math.round(amount))}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function randomReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isPhone(value: string): boolean {
  return value.replace(/\D/g, "").length >= 10;
}

export function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export type FieldError = { field: string; message: string };

type Rule = {
  required?: boolean;
  label: string;
  test?: (v: string) => boolean;
  message?: string;
};

export function validate(
  values: Record<string, string>,
  rules: Record<string, Rule>,
): FieldError[] {
  const errors: FieldError[] = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = (values[field] ?? "").trim();
    if (rule.required && !value) {
      errors.push({ field, message: `${rule.label} is required.` });
      continue;
    }
    if (value && rule.test && !rule.test(value)) {
      errors.push({ field, message: rule.message ?? `${rule.label} is invalid.` });
    }
  }
  return errors;
}

export function statusTone(status: string): "gold" | "green" | "red" | "slate" {
  const value = status.toLowerCase();
  if (["paid", "delivered", "completed", "confirmed", "success"].includes(value)) return "green";
  if (["failed", "cancelled", "refunded"].includes(value)) return "red";
  if (["pending", "unpaid", "processing", "shipped", "new", "quoted"].includes(value)) {
    return "gold";
  }
  return "slate";
}
