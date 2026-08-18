import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PrintJob, PrintJobStatus } from "@/types";
import type { OrderDto, OrderStatusDto } from "@/services/contracts";
import { ordersService } from "@/services/orders.service";
import { useStore } from "./store-context";

interface JobContextValue {
  jobs: PrintJob[];
  getJobById: (id: string | undefined) => PrintJob | undefined;
  acceptJob: (id: string) => Promise<void>;
  startProduction: (id: string) => Promise<void>;
  markReady: (id: string) => Promise<void>;
  getSlaLabel: (job: PrintJob) => string;
  getSlaProgress: (job: PrintJob) => number;
}

const JobContext = createContext<JobContextValue | undefined>(undefined);

const toPrintJobStatus = (status: OrderStatusDto): PrintJobStatus => {
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

const mapOrderToPrintJob = (order: OrderDto): PrintJob => {
  const items = order.items ?? [];
  const copies = items.reduce((total, item) => total + item.quantity, 0) || 1;
  const status = toPrintJobStatus(order.status);
  return {
    id: order.id,
    fileName: order.order_number,
    status,
    totalPrice: order.total,
    pageCount: copies,
    copies,
    colorMode: "color",
    printer: { name: "Production queue" },
    createdAt: new Date(order.created_at),
    lastUpdated: new Date(order.updated_at),
    customerName: order.customer_id ? `Customer ${order.customer_id.slice(0, 8)}` : "Walk-in customer",
    deliveryType: order.delivery_address ? "rider" : "pickup",
    orderChannel: order.channel === "POS" ? "walk-in" : "online",
    notes: order.notes,
    statusHistory: [{ status, timestamp: new Date(order.updated_at) }],
  };
};

const formatDuration = (ms: number) => {
  const totalMinutes = Math.ceil(Math.abs(ms) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const computeSlaProgress = (job: PrintJob) => {
  if (!job.estimatedDelivery) return 0;
  const totalWindow = job.estimatedDelivery.getTime() - job.createdAt.getTime();
  if (totalWindow <= 0) return 100;
  const elapsed = Date.now() - job.createdAt.getTime();
  return Math.min(100, Math.max(0, (elapsed / totalWindow) * 100));
};

const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeStore } = useStore();
  const [jobs, setJobs] = useState<PrintJob[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!activeStore?.id) {
        if (!cancelled) setJobs([]);
        return;
      }
      try {
        const orders = await ordersService.listByStore(activeStore.id);
        if (!cancelled) setJobs(orders.map(mapOrderToPrintJob));
      } catch {
        if (!cancelled) setJobs([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeStore?.id]);

  const replaceLiveOrder = useCallback((order: OrderDto) => {
    const job = mapOrderToPrintJob(order);
    setJobs((previous) => previous.map((current) => (current.id === job.id ? job : current)));
  }, []);

  const persistStatus = useCallback(
    async (id: string, status: OrderStatusDto, errorMessage: string) => {
      try {
        const updated = await ordersService.updateStatus(id, status);
        replaceLiveOrder(updated);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : errorMessage);
      }
    },
    [replaceLiveOrder],
  );

  const acceptJob = useCallback(
    async (id: string) => {
      await persistStatus(id, "CONFIRMED", "Unable to accept this job.");
    },
    [persistStatus],
  );

  const startProduction = useCallback(
    async (id: string) => {
      await persistStatus(id, "IN_PRODUCTION", "Unable to start production.");
    },
    [persistStatus],
  );

  const markReady = useCallback(
    async (id: string) => {
      await persistStatus(id, "READY", "Unable to mark this job ready.");
    },
    [persistStatus],
  );

  const getJobById = useCallback((id: string | undefined) => jobs.find((job) => job.id === id), [jobs]);

  const getSlaLabel = useCallback((job: PrintJob) => {
    if (!job.estimatedDelivery) return "ETA unavailable";
    const diff = job.estimatedDelivery.getTime() - Date.now();
    return `${diff >= 0 ? "Due in" : "Overdue"} ${formatDuration(diff)}`;
  }, []);

  const value = useMemo(
    () => ({ jobs, acceptJob, startProduction, markReady, getJobById, getSlaLabel, getSlaProgress: computeSlaProgress }),
    [jobs, acceptJob, startProduction, markReady, getJobById, getSlaLabel],
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error("useJobContext must be used within a JobProvider");
  return context;
};

export { JobProvider };
