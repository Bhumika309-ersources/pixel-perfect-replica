import * as seed from "./seed";
import type {
  ActivityEntry,
  AppNotification,
  AppUser,
  GoodsReceipt,
  Item,
  PurchaseOrder,
  StockAdjustment,
  StockLevel,
  Supplier,
  SystemConfig,
  Warehouse,
} from "@/types";

export class MockApiError extends Error {
  code: string;
  constructor(message: string, code = "mock_error") {
    super(message);
    this.name = "MockApiError";
    this.code = code;
  }
}

export interface MockDb {
  suppliers: Supplier[];
  warehouses: Warehouse[];
  items: Item[];
  stockLevels: StockLevel[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  stockAdjustments: StockAdjustment[];
  users: AppUser[];
  notifications: AppNotification[];
  activityLog: ActivityEntry[];
  config: SystemConfig;
  session: { userName: string };
}

function buildDb(): MockDb {
  return {
    suppliers: structuredClone(seed.suppliers),
    warehouses: structuredClone(seed.warehouses),
    items: structuredClone(seed.items),
    stockLevels: structuredClone(seed.stockLevels),
    purchaseOrders: structuredClone(seed.purchaseOrders),
    goodsReceipts: structuredClone(seed.goodsReceipts),
    stockAdjustments: structuredClone(seed.stockAdjustments),
    users: structuredClone(seed.users),
    notifications: structuredClone(seed.notifications),
    activityLog: structuredClone(seed.activityLog),
    config: structuredClone(seed.defaultSystemConfig),
    session: { userName: "Marcus Boyd" },
  };
}

let db: MockDb = buildDb();

const STORAGE_KEY = "supplyflow.mock.config.v1";

function readPersistedConfig(): Partial<SystemConfig> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SystemConfig>) : {};
  } catch {
    return {};
  }
}

function persistConfig() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ baseDelayMs: db.config.baseDelayMs, errorRate: db.config.errorRate }),
    );
  } catch {
    // storage unavailable — config stays in memory
  }
}

// Apply persisted latency/chaos settings on boot so the demo keeps its tuning.
Object.assign(db.config, readPersistedConfig());

export function getDb(): MockDb {
  return db;
}

export function resetDb() {
  db = buildDb();
  Object.assign(db.config, readPersistedConfig());
}

export function getConfig(): SystemConfig {
  return db.config;
}

export function updateConfig(patch: Partial<SystemConfig>) {
  Object.assign(db.config, patch);
  persistConfig();
}

export function setSessionUser(userName: string) {
  db.session.userName = userName;
}

export function getSessionUser(): string {
  return db.session.userName;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulated network latency around the configured base delay. */
export async function latency() {
  const jitter = 0.65 + Math.random() * 0.7;
  await sleep(Math.max(80, Math.round(db.config.baseDelayMs * jitter)));
}

/** Fails a request with the configured probability — the "chaos" dial. */
export function maybeFail() {
  if (db.config.errorRate > 0 && Math.random() < db.config.errorRate) {
    throw new MockApiError(
      "The mock service simulated a failure for this request. Retry the action.",
      "simulated_failure",
    );
  }
}

let poSeq = 4114;
let grnSeq = 8209;
let adjSeq = 3107;
let idSeq = 100;

export const counters = {
  nextPoNumber: () => `PO-${++poSeq}`,
  nextGrnNumber: () => `GRN-${++grnSeq}`,
  nextAdjNumber: () => `ADJ-${++adjSeq}`,
  nextId: (prefix: string) => `${prefix}-${++idSeq}`,
};

export function nowIso() {
  return new Date().toISOString();
}

export function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

/* ---- stock helpers ---- */

export function getStock(itemId: string, warehouseId: string): StockLevel | undefined {
  return db.stockLevels.find((s) => s.itemId === itemId && s.warehouseId === warehouseId);
}

export function totalStock(itemId: string): number {
  return db.stockLevels
    .filter((s) => s.itemId === itemId)
    .reduce((sum, s) => sum + s.quantity, 0);
}

export function setStock(itemId: string, warehouseId: string, quantity: number) {
  const level = getStock(itemId, warehouseId);
  if (level) {
    level.quantity = quantity;
  } else {
    db.stockLevels.push({ itemId, warehouseId, quantity });
  }
}

export function addStock(itemId: string, warehouseId: string, delta: number) {
  const current = getStock(itemId, warehouseId)?.quantity ?? 0;
  setStock(itemId, warehouseId, current + delta);
  return current + delta;
}

/* ---- audit helpers ---- */

export function logActivity(
  action: string,
  entity: string,
  entityRef: string | null,
  detail: string,
  severity: ActivityEntry["severity"] = "info",
) {
  db.activityLog.unshift({
    id: counters.nextId("act"),
    occurredAt: nowIso(),
    actor: db.session.userName,
    action,
    entity,
    entityRef,
    detail,
    severity,
  });
}

export function pushNotification(
  title: string,
  body: string,
  type: AppNotification["type"],
  href: string | null,
) {
  db.notifications.unshift({
    id: counters.nextId("ntf"),
    title,
    body,
    type,
    read: false,
    createdAt: nowIso(),
    href,
  });
}

export type { PurchaseOrder, GoodsReceipt, StockAdjustment };
