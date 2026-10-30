import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Suspense } from "react";
import { ChevronsUpDown, LogOut, ShieldCheck } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { RoleProvider, useRole } from "@/hooks/use-role";
import { ROLE_LABELS } from "@/lib/permissions";
import type { Role } from "@/types";

const ROLES: Role[] = ["admin", "procurement", "warehouse", "viewer"];

function HeaderUserMenu() {
  const { role, userName, setRole } = useRole();
  const initials = userName.split(" ").map((p) => p[0]).join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-accent">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-xs font-medium lg:inline">{userName}</span>
        <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <p className="text-xs font-semibold">{userName}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> {ROLE_LABELS[role]}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Simulate role
        </DropdownMenuLabel>
        {ROLES.map((r) => (
          <DropdownMenuItem key={r} onClick={() => setRole(r)} className={r === role ? "bg-accent" : ""}>
            {ROLE_LABELS[r]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings/profile">My profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="text-muted-foreground">
          <LogOut className="h-3.5 w-3.5" /> Sign out (demo)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur md:px-4">
      <SidebarTrigger className="h-8 w-8" />
      <div className="mx-auto w-full max-w-md"><GlobalSearch /></div>
      <div className="ml-auto flex items-center gap-1">
        <Suspense fallback={<Skeleton className="h-8 w-8 rounded-md" />}>
          <NotificationsMenu />
        </Suspense>
        <HeaderUserMenu />
      </div>
    </header>
  );
}

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <RoleProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex min-h-screen flex-1 flex-col">
            <AppHeader />
            <main key={pathname} className="flex-1">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RoleProvider>
  );
}
