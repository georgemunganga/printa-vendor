import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function QuantityControl({ value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, disabled, className }: QuantityControlProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className={cn("inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white", className)}>
      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={decrease} disabled={disabled || value <= min} aria-label="Decrease quantity">
        <Minus size={14} />
      </Button>
      <span className="min-w-10 px-2 text-center text-sm font-semibold text-gray-900">{value}</span>
      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={increase} disabled={disabled || value >= max} aria-label="Increase quantity">
        <Plus size={14} />
      </Button>
    </div>
  );
}
