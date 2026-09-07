import { useCallback, useEffect, useState } from "react";
import type { PrintJob } from "@/types";
import type { OrderStatusDto } from "@/services/contracts";
import { ordersService } from "@/services/orders.service";
import { inventoryService } from "@/services/inventory.service";
import { catalogService } from "@/services/catalog.service";
import { useStore } from "@/context/store-context";
import { buildStoreProductDisplayMap, type StoreProductDisplayMap } from "@/lib/order-display";
import { getSlaLabel, getSlaProgress, mapOrderToPrintJob } from "@/lib/print-job";

interface LiveJobDetailsState {
  order: PrintJob | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  acceptJob: () => Promise<void>;
  startProduction: () => Promise<void>;
  markReady: () => Promise<void>;
  slaLabel: string;
  slaProgress: number;
}

const loadProductMap = async (storeId?: string): Promise<StoreProductDisplayMap | undefined> => {
  if (!storeId) return undefined;

  const [storeProducts, catalogueProducts] = await Promise.all([
    inventoryService.listProducts(storeId),
    catalogService.listProducts({ active: true }),
  ]);

  return buildStoreProductDisplayMap(storeProducts, catalogueProducts);
};

export const useLiveJobDetails = (orderId: string | undefined): LiveJobDetailsState => {
  const { activeStore } = useStore();
  const [order, setOrder] = useState<PrintJob | null>(null);
  const [productMap, setProductMap] = useState<StoreProductDisplayMap | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!orderId) {
        if (!cancelled) {
          setOrder(null);
          setError("Missing order ID.");
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const [liveOrder, resolvedProductMap] = await Promise.all([
          ordersService.get(orderId),
          loadProductMap(activeStore?.id).catch(() => undefined),
        ]);

        if (!cancelled) {
          setProductMap(resolvedProductMap);
          setOrder(mapOrderToPrintJob(liveOrder, resolvedProductMap));
        }
      } catch (requestError) {
        if (!cancelled) {
          setOrder(null);
          setError(requestError instanceof Error ? requestError.message : "Unable to load this order.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeStore?.id, orderId, reloadKey]);

  const updateStatus = useCallback(
    async (status: OrderStatusDto) => {
      if (!orderId) return;
      const updated = await ordersService.updateStatus(orderId, status);
      setOrder(mapOrderToPrintJob(updated, productMap));
    },
    [orderId, productMap],
  );

  const acceptJob = useCallback(async () => updateStatus("CONFIRMED"), [updateStatus]);
  const startProduction = useCallback(async () => updateStatus("IN_PRODUCTION"), [updateStatus]);
  const markReady = useCallback(async () => updateStatus("READY"), [updateStatus]);

  return {
    order,
    isLoading,
    error,
    reload: () => setReloadKey((key) => key + 1),
    acceptJob,
    startProduction,
    markReady,
    slaLabel: order ? getSlaLabel(order) : "ETA unavailable",
    slaProgress: order ? getSlaProgress(order) : 0,
  };
};
