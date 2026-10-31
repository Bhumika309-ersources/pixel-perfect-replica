import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/services/api";
import { qk } from "@/services/query-keys";
import { formatCurrency, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Truck, TrendingUp, Users, Boxes } from "lucide-react";

export const Route = createFileRoute("/_erp/dashboard/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · SupplyFlow ERP" },
      { name: "description", content: "Procurement analytics: spend, supplier reliability and warehouse utilization." },
      { property: "og:title", content: "Analytics · SupplyFlow ERP" },
      { property: "og:description", content: "Procurement analytics: spend, supplier reliability and warehouse utilization." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData({ queryKey: qk.dashboard, queryFn: () => api.getDashboardSummary() }),
    context.queryClient.ensureQueryData({ queryKey: qk.supplierPerformance, queryFn: () => api.getSupplierPerformance() }),
    context.queryClient.ensureQueryData({ queryKey: qk.warehouses, queryFn: () => api.listWarehouses() }),
  ]),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: summary } = useSuspenseQuery({ queryKey: qk.dashboard, queryFn: () => api.getDashboardSummary() });
  const { data: performance } = useSuspenseQuery({ queryKey: qk.supplierPerformance, queryFn: () => api.getSupplierPerformance() });
  const { data: warehouses } = useSuspenseQuery({ queryKey: qk.warehouses, queryFn: () => api.listWarehouses() });

  const palette = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];
  const topCategories = summary.spendByCategory.slice(0, 5);
  const supplierReliability = performance
    .filter((p) => p.orderCount > 0)
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 6)
    .map((p) => ({
      name: p.supplier.name,
      onTime: Math.round(p.onTimeRate * 100),
      quality: Math.round(p.qualityRate * 100),
    }));
  const warehouseLoad = warehouses.map((w) => ({
    name: w.code,
    utilization: Math.round((w.usedPallets / w.capacityPallets) * 100),
    used: w.usedPallets,
    capacity: w.capacityPallets,
  }));
  const avgOnTime = supplierReliability.length
    ? supplierReliability.reduce((s, r) => s + r.onTime, 0) / supplierReliability.length / 100
    : 0;
  const totalSpend = summary.spendByMonth.reduce((s, m) => s + m.spend, 0);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Trends across purchasing, supplier reliability and warehouse capacity."
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Analytics" }]}
      />
      <div className="space-y-4 p-4 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="6-month spend" value={formatCurrency(totalSpend, { compact: true })} icon={TrendingUp} />
          <StatCard label="Avg supplier on-time" value={formatPercent(avgOnTime)} sub="across active suppliers" icon={Users} tone={avgOnTime >= 0.9 ? "positive" : "warning"} />
          <StatCard label="Receipts this month" value={String(summary.receiptsThisMonth)} icon={Truck} tone="positive" />
          <StatCard label="Categories tracked" value={String(summary.spendByCategory.length)} icon={Boxes} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Category share of procurement spend</h2>
            <div className="mt-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topCategories} dataKey="value" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2} strokeWidth={0}>
                    {topCategories.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Supplier reliability</h2>
            <p className="text-xs text-muted-foreground">On-time delivery vs. quality acceptance, top suppliers</p>
            <div className="mt-3 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierReliability} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }} />
                  <Bar dataKey="onTime" name="On-time" fill="var(--color-chart-1)" radius={[0, 3, 3, 0]} barSize={10} />
                  <Bar dataKey="quality" name="Quality" fill="var(--color-chart-2)" radius={[0, 3, 3, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Warehouse utilization</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {warehouseLoad.map((w, i) => (
              <div key={w.name} className="rounded-lg border bg-background p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{w.name}</p>
                  <span className="text-xs font-semibold tabular" style={{ color: w.utilization > 85 ? "var(--color-destructive)" : w.utilization > 70 ? "var(--color-warning-foreground)" : "var(--color-success)" }}>
                    {w.utilization}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${w.utilization}%`, backgroundColor: w.utilization > 85 ? "var(--color-destructive)" : w.utilization > 70 ? "var(--color-chart-2)" : "var(--color-chart-1)" }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{w.used.toLocaleString()} / {w.capacity.toLocaleString()} pallets</p>
                <span className="hidden">{palette[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
