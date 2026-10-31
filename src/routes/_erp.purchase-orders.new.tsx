import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/services/api";
import { PurchaseOrderForm } from "@/components/purchase-orders/po-form";

export const Route = createFileRoute("/_erp/purchase-orders/new")({
  head: () => ({
    meta: [
      { title: "New Purchase Order · SupplyFlow ERP" },
      { name: "description", content: "Create a new purchase order for approval." },
      { property: "og:title", content: "New Purchase Order · SupplyFlow ERP" },
      { property: "og:description", content: "Create a new purchase order for approval." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewPurchaseOrderPage,
});

function NewPurchaseOrderPage() {
  return (
    <PurchaseOrderForm
      mode="create"
      pageTitle="New purchase order"
      crumbs={[]}
      onSubmit={(input) => api.createPurchaseOrder(input)}
    />
  );
}
