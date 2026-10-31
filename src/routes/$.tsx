import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, PackageSearch, SearchX } from "lucide-react";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/$")({
  head: () => pageHead("Page not found · SupplyFlow ERP", "The page you requested does not exist."),
  component: CatchAllNotFound,
});

function CatchAllNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="mt-5 font-display text-5xl font-bold text-foreground">404</h1>
      <h2 className="mt-2 text-lg font-semibold text-foreground">This page doesn't exist</h2>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        The URL you opened isn't part of SupplyFlow ERP. It may have been moved, or the link is wrong.
      </p>
      <div className="mt-6 flex gap-2">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PackageSearch className="h-4 w-4" /> Go to dashboard
        </Link>
        <Link
          to="/purchase-orders"
          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Purchase orders <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
