import type { OrderDto, PlatformProductDto, VendorStoreProductDto } from "@/services/contracts";
import type { OrderKind } from "@/types";
import { getOrderKind } from "@/lib/order-kind";

export type StoreProductDisplayMap = Map<string, PlatformProductDto>;

const PRINT_TERMS = [
  "print",
  "paper",
  "poster",
  "flyer",
  "business card",
  "photo",
  "binding",
  "lamination",
  "banner",
  "sticker",
  "label",
  "booklet",
  "document",
];

export const isLikelyPrintProduct = (product: PlatformProductDto): boolean => {
  const source = product.attributes?.inventory_source;
  if (source === "custom") return false;
  if (source === "printa") return true;

  const text = `${product.name} ${product.category} ${product.description ?? ""}`.toLowerCase();
  return PRINT_TERMS.some((term) => text.includes(term));
};

export const buildStoreProductDisplayMap = (
  storeProducts: VendorStoreProductDto[],
  catalogueProducts: PlatformProductDto[],
): StoreProductDisplayMap => {
  const catalogueById = new Map(catalogueProducts.map((product) => [product.id, product]));
  return new Map(
    storeProducts
      .map((storeProduct) => {
        const product = catalogueById.get(storeProduct.platform_product_id);
        return product ? [storeProduct.id, product] as const : null;
      })
      .filter((entry): entry is readonly [string, PlatformProductDto] => entry !== null),
  );
};

export const getOrderKindFromItems = (order: OrderDto, productByStoreProductId?: StoreProductDisplayMap): OrderKind => {
  const explicitItemKind = order.items?.map((item) => item.customisation?.order_kind).find(
    (value) => value === "print_job" || value === "retail_sale"
  );
  if (explicitItemKind === "print_job" || explicitItemKind === "retail_sale") return explicitItemKind;

  const notes = order.notes?.toUpperCase() ?? "";
  if (notes.includes("ORDER TYPE: RETAIL_SALE")) return "retail_sale";
  if (notes.includes("ORDER TYPE: PRINT_JOB")) return "print_job";

  const products = order.items?.map((item) => productByStoreProductId?.get(item.vendor_store_product_id)).filter(Boolean) ?? [];
  if (products.length === 0) return getOrderKind(order);
  return products.some((product) => isLikelyPrintProduct(product)) ? "print_job" : "retail_sale";
};

export const summarizeOrderItems = (order: OrderDto, productByStoreProductId?: StoreProductDisplayMap): string => {
  const items = order.items ?? [];
  if (items.length === 0) return order.order_number;
  const labels = items.map((item) => {
    const product = productByStoreProductId?.get(item.vendor_store_product_id);
    const name = product?.name ?? "Sold item";
    return `${name} x${item.quantity}`;
  });
  if (labels.length <= 2) return labels.join(" · ");
  return `${labels.slice(0, 2).join(" · ")} · +${labels.length - 2} more`;
};
