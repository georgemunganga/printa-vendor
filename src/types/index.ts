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
}
