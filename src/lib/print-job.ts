import type { PrintJob, PrintJobStatus } from "@/types";
import type { OrderDto, OrderStatusDto } from "@/services/contracts";
import {
  getOrderKindFromItems,
  summarizeOrderItems,
  type StoreProductDisplayMap,
} from "@/lib/order-display";

export const toPrintJobStatus = (status: OrderStatusDto): PrintJobStatus => {
  switch (status) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
    case "IN_PRODUCTION":
      return "printing";
    case "READY":
      return "ready";
    case "DELIVERED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
  }
};

export const getOrderKindLabel = (orderKind?: PrintJob["orderKind"]) =>
  orderKind === "retail_sale" ? "Till sale" : "Print job";

export const getOrderChannelLabel = (orderChannel?: PrintJob["orderChannel"]) =>
  orderChannel === "walk-in" ? "Walk-in" : "Online";

export const getProductionLocationLabel = (orderKind?: PrintJob["orderKind"]) =>
  orderKind === "retail_sale" ? "Walk-in till" : "Production queue";

export const mapOrderToPrintJob = (
  order: OrderDto,
  productByStoreProductId?: StoreProductDisplayMap,
): PrintJob => {
  const items = order.items ?? [];
  const copies = items.reduce((total, item) => total + item.quantity, 0) || 1;
  const orderKind = getOrderKindFromItems(order, productByStoreProductId);
  const customerName = order.customer_id ? `Customer ${order.customer_id.slice(0, 8)}` : "Walk-in customer";
  const status = toPrintJobStatus(order.status);

  return {
    id: order.id,
    fileName: `${summarizeOrderItems(order, productByStoreProductId)} · ${getOrderKindLabel(orderKind)}`,
    status,
    totalPrice: order.total,
    currency: order.currency,
    pageCount: copies,
    copies,
    colorMode: "color",
    printer: { name: getProductionLocationLabel(orderKind) },
    createdAt: new Date(order.created_at),
    lastUpdated: new Date(order.updated_at),
    dueDate: order.status === "READY" ? "Ready now" : undefined,
    estimatedDelivery: order.status === "READY" || order.status === "IN_PRODUCTION" ? new Date(order.updated_at) : undefined,
    customerName,
    deliveryType: order.delivery_address ? "rider" : "pickup",
    orderChannel: order.channel === "POS" ? "walk-in" : "online",
    notes: order.notes,
    backendStatus: order.status,
    orderKind,
    statusHistory: [{ status, timestamp: new Date(order.updated_at) }],
  };
};
