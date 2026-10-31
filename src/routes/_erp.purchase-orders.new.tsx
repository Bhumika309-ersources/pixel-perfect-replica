import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { api } from "@/services/api";
import { createServerFn } from "@tanstack/react-start";
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

const createPoClient = createServerFn({ method: "POST" }).handler(async ({ data }) => data);
// The form submits through the mock service directly (client-side demo backend).
function NewPurchaseOrderPage() {
  const submit = useServerFn(createPoClient);
  void submit;
  return (
    <PurchaseOrderForm
      mode="create"
      pageTitle="New purchase order"
      crumbs={[]}
      onSubmit={(input) => api.createPurchaseOrder(input)}
    />
  );
}
