import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { POStatus, SupplierStatus } from "@/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
  {
    variants: {
      tone: {
        draft: "border-border bg-muted text-muted-foreground",
        submitted: "border-transparent bg-warning text-warning-foreground",
        approved: "border-transparent bg-success text-success-foreground",
        rejected: "border-transparent bg-destructive text-destructive-foreground",
        partial: "border-transparent bg-info text-info-foreground",
        received: "border-transparent bg-primary text-primary-foreground",
        active: "border-transparent bg-success text-success-foreground",
        onhold: "border-transparent bg-warning text-warning-foreground",
        blacklisted: "border-transparent bg-destructive text-destructive-foreground",
        neutral: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function StatusBadge({
  status,
  className,
}: {
  status: POStatus | SupplierStatus;
  className?: string;
}) {
  return <span className={cn(badgeVariants({ tone: status }), className)}>{status.replace("-", " ")}</span>;
}

export function StockTonePill({ tone, label }: { tone: "ok" | "watch" | "low" | "out"; label: string }) {
  return (
    <span className={cn(badgeVariants({ tone: tone === "ok" ? "approved" : tone === "out" ? "rejected" : tone === "low" ? "submitted" : "partial" }))}>
      {label}
    </span>
  );
}

export type { VariantProps<typeof badgeVariants> };
