import type { Role } from "@/types";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  procurement: "Procurement",
  warehouse: "Warehouse Ops",
  viewer: "Viewer",
};

export type Capability =
  | "po.create"
  | "po.edit"
  | "po.submit"
  | "po.decide"
  | "receipt.create"
  | "supplier.manage"
  | "inventory.adjust"
  | "users.manage"
  | "settings.manage";

const MATRIX: Record<Role, Capability[]> = {
  admin: [
    "po.create", "po.edit", "po.submit", "po.decide",
    "receipt.create", "supplier.manage", "inventory.adjust",
    "users.manage", "settings.manage",
  ],
  procurement: ["po.create", "po.edit", "po.submit", "supplier.manage"],
  warehouse: ["receipt.create", "inventory.adjust"],
  viewer: [],
};

export function roleCan(role: Role, capability: Capability): boolean {
  return MATRIX[role].includes(capability);
}
