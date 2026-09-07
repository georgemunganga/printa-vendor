import type { ElementType } from "react";
import { CheckCircle, Clock, FileText, Globe, Package, Store, Truck, XCircle } from "lucide-react";
import type { PrintJob } from "@/types";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { getOrderChannelLabel, getOrderKindLabel } from "@/lib/print-job";

const statusConfig: Record<PrintJob["status"], { label: string; icon: ElementType; dot: string; badge: string; accent: string }> = {
  pending: { label: "Processing", icon: Clock, dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700", accent: "text-amber-600 bg-amber-100" },
  printing: { label: "Printing", icon: FileText, dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700", accent: "text-sky-600 bg-sky-100" },
  ready: { label: "Ready", icon: CheckCircle, dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700", accent: "text-emerald-600 bg-emerald-100" },
  delivered: { label: "Delivered", icon: Truck, dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600", accent: "text-gray-600 bg-gray-100" },
  cancelled: { label: "Cancelled", icon: XCircle, dot: "bg-rose-400", badge: "bg-rose-50 text-rose-600", accent: "text-rose-600 bg-rose-100" },
};

interface OrderStatusBadgeProps {
  status: PrintJob["status"];
  compact?: boolean;
  withIcon?: boolean;
  withDot?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function OrderStatusBadge({ status, compact, withIcon, withDot, showLabel = true, label, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-semibold", compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs", withDot || withIcon ? config.badge : config.accent, className)}>
      {withDot ? <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} /> : null}
      {withIcon ? <Icon size={compact ? 10 : 14} /> : null}
      {showLabel ? label ?? config.label : null}
    </span>
  );
}

interface OrderKindBadgeProps {
  orderKind?: PrintJob["orderKind"];
  compact?: boolean;
  className?: string;
}

export function OrderKindBadge({ orderKind, compact, className }: OrderKindBadgeProps) {
  const isPrintJob = orderKind !== "retail_sale";
  const Icon = isPrintJob ? FileText : Store;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full font-semibold", compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs", isPrintJob ? "bg-red-50 text-printa-red" : "bg-gray-100 text-gray-600", className)}>
      <Icon size={compact ? 10 : 12} />
      {getOrderKindLabel(orderKind)}
    </span>
  );
}

interface OrderChannelBadgeProps {
  orderChannel?: PrintJob["orderChannel"];
  compact?: boolean;
  className?: string;
}

export function OrderChannelBadge({ orderChannel, compact, className }: OrderChannelBadgeProps) {
  const isOnline = orderChannel === "online" || !orderChannel;
  const Icon = isOnline ? Globe : Store;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full font-semibold", compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs", isOnline ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600", className)}>
      <Icon size={compact ? 10 : 12} />
      {getOrderChannelLabel(orderChannel)}
    </span>
  );
}

interface OrderMoneyProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function OrderMoney({ amount, currency, className }: OrderMoneyProps) {
  return <span className={className}>{formatMoney(amount, currency)}</span>;
}
