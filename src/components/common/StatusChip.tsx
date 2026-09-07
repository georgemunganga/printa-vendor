import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<StatusTone, string> = {
  neutral: "border-gray-200 bg-gray-100 text-gray-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  danger: "border-red-100 bg-red-50 text-red-700",
  info: "border-blue-100 bg-blue-50 text-blue-700",
};

interface StatusChipProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusChip({ label, tone = "neutral", className }: StatusChipProps) {
  return <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", toneClass[tone], className)}>{label}</Badge>;
}
