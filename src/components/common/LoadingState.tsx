import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  title?: string;
  description?: string;
  variant?: "panel" | "inline" | "cards" | "table";
  rows?: number;
  className?: string;
}

export function LoadingState({
  title = "Loading…",
  description,
  variant = "panel",
  rows = 3,
  className,
}: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)} aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-100 bg-white p-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="mt-4 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-2", className)} aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 rounded-xl border border-gray-100 bg-white p-4">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-gray-500", className)} aria-busy="true" aria-live="polite">
        <Loader2 size={16} className="animate-spin" />
        <span>{title}</span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-gray-100 bg-white p-8 text-center", className)} aria-busy="true" aria-live="polite">
      <Loader2 size={24} className="mx-auto animate-spin text-printa-red" />
      <p className="mt-3 text-sm font-semibold text-gray-900">{title}</p>
      {description ? <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p> : null}
    </div>
  );
}
