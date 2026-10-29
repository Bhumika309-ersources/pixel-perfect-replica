import type {
  ActivityEntry,
  AppNotification,
  AppUser,
  GoodsReceipt,
  Item,
  POLine,
  PurchaseOrder,
  StockAdjustment,
  StockLevel,
  Supplier,
  SystemConfig,
  Warehouse,
} from "@/types";

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;
const dayOffset = (days: number, hour = 10, minute = 30) =>
  new Date(now + days * DAY).setHours(hour, minute, 0, 0);

let seq = 0;
export const nextId = (prefix: string) => `${prefix}-${(++seq).toString(36)}`;

export const suppliers: Supplier[] = [
  {
    id: "sup-1", code: "SUP-1001", name: "Meridian Industrial Supply", category: "Fasteners",
    contactName: "Dana Whitfield", email: "dana@meridianind.example.com", phone: "+1 415 555 0142",
    address: "2200 Harbor Way, Bldg C", city: "Oakland", country: "USA", taxId: "US-84-2910347",
    rating: 4.6, onTimeRate: 0.96, qualityRate: 0.99, status: "active",
    createdAt: dayOffset(-420), notes: "Primary fastener partner. Net-30 terms.",
  },
  {
    id: "sup-2", code: "SUP-1002", name: "Koblenz Elektrotechnik", category: "Electrical",
    contactName: "Jonas Reiter", email: "j.reiter@koblenz-et.example.de", phone: "+49 221 555 0188",
    address: "Industriestrasse 44", city: "Cologne", country: "Germany", taxId: "DE-812399455",
    rating: 4.8, onTimeRate: 0.92, qualityRate: 0.98, status: "active",
    createdAt: dayOffset(-380), notes: "Cabinets, breakers, harnesses. Ships DHL Air.",
  },
  {
    id: "sup-3", code: "SUP-1003", name: "Pacific Corrugated Co.", category: "Packaging",
    contactName: "Marisol Vega", email: "mvega@pacificcorr.example.com", phone: "+1 562 555 0110",
    address: "9801 Alameda St", city: "Los Angeles", country: "USA", taxId: "US-33-0982112",
    rating: 4.1, onTimeRate: 0.88, qualityRate: 0.95, status: "active",
    createdAt: dayOffset(-640), notes: "Double-wall cartons, pallet wrap.",
  },
  {
    id: "sup-4", code: "SUP-1004", name: "Hexan Precision Tools", category: "Tools",
    contactName: "Priya Nair", email: "priya@hexantools.example.com", phone: "+91 80 5550 2231",
    address: "Plot 14, Peenya Industrial Area", city: "Bangalore", country: "India", taxId: "IN-29ABCDE1234F1Z5",
    rating: 4.4, onTimeRate: 0.9, qualityRate: 0.97, status: "active",
    createdAt: dayOffset(-300), notes: "Calibrated tooling, 4-week lead time typical.",
  },
  {
    id: "sup-5", code: "SUP-1005", name: "Atlas Polymer Group", category: "Raw Materials",
    contactName: "Chuck McAllister", email: "cmca@atlaspolymer.example.com", phone: "+1 281 555 0177",
    address: "1750 Bayport Blvd", city: "Houston", country: "USA", taxId: "US-76-5510298",
    rating: 3.9, onTimeRate: 0.81, qualityRate: 0.93, status: "active",
    createdAt: dayOffset(-510), notes: "Resins and compounds. Watch lead times in Q4.",
  },
  {
    id: "sup-6", code: "SUP-1006", name: "Sentinel Safety Products", category: "Safety Gear",
    contactName: "Amara Diallo", email: "amara@sentinelsafety.example.com", phone: "+44 20 5550 9931",
    address: "12 Coronation Wharf", city: "London", country: "UK", taxId: "GB-339281755",
    rating: 4.5, onTimeRate: 0.94, qualityRate: 0.98, status: "active",
    createdAt: dayOffset(-220), notes: "PPE program vendor. Annual contract in place.",
  },
  {
    id: "sup-7", code: "SUP-1007", name: "Vantage Hydraulics", category: "Hydraulics",
    contactName: "Lorenzo Bianchi", email: "l.bianchi@vantagehyd.example.it", phone: "+39 02 5550 4402",
    address: "Via Turati 18", city: "Milan", country: "Italy", taxId: "IT-09182345667",
    rating: 4.2, onTimeRate: 0.87, qualityRate: 0.96, status: "active",
    createdAt: dayOffset(-190), notes: "Cylinders, hoses, quick couplers.",
  },
  {
    id: "sup-8", code: "SUP-1008", name: "Circuitry Northwest", category: "Electronics",
    contactName: "Felix Hoang", email: "felix@circuitrynw.example.com", phone: "+1 503 555 0126",
    address: "4445 SE Industrial Way", city: "Portland", country: "USA", taxId: "US-93-2218845",
    rating: 4.7, onTimeRate: 0.95, qualityRate: 0.99, status: "active",
    createdAt: dayOffset(-350), notes: "Boards, sensors, controllers. ESD packaging required.",
  },
  {
    id: "sup-9", code: "SUP-1009", name: "Redline Bearings Ltd.", category: "Tools",
    contactName: "Gunnar Sjöberg", email: "gs@redlinebrg.example.se", phone: "+46 8 5550 7712",
    address: "Storängsvägen 19", city: "Stockholm", country: "Sweden", taxId: "SE-5567891122",
    rating: 3.2, onTimeRate: 0.68, qualityRate: 0.9, status: "onhold",
    createdAt: dayOffset(-270), notes: "On hold after two late deliveries in May. Review in Q3.",
  },
  {
    id: "sup-10", code: "SUP-1010", name: "Grandview Logistics Supply", category: "Packaging",
    contactName: "Tanya Brooks", email: "tbrooks@grandviewls.example.com", phone: "+1 312 555 0159",
    address: "560 W Pershing Rd", city: "Chicago", country: "USA", taxId: "US-41-7720344",
    rating: 2.6, onTimeRate: 0.55, qualityRate: 0.82, status: "blacklisted",
    createdAt: dayOffset(-700), notes: "Blacklisted after failed audit. No new orders.",
  },
];

export const warehouses: Warehouse[] = [
  {
    id: "wh-1", code: "WH-ATL", name: "Atlanta Distribution Center", city: "Atlanta", country: "USA",
    manager: "Rosa Jimenez", address: "1400 Fulmont Cir", capacityPallets: 4200, usedPallets: 3110,
  },
  {
    id: "wh-2", code: "WH-DFW", name: "Dallas Fulfillment Hub", city: "Dallas", country: "USA",
    manager: "Curtis Lang", address: "9020 Solar Ln", capacityPallets: 3100, usedPallets: 1875,
  },
  {
    id: "wh-3", code: "WH-EIN", name: "Rotterdam European Depot", city: "Rotterdam", country: "Netherlands",
    manager: "Eva Vermeer", address: "Waalhaven Z.Z. 21", capacityPallets: 2600, usedPallets: 1420,
  },
  {
    id: "wh-4", code: "WH-SIN", name: "Singapore Transit Store", city: "Singapore", country: "Singapore",
    manager: "Wei Lim", address: "8 Changi South St", capacityPallets: 1500, usedPallets: 968,
  },
];

const itemSeed: Array<[string, string, string, string, number, number, string, string]> = [
  ["ELC-1001", "Hex Bolt M10x50 Zinc", "Fasteners", "box", 28.4, 120, "Grade 8.8, 100 pcs per box", "sup-1"],
  ["ELC-1002", "Hex Nut M10 Zinc", "Fasteners", "box", 14.2, 200, "Din 934, 250 pcs per box", "sup-1"],
  ["ELC-1003", "Flat Washer M10", "Fasteners", "box", 9.8, 250, "Din 125A, 500 pcs per box", "sup-1"],
  ["ELC-2001", "LED High Bay 150W", "Electrical", "each", 118.0, 40, "IP65, 5000K, 21k lumens", "sup-2"],
  ["ELC-2002", "3-Pole Breaker 63A", "Electrical", "each", 76.5, 60, "Din rail mount, 10kA", "sup-2"],
  ["ELC-2003", "Control Cabinet 800x600", "Electrical", "each", 415.0, 12, "Sheet steel, RAL 7035", "sup-2"],
  ["ELC-2004", "Cable Gland M20 Nylon", "Electrical", "pack", 22.9, 150, "IP68, 10 pcs per pack", "sup-2"],
  ["PKG-3001", "Double-Wall Carton 400x300", "Packaging", "bundle", 34.6, 180, "20 pcs per bundle, kraft", "sup-3"],
  ["PKG-3002", "Stretch Wrap 500mm 23µ", "Packaging", "roll", 17.8, 240, "Machine grade, 1500m", "sup-3"],
  ["PKG-3003", "Euro Pallet EPAL", "Packaging", "each", 19.5, 300, "Heat treated, ISPM-15", "sup-3"],
  ["TLS-4001", "Torque Wrench 40-200Nm", "Tools", "each", 189.0, 25, "1/2in drive, calibrated", "sup-4"],
  ["TLS-4002", "Digital Caliper 150mm", "Tools", "each", 64.0, 35, "IP54, stainless", "sup-4"],
  ["TLS-4003", "Impact Socket Set 24pc", "Tools", "set", 142.0, 18, "1/2in drive, metric", "sup-4"],
  ["RAW-5001", "ABS Resin Natural 25kg", "Raw Materials", "bag", 88.0, 90, "Injection grade", "sup-5"],
  ["RAW-5002", "HDPE Pellets 25kg", "Raw Materials", "bag", 61.0, 140, "Blow molding grade", "sup-5"],
  ["RAW-5003", "Silicone Compound 20kg", "Raw Materials", "pail", 173.0, 30, "Shore A 50", "sup-5"],
  ["SAF-6001", "Safety Glasses Clear AF", "Safety Gear", "each", 8.9, 400, "Anti-fog, EN166", "sup-6"],
  ["SAF-6002", "Cut-5 Gloves L", "Safety Gear", "pair", 6.7, 500, "HPPE, PU palm", "sup-6"],
  ["SAF-6003", "Hard Hat Ratchet Vented", "Safety Gear", "each", 15.4, 200, "ANSI Z89.1", "sup-6"],
  ["SAF-6004", "Welding Apron Leather", "Safety Gear", "each", 41.0, 60, "Split cowhide", "sup-6"],
  ["HYD-7001", "Hydraulic Cylinder 63x250", "Hydraulics", "each", 528.0, 10, "Double acting, ISO 6020", "sup-7"],
  ["HYD-7002", "Hydraulic Hose 1/2in", "Hydraulics", "meter", 21.5, 220, "4SP braided", "sup-7"],
  ["HYD-7003", "Quick Coupler 1/2in BSPP", "Hydraulics", "each", 47.0, 80, "Steel, flat face", "sup-7"],
  ["ELE-8001", "PLC Controller 32DO", "Electronics", "each", 692.0, 8, "16DI/32DO, Ethernet", "sup-8"],
  ["ELE-8002", "Proximity Sensor M18 PNP", "Electronics", "each", 39.0, 90, "2m cable, stainless", "sup-8"],
  ["ELE-8003", "HMI Panel 7in Touch", "Electronics", "each", 388.0, 14, "800x480, IP66 front", "sup-8"],
];

export const items: Item[] = itemSeed.map(([sku, name, category, unit, unitCost, reorderPoint, description, preferredSupplierId], i) => ({
  id: `itm-${i + 1}`,
  sku, name, category, unit, unitCost, reorderPoint, description, preferredSupplierId,
}));

// Deterministic starting stock across warehouses.
const stockPattern: Record<string, number[]> = {
  "itm-1": [420, 180, 90, 40], "itm-2": [560, 240, 60, 0], "itm-3": [640, 310, 120, 30],
  "itm-4": [64, 22, 18, 6], "itm-5": [88, 30, 25, 0], "itm-6": [14, 6, 4, 2],
  "itm-7": [190, 80, 40, 20], "itm-8": [260, 140, 0, 60], "itm-9": [330, 190, 90, 40],
  "itm-10": [410, 150, 220, 0], "itm-11": [34, 12, 8, 4], "itm-12": [48, 20, 10, 6],
  "itm-13": [22, 9, 6, 0], "itm-14": [120, 60, 30, 0], "itm-15": [180, 90, 40, 20],
  "itm-16": [38, 14, 8, 4], "itm-17": [520, 260, 120, 80], "itm-18": [690, 320, 140, 90],
  "itm-19": [280, 130, 60, 30], "itm-20": [80, 30, 20, 10], "itm-21": [12, 4, 3, 0],
  "itm-22": [300, 140, 60, 30], "itm-23": [96, 44, 18, 8], "itm-24": [10, 3, 2, 0],
  "itm-25": [120, 55, 25, 12], "itm-26": [18, 6, 4, 2],
};

export const stockLevels: StockLevel[] = [];
for (const [itemId, qty] of Object.entries(stockPattern)) {
  qty.forEach((quantity, wi) => {
    if (quantity > 0) stockLevels.push({ itemId, warehouseId: warehouses[wi].id, quantity });
  });
}

let poSeq = 4100;
let grnSeq = 8200;
let adjSeq = 3100;
let lineSeq = 0;
const nextPoNumber = () => `PO-${++poSeq}`;
const nextGrnNumber = () => `GRN-${++grnSeq}`;
const nextAdjNumber = () => `ADJ-${++adjSeq}`;
const nextLineId = () => `pol-${++lineSeq}`;

const taxFor = (category: string) => (category === "Raw Materials" ? 5 : 18);

interface PoSpec {
  supplierId: string;
  status: PurchaseOrder["status"];
  orderDaysAgo: number;
  expectedDays: number;
  lines: Array<[sku: string, qty: number, price: number]>;
  received?: number; // fraction received
  createdBy?: string;
  decidedBy?: string;
  decisionNote?: string;
  notes?: string;
}

const poSpecs: PoSpec[] = [
  { supplierId: "sup-2", status: "received", orderDaysAgo: 62, expectedDays: 14, lines: [["ELC-2001", 30, 115.0], ["ELC-2002", 50, 74.0]], received: 1, createdBy: "Nadia Osei" },
  { supplierId: "sup-1", status: "received", orderDaysAgo: 55, expectedDays: 10, lines: [["ELC-1001", 80, 27.9]], received: 1, createdBy: "Marcus Boyd" },
  { supplierId: "sup-3", status: "received", orderDaysAgo: 48, expectedDays: 7, lines: [["PKG-3001", 120, 33.8], ["PKG-3002", 100, 17.2]], received: 1, createdBy: "Nadia Osei" },
  { supplierId: "sup-6", status: "received", orderDaysAgo: 41, expectedDays: 12, lines: [["SAF-6001", 300, 8.5], ["SAF-6002", 400, 6.4]], received: 1, createdBy: "Marcus Boyd" },
  { supplierId: "sup-8", status: "received", orderDaysAgo: 37, expectedDays: 15, lines: [["ELE-8002", 100, 37.5], ["ELE-8001", 6, 680.0]], received: 1, createdBy: "Nadia Osei" },
  { supplierId: "sup-4", status: "received", orderDaysAgo: 33, expectedDays: 28, lines: [["TLS-4001", 20, 185.0], ["TLS-4002", 30, 62.0]], received: 1, createdBy: "Priya Raman" },
  { supplierId: "sup-7", status: "received", orderDaysAgo: 29, expectedDays: 20, lines: [["HYD-7002", 200, 21.0], ["HYD-7003", 40, 45.5]], received: 1, createdBy: "Marcus Boyd" },
  { supplierId: "sup-2", status: "partial", orderDaysAgo: 24, expectedDays: 14, lines: [["ELC-2003", 10, 409.0], ["ELC-2004", 80, 22.4]], received: 0.6, createdBy: "Nadia Osei" },
  { supplierId: "sup-5", status: "partial", orderDaysAgo: 21, expectedDays: 18, lines: [["RAW-5001", 100, 85.5], ["RAW-5002", 140, 59.0]], received: 0.5, createdBy: "Priya Raman" },
  { supplierId: "sup-8", status: "approved", orderDaysAgo: 12, expectedDays: 20, lines: [["ELE-8003", 10, 381.0], ["ELE-8002", 80, 38.2]], createdBy: "Nadia Osei", decidedBy: "Marcus Boyd", decisionNote: "Approved. Budget available in Q4 capex." },
  { supplierId: "sup-1", status: "approved", orderDaysAgo: 10, expectedDays: 9, lines: [["ELC-1001", 60, 27.5], ["ELC-1002", 100, 13.9], ["ELC-1003", 120, 9.4]], createdBy: "Marcus Boyd", decidedBy: "Elena Vasquez", decisionNote: "Approved — standard replenishment." },
  { supplierId: "sup-6", status: "approved", orderDaysAgo: 8, expectedDays: 14, lines: [["SAF-6003", 150, 14.9], ["SAF-6004", 40, 40.0]], createdBy: "Priya Raman", decidedBy: "Marcus Boyd", decisionNote: "PPE replenishment approved." },
  { supplierId: "sup-3", status: "approved", orderDaysAgo: 6, expectedDays: 8, lines: [["PKG-3003", 200, 19.0], ["PKG-3002", 150, 17.4]], createdBy: "Nadia Osei", decidedBy: "Elena Vasquez", decisionNote: "Approved for Q4 volume." },
  { supplierId: "sup-4", status: "submitted", orderDaysAgo: 4, expectedDays: 30, lines: [["TLS-4003", 15, 139.0], ["TLS-4002", 25, 63.0]], createdBy: "Priya Raman" },
  { supplierId: "sup-7", status: "submitted", orderDaysAgo: 3, expectedDays: 22, lines: [["HYD-7001", 6, 520.0], ["HYD-7002", 120, 21.2]], createdBy: "Marcus Boyd" },
  { supplierId: "sup-5", status: "submitted", orderDaysAgo: 2, expectedDays: 25, lines: [["RAW-5003", 20, 169.0]], createdBy: "Priya Raman" },
  { supplierId: "sup-8", status: "draft", orderDaysAgo: 1, expectedDays: 21, lines: [["ELE-8001", 4, 685.0], ["ELE-8003", 6, 385.0]], createdBy: "Nadia Osei", notes: "Pending engineering confirmation of specs." },
  { supplierId: "sup-1", status: "draft", orderDaysAgo: 0, expectedDays: 10, lines: [["ELC-1001", 40, 28.0]], createdBy: "Marcus Boyd" },
  { supplierId: "sup-5", status: "rejected", orderDaysAgo: 16, expectedDays: 20, lines: [["RAW-5002", 300, 60.5]], createdBy: "Nadia Osei", decidedBy: "Elena Vasquez", decisionNote: "Rejected — over budget; consolidate with next month's resin buy." },
  { supplierId: "sup-9", status: "rejected", orderDaysAgo: 27, expectedDays: 18, lines: [["TLS-4001", 10, 187.0]], createdBy: "Priya Raman", decidedBy: "Elena Vasquez", decisionNote: "Rejected — supplier on hold. Use Hexan instead." },
];

export const purchaseOrders: PurchaseOrder[] = poSpecs.map((spec, i) => {
  const lineDefs = spec.lines.map(([sku, quantity, unitPrice]) => {
    const item = items.find((it) => it.sku === sku)!;
    const receivedQty =
      spec.status === "received"
        ? quantity
        : spec.status === "partial" && spec.received
          ? Math.round(quantity * spec.received)
          : 0;
    return {
      id: nextLineId(),
      itemId: item.id,
      quantity,
      receivedQty,
      unitPrice,
      taxRate: taxFor(item.category),
    };
  });
  return {
    id: `po-${i + 1}`,
    number: nextPoNumber(),
    supplierId: spec.supplierId,
    status: spec.status,
    orderDate: dayOffset(-spec.orderDaysAgo, 9),
    expectedDate: dayOffset(-spec.orderDaysAgo + spec.expectedDays, 17),
    currency: "USD",
    lines: lineDefs,
    notes: spec.notes ?? "",
    createdBy: spec.createdBy ?? "System",
    submittedAt: spec.status === "draft" ? null : dayOffset(-spec.orderDaysAgo, 11),
    decidedAt: spec.status === "approved" || spec.status === "rejected" ? dayOffset(-spec.orderDaysAgo + 1, 14) : null,
    decidedBy: spec.decidedBy ?? null,
    decisionNote: spec.decisionNote ?? null,
  };
});

export const goodsReceipts: GoodsReceipt[] = (() => {
  let grnSeqLocal = 0;
  return purchaseOrders
    .filter((po) => po.lines.some((l) => l.receivedQty > 0))
    .map((po, i) => ({
      id: `grn-${i + 1}`,
      number: nextGrnNumber(),
      poId: po.id,
      supplierId: po.supplierId,
      warehouseId: warehouses[i % 2].id,
      receivedDate: dayOffset(-7 - (i % 5) * 6, 13),
      receivedBy: i % 2 === 0 ? "Rosa Jimenez" : "Curtis Lang",
      status: "posted" as const,
      lines: po.lines
        .filter((l) => l.receivedQty > 0)
        .map((l) => ({
          poLineId: l.id,
          itemId: l.itemId,
          quantityOrdered: l.quantity,
          quantityReceived: l.receivedQty,
          quantityRejected: i === 3 && l.itemId === "itm-17" ? 2 : 0,
          batchRef: `B${grnSeqLocal + 7}A${i}`,
        })),
      notes: "",
    }));
})();

export const stockAdjustments: StockAdjustment[] = [
  { id: "adj-1", number: nextAdjNumber(), itemId: "itm-9", warehouseId: "wh-1", delta: -12, reason: "damage", occurredAt: dayOffset(-14, 15), by: "Rosa Jimenez", notes: "Pallet damaged by forklift in aisle 7.", resultingQty: 408 },
  { id: "adj-2", number: nextAdjNumber(), itemId: "itm-17", warehouseId: "wh-1", delta: 24, reason: "found", occurredAt: dayOffset(-12, 9), by: "Curtis Lang", notes: "Found unrecorded cartons during slotting.", resultingQty: 544 },
  { id: "adj-3", number: nextAdjNumber(), itemId: "itm-2", warehouseId: "wh-2", delta: 18, reason: "cycle-count", occurredAt: dayOffset(-9, 11), by: "Curtis Lang", notes: "Cycle count variance, bin A-14.", resultingQty: 258 },
  { id: "adj-4", number: nextAdjNumber(), itemId: "itm-16", warehouseId: "wh-2", delta: -6, reason: "expiry", occurredAt: dayOffset(-7, 16), by: "Curtis Lang", notes: "Compound past shelf life.", resultingQty: 32 },
  { id: "adj-5", number: nextAdjNumber(), itemId: "itm-22", warehouseId: "wh-3", delta: -8, reason: "loss", occurredAt: dayOffset(-5, 14), by: "Eva Vermeer", notes: "Shrinkage during transfer.", resultingQty: 292 },
  { id: "adj-6", number: nextAdjNumber(), itemId: "itm-8", warehouseId: "wh-4", delta: 15, reason: "recount", occurredAt: dayOffset(-3, 10), by: "Wei Lim", notes: "Recount after GRN mismatch.", resultingQty: 75 },
  { id: "adj-7", number: nextAdjNumber(), itemId: "itm-15", warehouseId: "wh-1", delta: -30, reason: "damage", occurredAt: dayOffset(-2, 15), by: "Rosa Jimenez", notes: "Water ingress in bay B2.", resultingQty: 150 },
];

export const users: AppUser[] = [
  { id: "usr-1", name: "Elena Vasquez", email: "elena.vasquez@supplyflow.io", role: "admin", status: "active", lastActiveAt: dayOffset(0, 9), title: "Operations Director" },
  { id: "usr-2", name: "Marcus Boyd", email: "marcus.boyd@supplyflow.io", role: "procurement", status: "active", lastActiveAt: dayOffset(0, 8), title: "Procurement Manager" },
  { id: "usr-3", name: "Nadia Osei", email: "nadia.osei@supplyflow.io", role: "procurement", status: "active", lastActiveAt: dayOffset(-1, 17), title: "Buyer, Electronics" },
  { id: "usr-4", name: "Rosa Jimenez", email: "rosa.jimenez@supplyflow.io", role: "warehouse", status: "active", lastActiveAt: dayOffset(0, 7), title: "Warehouse Lead, Atlanta" },
  { id: "usr-5", name: "Curtis Lang", email: "curtis.lang@supplyflow.io", role: "warehouse", status: "active", lastActiveAt: dayOffset(-1, 19), title: "Warehouse Lead, Dallas" },
  { id: "usr-6", name: "Priya Raman", email: "priya.raman@supplyflow.io", role: "procurement", status: "invited", lastActiveAt: dayOffset(-9, 12), title: "Buyer, Tools & Materials" },
  { id: "usr-7", name: "Owen Fitzgerald", email: "owen.fitzgerald@supplyflow.io", role: "viewer", status: "active", lastActiveAt: dayOffset(-4, 10), title: "Finance Analyst" },
  { id: "usr-8", name: "Dmitri Sokolov", email: "dmitri.sokolov@supplyflow.io", role: "viewer", status: "disabled", lastActiveAt: dayOffset(-80, 11), title: "Contract Auditor" },
];

export const notifications: AppNotification[] = [
  { id: "ntf-1", title: "PO-4114 awaits your approval", body: "Hexan Precision Tools submitted a purchase order worth $4,035.", type: "warning", read: false, createdAt: dayOffset(0, 8), href: "/purchase-orders/approvals" },
  { id: "ntf-2", title: "PO-4112 approved", body: "Elena Vasquez approved PO-4112 for Meridian Industrial Supply.", type: "success", read: false, createdAt: dayOffset(-1, 14), href: "/purchase-orders/po-11" },
  { id: "ntf-3", title: "Low stock: Control Cabinet 800x600", body: "On-hand total (26) is at reorder point (12). Consider replenishment.", type: "warning", read: false, createdAt: dayOffset(-1, 10), href: "/inventory/itm-6" },
  { id: "ntf-4", title: "GRN-8209 posted", body: "Dallas received 60% of PO-4107 lines.", type: "info", read: true, createdAt: dayOffset(-2, 13), href: "/goods-receipts/grn-8" },
  { id: "ntf-5", title: "Supplier on hold", body: "Redline Bearings is on hold after repeated late deliveries.", type: "error", read: true, createdAt: dayOffset(-4, 9), href: "/suppliers/sup-9" },
  { id: "ntf-6", title: "Cycle count scheduled", body: "Atlanta DC: cycle count of fasteners this Friday.", type: "info", read: true, createdAt: dayOffset(-5, 15), href: null },
];

export const activityLog: ActivityEntry[] = [
  { id: "act-1", occurredAt: dayOffset(0, 8), actor: "Priya Raman", action: "submitted", entity: "purchase order", entityRef: "PO-4114", detail: "15 impact socket sets + 25 calipers for Hexan Precision Tools", severity: "info" },
  { id: "act-2", occurredAt: dayOffset(-1, 14), actor: "Elena Vasquez", action: "approved", entity: "purchase order", entityRef: "PO-4112", detail: "Standard replenishment of fasteners", severity: "success" },
  { id: "act-3", occurredAt: dayOffset(-1, 13), actor: "Curtis Lang", action: "posted goods receipt", entity: "goods receipt", entityRef: "GRN-8209", detail: "Partial receipt against PO-4107 (60%)", severity: "success" },
  { id: "act-4", occurredAt: dayOffset(-1, 11), actor: "Rosa Jimenez", action: "adjusted stock", entity: "stock", entityRef: "ADJ-3106", detail: "-30 HDPE Pellets (damage, water ingress)", severity: "warning" },
  { id: "act-5", occurredAt: dayOffset(-2, 16), actor: "Marcus Boyd", action: "updated", entity: "supplier", entityRef: "SUP-1009", detail: "Set Redline Bearings to on-hold", severity: "warning" },
  { id: "act-6", occurredAt: dayOffset(-2, 10), actor: "Nadia Osei", action: "created", entity: "purchase order", entityRef: "PO-4114", detail: "Draft PO for Circuitry Northwest", severity: "info" },
  { id: "act-7", occurredAt: dayOffset(-3, 9), actor: "Wei Lim", action: "adjusted stock", entity: "stock", entityRef: "ADJ-3105", detail: "+15 proximity sensors (recount)", severity: "success" },
  { id: "act-8", occurredAt: dayOffset(-3, 15), actor: "Elena Vasquez", action: "invited", entity: "user", entityRef: "Priya Raman", detail: "Buyer, Tools & Materials", severity: "info" },
  { id: "act-9", occurredAt: dayOffset(-4, 12), actor: "System", action: "flagged", entity: "supplier", entityRef: "SUP-1010", detail: "Blacklist audit failed", severity: "error" },
  { id: "act-10", occurredAt: dayOffset(-4, 10), actor: "Eva Vermeer", action: "adjusted stock", entity: "stock", entityRef: "ADJ-3104", detail: "-8 hydraulic hose meters (transfer shrinkage)", severity: "warning" },
];

export const defaultSystemConfig: SystemConfig = {
  baseDelayMs: 400,
  errorRate: 0,
  lowStockThresholdPct: 100,
  company: {
    name: "Northbridge Manufacturing Co.",
    taxId: "US-88-1142039",
    currency: "USD",
    address: "77 Foundry Park Dr, Pittsburgh, PA",
  },
};
