import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-2 space-y-5 px-4 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function DrawerField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

export function DrawerSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-3 border-t pt-4 first:border-t-0 first:pt-0">
      {title && <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>}
      {children}
    </div>
  );
}
