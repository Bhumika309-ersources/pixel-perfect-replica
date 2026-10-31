import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/services/api";
import { qk } from "@/services/query-keys";
import { formatCurrency, formatDate, poTotals } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import type { PurchaseOrder, Supplier } from "@/types";

export const Route = createFileRoute("/_erp/purchase-orders/")({
  head: () => ({
    meta: [
      { title: "Purchase Orders · SupplyFlow ERP" },
      { name: "description", content: "All purchase orders: drafts, approvals, receipts and history." },
      { property: "og:title", content: "Purchase Orders · SupplyFlow ERP" },
      { property: "og:description", content: "All purchase orders: drafts, approvals, receipts and history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData({ queryKey: qk.purchaseOrders(), queryFn: () => api.listPurchaseOrders() }),
    context.queryClient.ensureQueryData({ queryKey: qk.suppliers, queryFn: () => api.listSuppliers() }),
  ]),
  component: PurchaseOrdersPage,
});

export function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);
  const poQuery = useSuspenseQuery({ queryKey: qk.purchaseOrders(), queryFn: () => api.listPurchaseOrders() });
  const { data: suppliers } = useSuspenseQuery({ queryKey: qk.suppliers, queryFn: () => api.listSuppliers() });

  if (poQuery.isError) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState message={(poQuery.error as Error).message} onRetry={() => poQuery.refetch()} />
      </div>
    );
  }

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? "—";

  const columns: DataTableColumn<PurchaseOrder>[] = [
    {
      key: "number",
      header: "Order",
      accessor: (po) => po.number,
      cell: (po) => <span className="font-medium text-foreground">{po.number}</span>,
    },
    { key: "supplier", header: "Supplier", accessor: (po) => supplierName(po.supplierId), cell: (po) => supplierName(po.supplierId) },
    {
      key: "status",
      header: "Status",
      accessor: (po) => po.status,
      cell: (po) => <StatusBadge status={po.status} />,
    },
    { key: "orderDate", header: "Ordered", accessor: (po) => po.orderDate, cell: (po) => <span className="text-muted-foreground">{formatDate(po.orderDate)}</span> },
    { key: "expectedDate", header: "Expected", accessor: (po) => po.expectedDate, cell: (po) => <span className="text-muted-foreground">{formatDate(po.expectedDate)}</span>, hideBelow: "md" },
    { key: "lines", header: "Lines", accessor: (po) => po.lines.length, cell: (po) => <span className="tabular text-muted-foreground">{po.lines.length}</span>, align: "right", hideBelow: "sm" },
    {
      key: "total",
      header: "Total",
      accessor: (po) => poTotals(po).total,
      cell: (po) => <span className="font-medium tabular">{formatCurrency(poTotals(po).total)}</span>,
      align: "right",
    },
  ];

  return (
    <>
      <PageHeader
        title="Purchase orders"
        description="Create, approve and receive purchase orders."
        crumbs={[{ label: "Procurement" }, { label: "Purchase orders" }]}
        actions={
          <Button asChild size="sm">
            <Link to="/purchase-orders/new"><Plus className="h-4 w-4" /> New order</Link>
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <DataTable
          data={poQuery.data ?? []}
          rowKey={(po) => po.id}
          searchPlaceholder="Search by order, supplier…"
          searchAccessor={(po) => `${po.number} ${supplierName(po.supplierId)} ${po.status}`}
          initialSort={{ key: "orderDate", dir: "desc" }}
          filters={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "draft", label: "Draft" },
                { value: "submitted", label: "Submitted" },
                { value: "approved", label: "Approved" },
                { value: "partial", label: "Partially received" },
                { value: "received", label: "Received" },
                { value: "rejected", label: "Rejected" },
              ],
              accessor: (po) => po.status,
            },
          ]}
          columns={columns}
          onRowClick={(po) => void navigate({ to: "/purchase-orders/$id", params: { id: po.id } })}
          emptyState={
            <EmptyState
              icon={ShoppingCart}
              title="No purchase orders match"
              description="Adjust the filters or create your first order."
              action={<Button asChild size="sm" variant="outline"><Link to="/purchase-orders/new">New order</Link></Button>}
            />
          }
          toolbarExtra={
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { void queryClient.invalidateQueries({ queryKey: qk.purchaseOrders() }); setRefreshKey((k) => k + 1); }} key={refreshKey}>
              Refresh
            </Button>
          }
        />
      </div>
    </>
  );
}
