import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ClipboardCheck,
  PackageCheck,
  ShoppingCart,
  Warehouse,
} from "lucide-react";
import { api } from "@/services/api";
import { qk } from "@/services/query-keys";
import { formatCurrency, formatRelative, formatRelativeDateTime as _fmt, titleize } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_erp/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard · SupplyFlow ERP" },
      { name: "description", content: "Procurement and inventory overview for Northbridge Manufacturing." },
      { property: "og:title", content: "Dashboard · SupplyFlow ERP" },
      { property: "og:description", content: "Procurement and inventory overview for Northbridge Manufacturing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData({
    queryKey: qk.dashboard,
    queryFn: () => api.getDashboardSummary(),
  }),
  component: DashboardPage,
});

const SEVERITY_DOT = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
};

function DashboardPage() {
  const { data: summary } = useSuspenseQuery({ queryKey: qk.dashboard, queryFn: () => api.getDashboardSummary() });
  const categoryColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Purchasing activity, receiving and stock health across all sites."
        crumbs={[{ label: "Dashboard" }]}
        actions={
          <Button asChild size="sm">
            <Link to="/purchase-orders/new">New purchase order</Link>
          </Button>
        }
      />

      <div className="space-y-4 p-4 md:p-6">
        {summary.pendingApprovals > 0 && (
          <Link
            to="/purchase-orders/approvals"
            className="flex items-center justify-between rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 transition-colors hover:bg-warning/20"
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-4 w-4 text-warning-foreground" />
              <p className="text-sm font-medium text-foreground">
                {summary.pendingApprovals} purchase order{summary.pendingApprovals > 1 ? "s" : ""} waiting for approval
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">Review now <ArrowRight className="h-3 w-3" /></span>
          </Link>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open PO value" value={formatCurrency(summary.openPoValue, { compact: true })} sub={`${summary.openPoCount} open orders`} icon={ShoppingCart} />
          <StatCard label="Pending approvals" value={String(summary.pendingApprovals)} sub="awaiting a decision" icon={ClipboardCheck} tone={summary.pendingApprovals > 3 ? "warning" : "default"} />
          <StatCard label="Receipts this month" value={String(summary.receiptsThisMonth)} sub="goods receipts posted" icon={PackageCheck} tone="positive" />
          <StatCard label="Inventory value" value={formatCurrency(summary.inventoryValue, { compact: true })} sub="on hand, all warehouses" icon={Warehouse} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Spend trend</h2>
              <span className="text-xs text-muted-foreground">Last 6 months</span>
            </div>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.spendByMonth} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => formatCurrency(v, { compact: true })} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={64} />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#spendFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Top suppliers by spend</h2>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.topSuppliers} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }} />
                  <Bar dataKey="spend" radius={[0, 4, 4, 0]} barSize={16}>
                    {summary.topSuppliers.map((_, i) => (
                      <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border bg-card lg:col-span-2">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Low stock watchlist</h2>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link to="/inventory">All items</Link>
              </Button>
            </div>
            {summary.lowStockItems.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Everything is comfortably above reorder points.</p>
            ) : (
              <div className="divide-y">
                {summary.lowStockItems.map(({ item, totalQty, reorderPoint }) => (
                  <Link key={item.id} to="/inventory/$id" params={{ id: item.id }} className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-accent">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku} · {item.category}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="tabular text-muted-foreground">{totalQty} / {reorderPoint}</span>
                      <StatusBadge status={totalQty <= 0 ? "rejected" : "submitted"} className={totalQty <= 0 ? "" : "normal-case"}>{totalQty <= 0 ? "Out of stock" : "Reorder"}</StatusBadge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Recent activity</h2>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link to="/activity-log">View log</Link>
              </Button>
            </div>
            <div className="divide-y">
              {summary.recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2.5 px-4 py-2.5">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", SEVERITY_DOT[entry.severity])} />
                  <div className="min-w-0">
                    <p className="text-[13px] leading-snug">
                      <span className="font-medium">{entry.actor}</span>{" "}
                      <span className="text-muted-foreground">{entry.action} {entry.entity}{entry.entityRef ? ` · ${entry.entityRef}` : ""}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{entry.detail}</p>
                    <p className="text-[10px] text-muted-foreground/70">{formatRelative(entry.occurredAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
