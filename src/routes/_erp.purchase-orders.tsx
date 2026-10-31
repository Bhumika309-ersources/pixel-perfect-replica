import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_erp/purchase-orders")({
  component: () => <Outlet />,
});
