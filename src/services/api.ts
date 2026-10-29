import type {
  ActivityEntry,
  AdjustmentReason,
  AppNotification,
  AppUser,
  DashboardSummary,
  GoodsReceipt,
  Item,
  POLine,
  PurchaseOrder,
  Role,
  Supplier,
  SupplierPerformance,
  SystemConfig,
  Warehouse,
} from "@/types";
import { poTotals } from "@/lib/format";
import {
  MockApiError,
  addStock,
  counters,
  daysAgoIso,
  getDb,
  getStock,
  latency,
  logActivity,
  maybeFail,
  nowIso,
  pushNotification,
  resetDb,
  setSessionUser,
  setStock,
  totalStock,
  updateConfig,
} from "./mock/db";

const db = () => getDb();

/* ---------------- suppliers ---------------- */

export interface SupplierInput {
  name: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  status: Supplier["status"];
  rating: number;
  notes: string;
}

export async function listSuppliers(): Promise<Supplier[]> {
  await latency();
  maybeFail();
  return structuredClone(db().suppliers);
}

export async function getSupplier(id: string): Promise<Supplier> {
  await latency();
  maybeFail();
  const supplier = db().suppliers.find((s) => s.id === id);
  if (!supplier) throw new MockApiError(`Supplier ${id} not found`, "not_found");
  return structuredClone(supplier);
}

function nextSupplierCode() {
  const max = Math.max(...db().suppliers.map((s) => Number(s.code.replace("SUP-", ""))));
  return `SUP-${max + 1}`;
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  await latency();
  maybeFail();
  if (!input.name.trim()) throw new MockApiError("Supplier name is required", "validation");
  const supplier: Supplier = {
    id: counters.nextId("sup"),
    code: nextSupplierCode(),
    ...input,
    rating: Math.min(5, Math.max(1, input.rating)),
    onTimeRate: 0.9,
    qualityRate: 0.95,
    createdAt: nowIso(),
  };
  db().suppliers.unshift(supplier);
  logActivity("registered", "supplier", supplier.code, `${supplier.name} (${supplier.city}, ${supplier.country})`, "success");
  pushNotification("New supplier registered", `${supplier.name} was added to the supplier directory.`, "info", `/suppliers/${supplier.id}`);
  return structuredClone(supplier);
}

export async function updateSupplier(id: string, input: SupplierInput): Promise<Supplier> {
  await latency();
  maybeFail();
  const supplier = db().suppliers.find((s) => s.id === id);
  if (!supplier) throw new MockApiError(`Supplier ${id} not found`, "not_found");
  Object.assign(supplier, input, { rating: Math.min(5, Math.max(1, input.rating)) });
  logActivity("updated", "supplier", supplier.code, `${supplier.name} profile updated`, "info");
  return structuredClone(supplier);
}

/* ---------------- items / warehouses / stock ---------------- */

export async function listItems(): Promise<Item[]> {
  await latency();
  maybeFail();
  return structuredClone(db().items);
}

export async function listWarehouses(): Promise<Warehouse[]> {
  await latency();
  maybeFail();
  return structuredClone(db().warehouses);
}

export async function getItem(id: string): Promise<Item> {
  await latency();
  maybeFail();
  const item = db().items.find((i) => i.id === id);
  if (!item) throw new MockApiError(`Item ${id} not found`, "not_found");
  return structuredClone(item);
}

export async function getStockByItem(): Promise<Record<string, number>> {
  await latency();
  maybeFail();
  const result: Record<string, number> = {};
  for (const item of db().items) result[item.id] = totalStock(item.id);
  return result;
}

/* ---------------- purchase orders ---------------- */

export interface POFormLine {
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface POFormInput {
  supplierId: string;
  expectedDate: string;
  notes: string;
  lines: POFormLine[];
}

function applyPoLines(po: PurchaseOrder, input: POFormInput) {
  po.lines = input.lines.map((l, i) => {
    const existing = po.lines.find((old) => old.itemId === l.itemId);
    return {
      id: existing?.id ?? counters.nextId("pol"),
      itemId: l.itemId,
      quantity: l.quantity,
      receivedQty: 0,
      unitPrice: l.unitPrice,
      taxRate: l.taxRate,
    } satisfies POLine;
  });
}

export async function listPurchaseOrders(status?: PurchaseOrder["status"]): Promise<PurchaseOrder[]> {
  await latency();
  maybeFail();
  const all = structuredClone(db().purchaseOrders);
  const sorted = all.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  return status ? sorted.filter((p) => p.status === status) : sorted;
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  await latency();
  maybeFail();
  const po = db().purchaseOrders.find((p) => p.id === id);
  if (!po) throw new MockApiError(`Purchase order ${id} not found`, "not_found");
  return structuredClone(po);
}

export async function createPurchaseOrder(input: POFormInput): Promise<PurchaseOrder> {
  await latency();
  maybeFail();
  if (!input.supplierId) throw new MockApiError("Choose a supplier", "validation");
  if (input.lines.length === 0) throw new MockApiError("Add at least one line item", "validation");
  if (input.lines.some((l) => l.quantity <= 0)) throw new MockApiError("Line quantities must be positive", "validation");
  const po: PurchaseOrder = {
    id: counters.nextId("po"),
    number: counters.nextPoNumber(),
    supplierId: input.supplierId,
    status: "draft",
    orderDate: nowIso(),
    expectedDate: input.expectedDate || new Date(Date.now() + 14 * 86400000).toISOString(),
    currency: "USD",
    lines: [],
    notes: input.notes,
    createdBy: db().session.userName,
    submittedAt: null,
    decidedAt: null,
    decidedBy: null,
    decisionNote: null,
  };
  applyPoLines(po, input);
  db().purchaseOrders.unshift(po);
  logActivity("created", "purchase order", po.number, `Draft with ${po.lines.length} line(s)`, "info");
  return structuredClone(po);
}

export async function updatePurchaseOrder(id: string, input: POFormInput): Promise<PurchaseOrder> {
  await latency();
  maybeFail();
  const po = db().purchaseOrders.find((p) => p.id === id);
  if (!po) throw new MockApiError(`Purchase order ${id} not found`, "not_found");
  if (!["draft", "rejected"].includes(po.status)) {
    throw new MockApiError("Only draft or rejected orders can be edited", "invalid_state");
  }
  if (input.lines.length === 0) throw new MockApiError("Add at least one line item", "validation");
  po.supplierId = input.supplierId;
  po.expectedDate = input.expectedDate || po.expectedDate;
  po.notes = input.notes;
  applyPoLines(po, input);
  logActivity("updated", "purchase order", po.number, "Draft revised", "info");
  return structuredClone(po);
}

export async function submitPurchaseOrder(id: string): Promise<PurchaseOrder> {
  await latency();
  maybeFail();
  const po = db().purchaseOrders.find((p) => p.id === id);
  if (!po) throw new MockApiError(`Purchase order ${id} not found`, "not_found");
  if (!["draft", "rejected"].includes(po.status)) {
    throw new MockApiError("Only draft or rejected orders can be submitted", "invalid_state");
  }
  po.status = "submitted";
  po.submittedAt = nowIso();
  po.decidedAt = null;
  po.decidedBy = null;
  po.decisionNote = null;
  const { total } = poTotals(po);
  logActivity("submitted", "purchase order", po.number, `Sent for approval ($${total.toFixed(0)})`, "info");
  pushNotification(
    `${po.number} awaits approval`,
    `${db().session.userName} submitted ${po.number} worth $${total.toFixed(0)}.`,
    "warning",
    "/purchase-orders/approvals",
  );
  return structuredClone(po);
}

export async function decidePurchaseOrder(
  id: string,
  decision: "approve" | "reject",
  note: string,
): Promise<PurchaseOrder> {
  await latency();
  maybeFail();
  const po = db().purchaseOrders.find((p) => p.id === id);
  if (!po) throw new MockApiError(`Purchase order ${id} not found`, "not_found");
  if (po.status !== "submitted") {
    throw new MockApiError("Only submitted orders can be decided", "invalid_state");
  }
  if (decision === "reject" && !note.trim()) {
    throw new MockApiError("A rejection needs a reason", "validation");
  }
  po.status = decision === "approve" ? "approved" : "rejected";
  po.decidedAt = nowIso();
  po.decidedBy = db().session.userName;
  po.decisionNote = note.trim() || null;
  logActivity(
    decision === "approve" ? "approved" : "rejected",
    "purchase order",
    po.number,
    note.trim() || (decision === "approve" ? "Approved without note" : "Rejected"),
    decision === "approve" ? "success" : "warning",
  );
  pushNotification(
    decision === "approve" ? `${po.number} approved` : `${po.number} rejected`,
    `${db().session.userName} ${decision === "approve" ? "approved" : "rejected"} ${po.number}${note.trim() ? ` — ${note.trim()}` : ""}.`,
    decision === "approve" ? "success" : "error",
    `/purchase-orders/${po.id}`,
  );
  return structuredClone(po);
}

/* ---------------- goods receipts ---------------- */

export interface ReceiptFormLine {
  poLineId: string;
  itemId: string;
  quantityReceived: number;
  quantityRejected: number;
  batchRef: string;
}

export interface ReceiptFormInput {
  poId: string;
  warehouseId: string;
  receivedDate: string;
  notes: string;
  lines: ReceiptFormLine[];
}

export async function listGoodsReceipts(): Promise<GoodsReceipt[]> {
  await latency();
  maybeFail();
  return structuredClone(db().goodsReceipts).sort((a, b) => b.receivedDate.localeCompare(a.receivedDate));
}

export async function getGoodsReceipt(id: string): Promise<GoodsReceipt> {
  await latency();
  maybeFail();
  const grn = db().goodsReceipts.find((g) => g.id === id);
  if (!grn) throw new MockApiError(`Goods receipt ${id} not found`, "not_found");
  return structuredClone(grn);
}

export async function createGoodsReceipt(input: ReceiptFormInput): Promise<GoodsReceipt> {
  await latency();
  maybeFail();
  const po = db().purchaseOrders.find((p) => p.id === input.poId);
  if (!po) throw new MockApiError("Pick a purchase order to receive against", "validation");
  if (!["approved", "partial"].includes(po.status)) {
    throw new MockApiError("Receipts can only be booked against approved orders", "invalid_state");
  }
  if (!input.warehouseId) throw new MockApiError("Choose a receiving warehouse", "validation");
  if (input.lines.length === 0) throw new MockApiError("Receive at least one line", "validation");

  const lines = input.lines.map((l) => {
    const poLine = po.lines.find((pl) => pl.id === l.poLineId);
    if (!poLine) throw new MockApiError("Receipt line does not match the order", "validation");
    const remaining = poLine.quantity - poLine.receivedQty;
    if (l.quantityReceived <= 0 && l.quantityRejected <= 0) {
      throw new MockApiError("Enter a received or rejected quantity for every line", "validation");
    }
    if (l.quantityReceived > remaining) {
      throw new MockApiError(`Cannot receive more than the remaining ${remaining} on ${po.number}`, "validation");
    }
    if (l.quantityRejected < 0 || l.quantityRejected + l.quantityReceived > remaining) {
      throw new MockApiError("Rejected quantity exceeds the outstanding quantity", "validation");
    }
    poLine.receivedQty += l.quantityReceived;
    return {
      poLineId: l.poLineId,
      itemId: l.itemId,
      quantityOrdered: poLine.quantity,
      quantityReceived: l.quantityReceived,
      quantityRejected: l.quantityRejected,
      batchRef: l.batchRef,
    };
  });

  // Accepted goods go into stock; rejected units do not.
  for (const line of lines) {
    const net = line.quantityReceived - line.quantityRejected;
    if (net > 0) {
      addStock(line.itemId, input.warehouseId, net);
      const item = db().items.find((i) => i.id === line.itemId);
      if (item && totalStock(line.itemId) <= item.reorderPoint) {
        pushNotification(
          `Low stock: ${item.name}`,
          `On-hand total (${totalStock(line.itemId)}) is at or below the reorder point (${item.reorderPoint}).`,
          "warning",
          `/inventory/${item.id}`,
        );
      }
    }
  }

  const fullyReceived = po.lines.every((l) => l.receivedQty >= l.quantity);
  po.status = fullyReceived ? "received" : "partial";

  const grn: GoodsReceipt = {
    id: counters.nextId("grn"),
    number: counters.nextGrnNumber(),
    poId: po.id,
    supplierId: po.supplierId,
    warehouseId: input.warehouseId,
    receivedDate: input.receivedDate || nowIso(),
    receivedBy: db().session.userName,
    status: "posted",
    lines,
    notes: input.notes,
  };
  db().goodsReceipts.unshift(grn);
  logActivity(
    "posted goods receipt",
    "goods receipt",
    grn.number,
    `${po.number} — ${lines.reduce((s, l) => s + l.quantityReceived, 0)} unit(s) into ${db().warehouses.find((w) => w.id === input.warehouseId)?.code ?? ""}`,
    "success",
  );
  pushNotification(
    `${grn.number} posted`,
    `${lines.length} line(s) received against ${po.number}${po.status === "partial" ? " (partial)" : " — order complete"}.`,
    "info",
    `/goods-receipts/${grn.id}`,
  );
  return structuredClone(grn);
}

/* ---------------- stock adjustments ---------------- */

export interface AdjustmentInput {
  itemId: string;
  warehouseId: string;
  delta: number;
  reason: AdjustmentReason;
  notes: string;
}

export async function listAdjustments(): Promise<StockAdjustment[]> {
  await latency();
  maybeFail();
  return structuredClone(db().stockAdjustments).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export async function createAdjustment(input: AdjustmentInput): Promise<StockAdjustment> {
  await latency();
  maybeFail();
  if (!input.itemId || !input.warehouseId) throw new MockApiError("Pick an item and a warehouse", "validation");
  if (input.delta === 0) throw new MockApiError("Adjustment cannot be zero", "validation");
  const current = getStock(input.itemId, input.warehouseId)?.quantity ?? 0;
  if (current + input.delta < 0) {
    throw new MockApiError(`Only ${current} unit(s) on hand in that warehouse`, "validation");
  }
  const resultingQty = addStock(input.itemId, input.warehouseId, input.delta);
  const item = db().items.find((i) => i.id === input.itemId)!;
  const adjustment: StockAdjustment = {
    id: counters.nextId("adj"),
    number: counters.nextAdjNumber(),
    itemId: input.itemId,
    warehouseId: input.warehouseId,
    delta: input.delta,
    reason: input.reason,
    occurredAt: nowIso(),
    by: db().session.userName,
    notes: input.notes,
    resultingQty,
  };
  db().stockAdjustments.unshift(adjustment);
  logActivity(
    "adjusted stock",
    "stock",
    adjustment.number,
    `${input.delta > 0 ? "+" : ""}${input.delta} ${item.name} (${input.reason.replace("-", " ")})`,
    input.delta < 0 ? "warning" : "success",
  );
  return structuredClone(adjustment);
}

/* ---------------- users ---------------- */

export async function listUsers(): Promise<AppUser[]> {
  await latency();
  maybeFail();
  return structuredClone(db().users);
}

export async function updateUserRole(id: string, role: Role, status: AppUser["status"]): Promise<AppUser> {
  await latency();
  maybeFail();
  const user = db().users.find((u) => u.id === id);
  if (!user) throw new MockApiError("User not found", "not_found");
  user.role = role;
  user.status = status;
  logActivity("updated", "user", user.name, `Role set to ${role}, status ${status}`, "info");
  return structuredClone(user);
}

export async function inviteUser(input: { name: string; email: string; role: Role }): Promise<AppUser> {
  await latency();
  maybeFail();
  if (!input.email.includes("@")) throw new MockApiError("Enter a valid email", "validation");
  const user: AppUser = {
    id: counters.nextId("usr"),
    name: input.name,
    email: input.email,
    role: input.role,
    status: "invited",
    lastActiveAt: nowIso(),
    title: "Invited user",
  };
  db().users.unshift(user);
  logActivity("invited", "user", user.name, `${user.email} as ${user.role}`, "info");
  return structuredClone(user);
}

/* ---------------- notifications ---------------- */

export async function listNotifications(): Promise<AppNotification[]> {
  await latency();
  maybeFail();
  return structuredClone(db().notifications).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markNotificationRead(id: string): Promise<AppNotification[]> {
  await latency();
  maybeFail();
  const ntf = db().notifications.find((n) => n.id === id);
  if (ntf) ntf.read = true;
  return structuredClone(db().notifications);
}

export async function markAllNotificationsRead(): Promise<AppNotification[]> {
  await latency();
  maybeFail();
  db().notifications.forEach((n) => (n.read = true));
  return structuredClone(db().notifications);
}

/* ---------------- activity ---------------- */

export async function listActivity(): Promise<ActivityEntry[]> {
  await latency();
  maybeFail();
  return structuredClone(db().activityLog).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

/* ---------------- reports ---------------- */

export async function getSupplierPerformance(): Promise<SupplierPerformance[]> {
  await latency();
  maybeFail();
  return db().suppliers.map((supplier) => {
    const orders = db().purchaseOrders.filter((p) => p.supplierId === supplier.id);
    const spend = orders.reduce((sum, p) => sum + poTotals(p).total, 0);
    const rejectedLines = orders.reduce(
      (sum, p) => sum + db().goodsReceipts.filter((g) => g.poId === p.id).length,
      0,
    );
    const monthly = new Map<string, number>();
    for (let m = 5; m >= 0; m--) {
      const d = new Date();
      d.setMonth(d.getMonth() - m, 1);
      monthly.set(d.toLocaleDateString("en-US", { month: "short" }), 0);
    }
    orders.forEach((p) => {
      const key = new Date(p.orderDate).toLocaleDateString("en-US", { month: "short" });
      if (monthly.has(key)) monthly.set(key, (monthly.get(key) ?? 0) + poTotals(p).total);
    });
    return {
      supplier,
      orderCount: orders.length,
      totalSpend: spend,
      onTimeRate: supplier.onTimeRate,
      qualityRate: supplier.qualityRate,
      avgLeadDays: Math.round(6 + (1 - supplier.onTimeRate) * 30),
      rejectedLines,
      trend: [...monthly.entries()].map(([month, value]) => ({ month, spend: value })),
    };
  });
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await latency();
  maybeFail();
  const d = db();
  const openPos = d.purchaseOrders.filter((p) => ["approved", "partial", "submitted"].includes(p.status));
  const openPoValue = openPos.reduce((sum, p) => sum + poTotals(p).total, 0);
  const pendingApprovals = d.purchaseOrders.filter((p) => p.status === "submitted");
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const receiptsThisMonth = d.goodsReceipts.filter((g) => new Date(g.receivedDate) >= monthStart).length;

  const inventoryValue = d.stockLevels.reduce((sum, level) => {
    const item = d.items.find((i) => i.id === level.itemId);
    return sum + (item ? item.unitCost * level.quantity : 0);
  }, 0);

  const lowStockItems = d.items
    .map((item) => ({ item, totalQty: totalStock(item.id), reorderPoint: item.reorderPoint }))
    .filter((x) => x.totalQty <= x.reorderPoint * 1.1)
    .sort((a, b) => a.totalQty / a.reorderPoint - b.totalQty / b.reorderPoint)
    .slice(0, 6);

  const spendByMonth: DashboardSummary["spendByMonth"] = [];
  for (let m = 5; m >= 0; m--) {
    const date = new Date();
    date.setMonth(date.getMonth() - m, 1);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const spend = d.purchaseOrders
      .filter((p) => {
        const od = new Date(p.orderDate);
        return od.getMonth() === date.getMonth() && od.getFullYear() === date.getFullYear();
      })
      .reduce((sum, p) => sum + poTotals(p).total, 0);
    spendByMonth.push({ month, spend: Math.round(spend) });
  }

  const categoryMap = new Map<string, number>();
  d.purchaseOrders.forEach((po) => {
    po.lines.forEach((line) => {
      const item = d.items.find((i) => i.id === line.itemId);
      if (!item) return;
      const value = line.quantity * line.unitPrice;
      categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + value);
    });
  });
  const spendByCategory = [...categoryMap.entries()]
    .map(([category, value]) => ({ category, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);

  const supplierSpend = new Map<string, { spend: number; orders: number }>();
  d.purchaseOrders.forEach((po) => {
    const entry = supplierSpend.get(po.supplierId) ?? { spend: 0, orders: 0 };
    entry.spend += poTotals(po).total;
    entry.orders += 1;
    supplierSpend.set(po.supplierId, entry);
  });
  const topSuppliers = [...supplierSpend.entries()]
    .map(([supplierId, v]) => ({
      supplierId,
      name: d.suppliers.find((s) => s.id === supplierId)?.name ?? supplierId,
      spend: Math.round(v.spend),
      orders: v.orders,
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  return {
    openPoCount: openPos.length,
    openPoValue,
    pendingApprovals: pendingApprovals.length,
    receiptsThisMonth,
    inventoryValue,
    lowStockItems,
    spendByMonth,
    spendByCategory,
    recentActivity: structuredClone(d.activityLog).slice(0, 8),
    topSuppliers,
  };
}

/* ---------------- settings / system ---------------- */

export async function getSystemConfig(): Promise<SystemConfig> {
  await latency();
  maybeFail();
  return structuredClone(db().config);
}

export async function saveSystemConfig(patch: Partial<SystemConfig>): Promise<SystemConfig> {
  await latency();
  maybeFail();
  updateConfig(patch);
  logActivity("updated", "system settings", null, JSON.stringify(patch));
  return structuredClone(db().config);
}

export async function resetDemoData(): Promise<boolean> {
  await latency();
  maybeFail();
  resetDb();
  return true;
}

export async function updateProfile(input: { name: string; email: string; title: string }): Promise<AppUser> {
  await latency();
  maybeFail();
  const user = db().users.find((u) => u.name === db().session.userName);
  const updated: AppUser = user
    ? Object.assign(user, input)
    : {
        id: counters.nextId("usr"),
        name: input.name,
        email: input.email,
        role: "admin",
        status: "active",
        lastActiveAt: nowIso(),
        title: input.title,
      };
  logActivity("updated", "profile", user?.name ?? input.name, "Profile details changed", "info");
  return structuredClone(updated);
}

export async function setSessionUserApi(userName: string): Promise<void> {
  await latency();
  setSessionUser(userName);
}

export { daysAgoIso };
