import type { POLine, PurchaseOrder } from "@/types";

export function formatCurrency(value: number, opts: { compact?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts.compact && Math.abs(value) >= 1000 ? 1 : 2,
    notation: opts.compact && Math.abs(value) >= 100_000 ? "compact" : "standard",
  }).format(value);
}

export function formatQty(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function formatPercent(value: number, fractionDigits = 0) {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelative(iso: string | null | undefined) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function lineTotal(line: POLine) {
  return line.quantity * line.unitPrice * (1 + line.taxRate / 100);
}

export function poTotals(po: Pick<PurchaseOrder, "lines">) {
  const subtotal = po.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const tax = po.lines.reduce(
    (sum, l) => sum + l.quantity * l.unitPrice * (l.taxRate / 100),
    0,
  );
  const receivedSubtotal = po.lines.reduce(
    (sum, l) => sum + l.receivedQty * l.unitPrice,
    0,
  );
  return { subtotal, tax, total: subtotal + tax, receivedSubtotal };
}

export function stockStatusFor(totalQty: number, reorderPoint: number) {
  if (totalQty <= 0) return "out" as const;
  if (totalQty <= reorderPoint) return "low" as const;
  if (totalQty <= reorderPoint * 2) return "watch" as const;
  return "ok" as const;
}

export function titleize(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
