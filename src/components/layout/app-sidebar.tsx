import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Boxes,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShoppingCart,
  Suppliers,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole } from "@/hooks/use-role";
import { ROLE_LABELS } from "@/lib/permissions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { qk } from "@/services/query-keys";
import { api } from "@/services/api";

const NAV = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Procurement",
    items: [
      { title: "Purchase Orders", url: "/purchase-orders", icon: ShoppingCart },
      { title: "Approvals", url: "/purchase-orders/approvals", icon: ClipboardCheck, badge: "approvals" },
      { title: "Suppliers", url: "/suppliers", icon: Suppliers },
    ],
  },
  {
    label: "Inventory",
    items: [
      { title: "Stock Items", url: "/inventory", icon: Boxes },
      { title: "Adjustments", url: "/inventory/adjustments", icon: PackageSearch },
      { title: "Warehouses", url: "/inventory/warehouses", icon: Warehouse },
      { title: "Goods Receipts", url: "/goods-receipts", icon: Truck },
    ],
  },
  {
    label: "Insights",
    items: [{ title: "Reports", url: "/reports", icon: FileText }],
  },
  {
    label: "Administration",
    items: [
      { title: "Settings", url: "/settings/profile", icon: Settings },
      { title: "Activity Log", url: "/activity-log", icon: Activity },
    ],
  },
];

export function AppSidebar() {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { role, userName } = useRole();
  const { data: pos } = useSuspenseQuery({ queryKey: qk.purchaseOrders(), queryFn: () => api.listPurchaseOrders() });
  const pending = pos.filter((p) => p.status === "submitted").length;
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard" className="gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">
                  SF
                </span>
                <span className="grid flex-1 leading-tight">
                  <span className="font-display text-sm font-semibold text-sidebar-foreground">SupplyFlow</span>
                  <span className="text-[10px] text-sidebar-foreground/60">ERP · Northbridge Mfg</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url + "/")) || pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge === "approvals" && pending > 0 && (
                        <SidebarMenuBadge className="justify-center bg-warning text-warning-foreground">{pending}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {state !== "collapsed" && (
          <div className="px-3 pb-2 text-[11px] leading-tight text-sidebar-foreground/60">
            Signed in as <span className="font-medium text-sidebar-foreground">{userName}</span>
            <br />
            {ROLE_LABELS[role]} · demo session
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
