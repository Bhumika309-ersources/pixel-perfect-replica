import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">Couldn't load this data</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        {message ?? "The service returned an error. You can retry — if the chaos dial is enabled, most retries succeed."}
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RotateCcw className="h-3.5 w-3.5" /> Try again
      </Button>
    </div>
  );
}
