import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: "default" | "positive" | "warning" | "danger";
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            tone === "positive" && "bg-success/10 text-success",
            tone === "warning" && "bg-warning/15 text-warning-foreground",
            tone === "danger" && "bg-destructive/10 text-destructive",
            tone === "default" && "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tabular text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
