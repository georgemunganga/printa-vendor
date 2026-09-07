import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = "Something went wrong", message, actionLabel = "Try again", onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-800", className)} role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5">{message}</p>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" className="mt-3 rounded-xl border-red-200 bg-white text-red-700 hover:bg-red-100" onClick={onRetry}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
