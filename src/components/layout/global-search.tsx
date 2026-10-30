import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { api } from "@/services/api";
import { qk } from "@/services/query-keys";
import { formatCurrency, formatDate, poTotals } from "@/lib/format";

interface SearchHit {
  id: string;
  group: "Purchase Orders" | "Suppliers" | "Items";
  title: string;
  subtitle: string;
  to: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const results = useQueries({
    queries: [
      { queryKey: qk.purchaseOrders(), queryFn: () => api.listPurchaseOrders() },
      { queryKey: qk.suppliers, queryFn: () => api.listSuppliers() },
      { queryKey: qk.items, queryFn: () => api.listItems() },
    ],
    combine: ([poRes, supRes, itemRes]) => {
      const hits: SearchHit[] = [];
      poRes.data?.forEach((po) =>
        hits.push({
          id: po.id,
          group: "Purchase Orders",
          title: po.number,
          subtitle: `${po.status} · ${formatCurrency(poTotals(po).total)}`,
          to: `/purchase-orders/${po.id}`,
        }),
      );
      supRes.data?.forEach((s) =>
        hits.push({
          id: s.id,
          group: "Suppliers",
          title: s.name,
          subtitle: `${s.code} · ${s.city}, ${s.country}`,
          to: `/suppliers/${s.id}`,
        }),
      );
      itemRes.data?.forEach((i) =>
        hits.push({
          id: i.id,
          group: "Items",
          title: i.name,
          subtitle: `${i.sku} · ${formatCurrency(i.unitCost)} / ${i.unit}`,
          to: `/inventory/${i.id}`,
        }),
      );
      return hits;
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchHit[]>();
    results.forEach((hit) => {
      map.set(hit.group, [...(map.get(hit.group) ?? []), hit]);
    });
    return map;
  }, [results]);

  const go = (hit: SearchHit) => {
    setOpen(false);
    void navigate({ to: hit.to });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 rounded-md border bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-accent md:w-64"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Search orders, suppliers, items…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] md:inline">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput placeholder="Type to search…" />
        <CommandList>
          <CommandEmpty>No matches found.</CommandEmpty>
          {[...grouped.entries()].map(([group, hits]) => (
            <CommandGroup key={group} heading={group}>
              {hits.map((hit) => (
                <CommandItem key={hit.id} value={hit.id} onSelect={() => go(hit)} className="gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{hit.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{hit.subtitle}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
