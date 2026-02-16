export type PrintJobStatus = "pending" | "printing" | "ready" | "delivered" | "cancelled";

export interface Printer {
  name: string;
  location?: string;
  rating?: number;
  address?: string;
}

export interface PrintJob {
  id: string;
  fileName: string;
  status: PrintJobStatus;
  totalPrice: number;
  pageCount: number;
  copies: number;
  colorMode: "color" | "bw";
  printer: Printer;
  createdAt: Date;
  dueDate?: string;
  paperSize?: string;
  doubleSided?: boolean;
  estimatedDelivery?: Date;
  lastUpdated?: Date;
  acceptedAt?: Date;
  productionStartedAt?: Date;
  readyAt?: Date;
  statusHistory?: { status: PrintJobStatus; timestamp: Date }[];
  customerName?: string;
  deliveryType?: "rider" | "pickup";
  distance?: number;
  urgent?: boolean;
  acceptDeadline?: Date;
  orderChannel?: "online" | "walk-in";
  fileUrl?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
}

// ========== Role & Permission System ==========

export type UserRole = "owner" | "manager" | "staff";

export type Permission =
  // Store management
  | "manage_stores"
  | "view_stores"
  | "edit_store_settings"
  // Team management
  | "manage_team"
  | "view_team"
  | "assign_roles"
  // Financial
  | "view_billing"
  | "manage_billing"
  | "view_revenue"
  | "manage_pricing"
  // Operations
  | "manage_pos"
  | "use_pos"
  | "view_orders"
  | "manage_orders"
  | "accept_orders"
  | "cancel_orders"
  // Shifts & Scheduling
  | "manage_shifts"
  | "view_shifts"
  | "clock_in_out"
  // Analytics & Reports
  | "view_analytics"
  | "view_reports"
  | "export_data"
  // System
  | "view_dashboard"
  | "manage_settings"
  | "manage_inventory"
  | "view_support"
  | "manage_notifications";

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  status: "active" | "inactive" | "pending";
  managerId?: string;
  businessId: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  permissions: Permission[];
  assignedStoreIds: string[];
  businessId: string;
  memberSince: string;
  rating?: number;
  isActive: boolean;
}
