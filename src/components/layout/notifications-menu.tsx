import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { qk } from "@/services/query-keys";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const TYPE_DOT = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
};

export function NotificationsMenu() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: notifications } = useSuspenseQuery({ queryKey: qk.notifications, queryFn: () => api.listNotifications() });
  const unread = notifications.filter((n) => !n.read).length;

  const markOne = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: (data) => queryClient.setQueryData(qk.notifications, data),
  });
  const markAll = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: (data) => queryClient.setQueryData(qk.notifications, data),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-xs font-semibold">Notifications</p>
          <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => markAll.mutate()} disabled={markAll.isPending || unread === 0}>
            <CheckCheck className="h-3 w-3" /> Mark all read
          </Button>
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">You're all caught up.</p>
          ) : (
            notifications.slice(0, 12).map((n) => (
              <button
                key={n.id}
                className={cn(
                  "flex w-full items-start gap-2.5 border-b px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent",
                  !n.read && "bg-primary/[0.04]",
                )}
                onClick={() => {
                  if (!n.read) markOne.mutate(n.id);
                  if (n.href) {
                    void navigate({ to: n.href });
                  } else {
                    void navigate({ to: "/notifications" });
                  }
                }}
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", TYPE_DOT[n.type], n.read && "opacity-30")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-foreground">{n.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[11px] text-muted-foreground">{n.body}</span>
                  <span className="mt-1 block text-[10px] text-muted-foreground/70">{formatRelative(n.createdAt)}</span>
                </span>
                {n.href && <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-muted-foreground/50" />}
              </button>
            ))
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full text-xs">
            <Link to="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function UnreadMarker({ read }: { read: boolean }) {
  return read ? <Check className="h-3 w-3 opacity-40" /> : <span className="h-2 w-2 rounded-full bg-primary" />;
}
