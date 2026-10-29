export type Role = "admin" | "procurement" | "warehouse" | "viewer";

export type POStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "partial"
  | "received";

export type SupplierStatus = "active" | "onhold" | "blacklisted";

export interface Supplier {
  id: string;
  code: string;
  name: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  rating: number; // 1..5
  onTimeRate: number; // 0..1
  qualityRate: number; // 0..1
  status: SupplierStatus;
  createdAt: string;
  notes: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  manager: string;
  address: string;
  capacityPallets: number;
  usedPallets: number;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  reorderPoint: number;
  description: string;
  preferredSupplierId: string;
}

export interface StockLevel {
  itemId: string;
  warehouseId: string;
  quantity: number;
}

export interface POLine {
  id: string;
  itemId: string;
  quantity: number;
  receivedQty: number;
  unitPrice: number;
  taxRate: number; // percent, e.g. 18
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  status: POStatus;
  orderDate: string;
  expectedDate: string;
  currency: string;
  lines: POLine[];
  notes: string;
  createdBy: string;
  submittedAt: string | null;
  decidedAt: string | null;
  decidedBy: string | null;
  decisionNote: string | null;
}

export interface ReceiptLine {
  poLineId: string;
  itemId: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityRejected: number;
  batchRef: string;
}

export interface GoodsReceipt {
  id: string;
  number: string;
  poId: string;
  supplierId: string;
  warehouseId: string;
  receivedDate: string;
  receivedBy: string;
  status: "posted";
  lines: ReceiptLine[];
  notes: string;
}

export type AdjustmentReason =
  | "cycle-count"
  | "damage"
  | "expiry"
  | "recount"
  | "loss"
  | "found";

export interface StockAdjustment {
  id: string;
  number: string;
  itemId: string;
  warehouseId: string;
  delta: number;
  reason: AdjustmentReason;
  occurredAt: string;
  by: string;
  notes: string;
  resultingQty: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited" | "disabled";
  lastActiveAt: string;
  title: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  href: string | null;
}

export interface ActivityEntry {
  id: string;
  occurredAt: string;
  actor: string;
  action: string;
  entity: string;
  entityRef: string | null;
  detail: string;
  severity: "info" | "success" | "warning" | "error";
}

export interface SystemConfig {
  baseDelayMs: number;
  errorRate: number; // 0..1 fraction of requests that fail
  lowStockThresholdPct: number;
  company: {
    name: string;
    taxId: string;
    currency: string;
    address: string;
  };
}

export interface DashboardSummary {
  openPoCount: number;
  openPoValue: number;
  pendingApprovals: number;
  receiptsThisMonth: number;
  inventoryValue: number;
  lowStockItems: { item: Item; totalQty: number; reorderPoint: number }[];
  spendByMonth: { month: string; spend: number }[];
  spendByCategory: { category: string; value: number }[];
  recentActivity: ActivityEntry[];
  topSuppliers: { supplierId: string; name: string; spend: number; orders: number }[];
}

export interface SupplierPerformance {
  supplier: Supplier;
  orderCount: number;
  totalSpend: number;
  onTimeRate: number;
  qualityRate: number;
  avgLeadDays: number;
  rejectedLines: number;
  trend: { month: string; spend: number }[];
}
