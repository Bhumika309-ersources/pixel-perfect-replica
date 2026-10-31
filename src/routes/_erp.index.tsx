import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_erp/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
