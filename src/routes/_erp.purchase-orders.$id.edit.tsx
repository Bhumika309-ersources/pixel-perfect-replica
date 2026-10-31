import { createFileRoute, useParams } from "@tanstack/react-router";
import { api, type POFormInput } from "@/services/api";
import { PurchaseOrderForm } from "@/components/purchase-orders/po-form";

export const Route = createFileRoute("/_erp/purchase-orders/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Purchase Order · SupplyFlow ERP" },
      { name: "description", content: "Revise a draft or rejected purchase order." },
      { property: "og:title", content: "Edit Purchase Order · SupplyFlow ERP" },
      { property: "og:description", content: "Revise a draft or rejected purchase order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditPurchaseOrderPage,
});

function EditPurchaseOrderPage() {
  const { id } = useParams({ from: "/_erp/purchase-orders/$id/edit" });
  return (
    <EditPoLoader id={id} />
  );
}

import { useSuspenseQuery } from "@tanstack/react-query";
import { qk } from "@/services/query-keys";

function EditPoLoader({ id }: { id: string }) {
  const { data: po } = useSuspenseQuery({ queryKey: qk.purchaseOrder(id), queryFn: () => api.getPurchaseOrder(id) });

  if (!["draft", "rejected"].includes(po.status)) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          {po.number} is {po.status} and can no longer be edited. Only drafts and rejected orders can be revised.
        </p>
      </div>
    );
  }

  const initial: POFormInput = {
    supplierId: po.supplierId,
    expectedDate: po.expectedDate,
    notes: po.notes,
    lines: po.lines.map((l) => ({ itemId: l.itemId, quantity: l.quantity, unitPrice: l.unitPrice, taxRate: l.taxRate })),
  };

  return (
    <PurchaseOrderForm
      mode="edit"
      pageTitle={`Edit ${po.number}`}
      crumbs={[]}
      initial={initial}
      onSubmit={(input) => api.updatePurchaseOrder(po.id, input)}
    />
  );
}
