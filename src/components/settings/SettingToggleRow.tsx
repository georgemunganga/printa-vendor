import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SettingToggleRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function SettingToggleRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
  children,
  className,
}: SettingToggleRowProps) {
  return (
    <div className={cn("rounded-2xl border border-gray-100 bg-white p-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Label htmlFor={id} className="text-sm font-semibold text-gray-900">{title}</Label>
          <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="data-[state=checked]:bg-printa-red"
        />
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
