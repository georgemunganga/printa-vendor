import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PrintJob } from "@/types";
import type { OrderDto, OrderStatusDto } from "@/services/contracts";
import { ordersService } from "@/services/orders.service";
import { inventoryService } from "@/services/inventory.service";
import { catalogService } from "@/services/catalog.service";
import { buildStoreProductDisplayMap } from "@/lib/order-display";
import { getSlaLabel, getSlaProgress, mapOrderToPrintJob } from "@/lib/print-job";
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
        const [orders, storeProducts, catalogueProducts] = await Promise.all([
          ordersService.listByStore(activeStore.id),
          inventoryService.listProducts(activeStore.id),
          catalogService.listProducts({ active: true }),
        ]);
        const productMap = buildStoreProductDisplayMap(storeProducts, catalogueProducts);
        if (!cancelled) setJobs(orders.map((order) => mapOrderToPrintJob(order, productMap)));
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
    setJobs((previous) => previous.map((current) => (current.id === job.id ? { ...job, fileName: current.fileName } : current)));
  }, []);

  const persistStatus = useCallback(
    async (id: string, status: OrderStatusDto, errorMessage: string) => {
      const current = jobs.find((job) => job.id === id);
      if (!current) return;
      if (current.backendStatus === status) {
        toast.info("This job is already at that stage.");
        return;
      }
      if (status === "IN_PRODUCTION" && current.backendStatus !== "CONFIRMED") {
        toast.error(current.backendStatus === "IN_PRODUCTION" ? "Print job is already in production." : "Accept this job before starting production.");
        return;
      }
      if (status === "READY" && current.backendStatus !== "IN_PRODUCTION") {
        toast.error(current.backendStatus === "READY" ? "This job is already ready." : "Start production before marking this job ready.");
        return;
      }
      try {
        const updated = await ordersService.updateStatus(id, status);
        replaceLiveOrder(updated);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : errorMessage);
      }
    },
    [jobs, replaceLiveOrder],
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

  const value = useMemo(
    () => ({ jobs, acceptJob, startProduction, markReady, getJobById, getSlaLabel, getSlaProgress }),
    [jobs, acceptJob, startProduction, markReady, getJobById],
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error("useJobContext must be used within a JobProvider");
  return context;
};

export { JobProvider };
