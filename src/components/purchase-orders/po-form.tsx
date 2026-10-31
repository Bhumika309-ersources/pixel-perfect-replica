import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api, type POFormInput } from "@/services/api";
import { qk } from "@/services/query-keys";
import { formatCurrency } from "@/lib/format";
import { poTotals } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Item } from "@/types";

export interface POFormValues {
  supplierId: string;
  expectedDate: string;
  notes: string;
  lines: { itemId: string; quantity: number; unitPrice: number; taxRate: number }[];
}

export function PurchaseOrderForm({
  mode,
  initial,
  onSubmit,
  pageTitle,
  crumbs,
}: {
  mode: "create" | "edit";
  initial?: POFormValues;
  onSubmit: (input: POFormInput) => Promise<PurchaseOrderResponse>;
  pageTitle: string;
  crumbs: { label: string; to?: string }[];
}) {
  void crumbs;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: suppliers } = useSuspenseQuery({ queryKey: qk.suppliers, queryFn: () => api.listSuppliers() });
  const { data: items } = useSuspenseQuery({ queryKey: qk.items, queryFn: () => api.listItems() });

  const [supplierId, setSupplierId] = useState(initial?.supplierId ?? "");
  const [expectedDate, setExpectedDate] = useState(initial?.expectedDate ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [lines, setLines] = useState<POFormValues["lines"]>(
    initial?.lines?.length ? initial.lines : [{ itemId: "", quantity: 1, unitPrice: 0, taxRate: 18 }],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: (po) => {
      void queryClient.invalidateQueries({ queryKey: qk.purchaseOrders() });
      void queryClient.invalidateQueries({ queryKey: qk.dashboard });
      void queryClient.invalidateQueries({ queryKey: qk.activity });
      toast.success(mode === "create" ? `Draft ${po.number} created` : `${po.number} updated`);
      void navigate({ to: "/purchase-orders/$id", params: { id: po.id } });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const itemById = (id: string) => items.find((i) => i.id === id);
  const activeSuppliers = suppliers.filter((s) => s.status === "active");

  const setLine = (index: number, patch: Partial<POFormValues["lines"][number]>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const pickItem = (index: number, itemId: string) => {
    const item = itemById(itemId);
    setLine(index, {
      itemId,
      unitPrice: item?.unitCost ?? 0,
      taxRate: item?.category === "Raw Materials" ? 5 : 18,
    });
  };

  const addLine = () => setLines((prev) => [...prev, { itemId: "", quantity: 1, unitPrice: 0, taxRate: 18 }]);

  const validate = (): POFormInput | null => {
    const next: Record<string, string> = {};
    if (!supplierId) next.supplierId = "Choose a supplier.";
    if (lines.length === 0) next.lines = "Add at least one line item.";
    const invalid = lines.some((l) => !l.itemId || l.quantity <= 0 || l.unitPrice < 0);
    if (invalid) next.lines = "Every line needs an item, a positive quantity and a price.";
    setErrors(next);
    if (Object.keys(next).length > 0) return null;
    return {
      supplierId,
      expectedDate: expectedDate ? new Date(expectedDate).toISOString() : "",
      notes,
      lines: lines.map((l) => ({ ...l, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), taxRate: Number(l.taxRate) })),
    };
  };

  const submit = () => {
    const input = validate();
    if (input) mutation.mutate(input);
  };

  const totals = poTotals({ lines: lines.filter((l) => l.itemId).map((l) => ({ quantity: Number(l.quantity) || 0, unitPrice: Number(l.unitPrice) || 0, receivedQty: 0, taxRate: Number(l.taxRate) || 0, id: "x", itemId: "x" })) });

  return (
    <>
      <PageHeader
        title={pageTitle}
        description={mode === "create" ? "Compose the order, then submit it for approval." : "Revise this draft — changes are audited."}
        crumbs={[{ label: "Procurement" }, { label: "Purchase orders", to: "/purchase-orders" }, { label: mode === "create" ? "New" : "Edit" }]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to={mode === "create" ? "/purchase-orders" : ".."}><ArrowLeft className="h-4 w-4" /> Cancel</Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5 md:col-span-1">
            <Label className="text-xs">Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select supplier…" /></SelectTrigger>
              <SelectContent>
                {activeSuppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} · {s.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplierId && <p className="text-xs text-destructive">{errors.supplierId}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Expected delivery</Label>
            <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <Label className="text-xs">Internal notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional context for approvers" className="h-9 text-sm" />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-3 py-2.5">
            <h2 className="text-sm font-semibold">Line items</h2>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addLine}>
              <Plus className="h-3.5 w-3.5" /> Add line
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="h-8 text-[11px] uppercase text-muted-foreground">Item</TableHead>
                <TableHead className="h-8 w-24 text-[11px] uppercase text-muted-foreground">Qty</TableHead>
                <TableHead className="h-8 w-28 text-[11px] uppercase text-muted-foreground">Unit price</TableHead>
                <TableHead className="h-8 w-20 text-[11px] uppercase text-muted-foreground">Tax %</TableHead>
                <TableHead className="h-8 w-28 text-right text-[11px] uppercase text-muted-foreground">Line total</TableHead>
                <TableHead className="h-8 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => {
                const item = itemById(line.itemId);
                const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0) * (1 + (Number(line.taxRate) || 0) / 100);
                return (
                  <TableRow key={index} className="hover:bg-transparent">
                    <TableCell className="min-w-64">
                      <Select value={line.itemId} onValueChange={(v) => pickItem(index, v)}>
                        <SelectTrigger className="h-8 w-full text-xs"><SelectValue placeholder="Select item…" /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {items.map((i: Item) => (
                            <SelectItem key={i.id} value={i.id}>{i.sku} — {i.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {item && <p className="mt-1 text-[10px] text-muted-foreground">{item.category} · unit: {item.unit}</p>}
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={1} value={line.quantity} onChange={(e) => setLine(index, { quantity: Number(e.target.value) })} className="h-8 text-xs tabular" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} step="0.01" value={line.unitPrice} onChange={(e) => setLine(index, { unitPrice: Number(e.target.value) })} className="h-8 text-xs tabular" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} max={100} value={line.taxRate} onChange={(e) => setLine(index, { taxRate: Number(e.target.value) })} className="h-8 text-xs tabular" />
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular">{formatCurrency(lineTotal)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                        aria-label="Remove line"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {errors.lines && <p className="border-t px-3 py-2 text-xs text-destructive">{errors.lines}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">Subtotal</p>
              <p className="font-medium tabular">{formatCurrency(totals.subtotal)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">Tax</p>
              <p className="font-medium tabular">{formatCurrency(totals.tax)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">Total</p>
              <p className="font-display text-lg font-semibold tabular">{formatCurrency(totals.total)}</p>
            </div>
          </div>
          <Button onClick={submit} disabled={mutation.isPending} className="min-w-40">
            {mutation.isPending ? "Saving…" : mode === "create" ? "Create draft order" : "Save changes"}
          </Button>
        </div>
      </div>
    </>
  );
}

type PurchaseOrderResponse = Awaited<ReturnType<typeof api.createPurchaseOrder>>;
