import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  title?: string;
  description?: string;
  variant?: "panel" | "inline" | "cards" | "list" | "table" | "chat" | "detail" | "form";
  rows?: number;
  className?: string;
}

const LoadingRegion = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={className} aria-busy="true" aria-live="polite" aria-label={label}>
    <span className="sr-only">{label}</span>
    {children}
  </div>
);

export function LoadingState({
  title = "Loading…",
  description,
  variant = "panel",
  rows = 3,
  className,
}: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <LoadingRegion label={title} className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-11 w-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="mt-5 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-2/3" />
          </div>
        ))}
      </LoadingRegion>
    );
  }

  if (variant === "table") {
    return (
      <LoadingRegion label={title} className={cn("overflow-hidden rounded-2xl border border-gray-100 bg-white", className)}>
        <div className="hidden grid-cols-4 gap-4 border-b border-gray-100 bg-gray-50 p-4 md:grid">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-3" />)}
        </div>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr] gap-4 border-b border-gray-100 p-4 last:border-0 md:grid-cols-4">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="hidden h-4 md:block" />
            <Skeleton className="hidden h-4 md:block" />
          </div>
        ))}
      </LoadingRegion>
    );
  }

  if (variant === "list") {
    return (
      <LoadingRegion label={title} className={cn("divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white", className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 p-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-4"><Skeleton className="h-4 w-2/5" /><Skeleton className="h-3 w-14" /></div>
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-3/5" />
            </div>
          </div>
        ))}
      </LoadingRegion>
    );
  }

  if (variant === "chat") {
    return (
      <LoadingRegion label={title} className={cn("space-y-5 p-4", className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={cn("flex", index % 2 ? "justify-end" : "justify-start")}>
            <div className={cn("flex max-w-[78%] items-end gap-2", index % 2 && "flex-row-reverse")}>
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div>
                <Skeleton className={cn("h-14 rounded-3xl", index % 3 === 0 ? "w-56" : "w-40")} />
                <Skeleton className={cn("mt-1 h-2 w-12", index % 2 && "ml-auto")} />
              </div>
            </div>
          </div>
        ))}
      </LoadingRegion>
    );
  }

  if (variant === "detail") {
    return (
      <LoadingRegion label={title} className={cn("space-y-4", className)}>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3"><Skeleton className="h-12 w-12" /><div className="flex-1"><Skeleton className="h-5 w-1/3" /><Skeleton className="mt-2 h-3 w-1/2" /></div></div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 lg:col-span-2">
            {Array.from({ length: rows }).map((_, index) => <Skeleton key={index} className={cn("h-4", index % 2 ? "w-2/3" : "w-full")} />)}
          </div>
          <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5">
            <Skeleton className="h-5 w-1/2" /><Skeleton className="h-20 w-full" /><Skeleton className="h-10 w-full" />
          </div>
        </div>
      </LoadingRegion>
    );
  }

  if (variant === "form") {
    return (
      <LoadingRegion label={title} className={cn("space-y-4 rounded-2xl border border-gray-100 bg-white p-5", className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index}><Skeleton className="h-3 w-24" /><Skeleton className="mt-2 h-10 w-full" /></div>
        ))}
      </LoadingRegion>
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
    <LoadingRegion label={title} className={cn("rounded-2xl border border-gray-100 bg-white p-5", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0" />
        <div className="flex-1"><Skeleton className="h-4 w-2/5" /><Skeleton className="mt-2 h-3 w-3/5" /></div>
      </div>
      <Skeleton className="mt-5 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
      {description ? <span className="sr-only">{description}</span> : null}
    </LoadingRegion>
  );
}
