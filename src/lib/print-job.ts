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

export const formatJobDuration = (ms: number) => {
  const totalMinutes = Math.ceil(Math.abs(ms) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export const getSlaProgress = (job: PrintJob) => {
  if (!job.estimatedDelivery) return 0;
  const totalWindow = job.estimatedDelivery.getTime() - job.createdAt.getTime();
  if (totalWindow <= 0) return 100;
  const elapsed = Date.now() - job.createdAt.getTime();
  return Math.min(100, Math.max(0, (elapsed / totalWindow) * 100));
};

export const getSlaLabel = (job: PrintJob) => {
  if (!job.estimatedDelivery) return "ETA unavailable";
  const diff = job.estimatedDelivery.getTime() - Date.now();
  return `${diff >= 0 ? "Due in" : "Overdue"} ${formatJobDuration(diff)}`;
};

const readStringField = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const getOrderFileUrl = (order: OrderDto): string | undefined => {
  const metadata = order.metadata ?? {};
  const metadataFile = readStringField(metadata.file_url)
    ?? readStringField(metadata.fileUrl)
    ?? readStringField(metadata.asset_url)
    ?? readStringField(metadata.assetUrl)
    ?? readStringField(metadata.preview_url)
    ?? readStringField(metadata.previewUrl);

  if (metadataFile) return metadataFile;

  for (const item of order.items ?? []) {
    const customisation = item.customisation ?? {};
    const itemFile = readStringField(customisation.file_url)
      ?? readStringField(customisation.fileUrl)
      ?? readStringField(customisation.asset_url)
      ?? readStringField(customisation.assetUrl)
      ?? readStringField(customisation.preview_url)
      ?? readStringField(customisation.previewUrl);
    if (itemFile) return itemFile;
  }

  return undefined;
};

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
    fileUrl: getOrderFileUrl(order),
    notes: order.notes,
    backendStatus: order.status,
    orderKind,
    statusHistory: [{ status, timestamp: new Date(order.updated_at) }],
  };
};
