import {
  AlertTriangle,
  Boxes,
  Building2,
  CreditCard,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  Rocket,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { HelpIconName } from "@/content/vendor-help";

const icons: Record<HelpIconName, LucideIcon> = {
  rocket: Rocket,
  orders: ListChecks,
  pos: ShoppingCart,
  inventory: Boxes,
  store: Building2,
  team: Users,
  billing: CreditCard,
  security: LockKeyhole,
  troubleshooting: AlertTriangle,
};

export const HelpTopicIcon = ({ name, size = 22 }: { name: HelpIconName; size?: number }) => {
  const Icon = icons[name] ?? LifeBuoy;
  return <Icon size={size} />;
};
