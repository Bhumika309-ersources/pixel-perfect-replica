export const qk = {
  suppliers: ["suppliers"] as const,
  supplier: (id: string) => ["suppliers", id] as const,
  items: ["items"] as const,
  item: (id: string) => ["items", id] as const,
  stockByItem: ["stock-by-item"] as const,
  warehouses: ["warehouses"] as const,
  purchaseOrders: (status?: string) => ["purchase-orders", status ?? "all"] as const,
  purchaseOrder: (id: string) => ["purchase-orders", "detail", id] as const,
  goodsReceipts: ["goods-receipts"] as const,
  goodsReceipt: (id: string) => ["goods-receipts", id] as const,
  adjustments: ["stock-adjustments"] as const,
  users: ["users"] as const,
  notifications: ["notifications"] as const,
  activity: ["activity"] as const,
  dashboard: ["dashboard-summary"] as const,
  supplierPerformance: ["supplier-performance"] as const,
  systemConfig: ["system-config"] as const,
};

export function invalidatePurchaseOrders(qc: { invalidateQueries: (opts: { queryKey: readonly unknown[] }) => Promise<void> }) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
    qc.invalidateQueries({ queryKey: ["goods-receipts"] }),
    qc.invalidateQueries({ queryKey: ["stock-by-item"] }),
    qc.invalidateQueries({ queryKey: ["activity"] }),
    qc.invalidateQueries({ queryKey: ["notifications"] }),
    qc.invalidateQueries({ queryKey: ["dashboard-summary"] }),
  ]);
}
