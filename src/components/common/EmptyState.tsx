import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center", className)}>
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400">
        <Icon size={24} />
      </div>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
