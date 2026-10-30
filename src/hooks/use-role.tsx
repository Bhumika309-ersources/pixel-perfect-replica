import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role } from "@/types";
import { ROLE_LABELS, roleCan } from "@/lib/permissions";
import { api } from "@/services/api";

const STORAGE_KEY = "supplyflow.simulated-role";

interface RoleContextValue {
  role: Role;
  userName: string;
  setRole: (role: Role) => void;
  can: typeof roleCan;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const USER_BY_ROLE: Record<Role, string> = {
  admin: "Elena Vasquez",
  procurement: "Marcus Boyd",
  warehouse: "Rosa Jimenez",
  viewer: "Owen Fitzgerald",
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("admin");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    if (stored && stored in USER_BY_ROLE) setRoleState(stored);
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    void api.setSessionUser(USER_BY_ROLE[next]);
  }, []);

  // Keep the mock service's audit actor in sync with the simulated session.
  useEffect(() => {
    void api.setSessionUser(USER_BY_ROLE[role]);
  }, [role]);

  const value = useMemo<RoleContextValue>(
    () => ({ role, userName: USER_BY_ROLE[role], setRole, can: roleCan }),
    [role, setRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}

/** Convenience hook for role-gated UI in pages. */
export function useCan() {
  const { role } = useRole();
  return useCallback((action: Parameters<typeof roleCan>[1]) => roleCan(role, action), [role]);
}

export { ROLE_LABELS };
