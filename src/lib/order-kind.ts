import type { OrderDto, PlatformProductDto } from "@/services/contracts";

export type OrderKind = "print_job" | "retail_sale";

const PRINT_TERMS = [
  "print",
  "paper",
  "poster",
  "flyer",
  "card",
  "photo",
  "binding",
  "lamination",
  "banner",
  "sticker",
  "label",
  "book",
  "document",
];

export const orderKindNote = (kind: OrderKind) =>
  kind === "print_job" ? "Order type: PRINT_JOB" : "Order type: RETAIL_SALE";

export const isPrintProduct = (product: PlatformProductDto): boolean => {
  const source = product.attributes?.inventory_source;
  if (source !== "custom") return true;
  const text = `${product.name} ${product.category} ${product.description ?? ""}`.toLowerCase();
  return PRINT_TERMS.some((term) => text.includes(term));
};

export const getOrderKind = (order: Pick<OrderDto, "channel" | "notes">): OrderKind => {
  const notes = order.notes?.toUpperCase() ?? "";
  if (notes.includes("ORDER TYPE: RETAIL_SALE")) return "retail_sale";
  if (notes.includes("ORDER TYPE: PRINT_JOB")) return "print_job";
  return "print_job";
};

