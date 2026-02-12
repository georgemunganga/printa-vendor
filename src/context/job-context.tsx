import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { mockOrders } from "@/data/mockOrders";
import { PrintJob, PrintJobStatus } from "@/types";

interface JobContextValue {
  jobs: PrintJob[];
  getJobById: (id: string | undefined) => PrintJob | undefined;
  acceptJob: (id: string) => void;
  startProduction: (id: string) => void;
  markReady: (id: string) => void;
  getSlaLabel: (job: PrintJob) => string;
  getSlaProgress: (job: PrintJob) => number;
}

const JobContext = createContext<JobContextValue | undefined>(undefined);

const normalizeMockOrders = (): PrintJob[] => {
  return mockOrders.map((order) => ({
    ...order,
    createdAt: new Date(order.createdAt),
    estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
    lastUpdated: new Date(),
    statusHistory: [{ status: order.status, timestamp: new Date(order.createdAt) }],
  }));
};

const formatDuration = (ms: number) => {
  const totalMinutes = Math.ceil(Math.abs(ms) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const computeSlaProgress = (job: PrintJob) => {
  if (!job.estimatedDelivery) return 0;
  const totalWindow = job.estimatedDelivery.getTime() - job.createdAt.getTime();
  if (totalWindow <= 0) return 100;
  const elapsed = Date.now() - job.createdAt.getTime();
  return Math.min(100, Math.max(0, (elapsed / totalWindow) * 100));
};

const addStatusHistory = (job: PrintJob, status: PrintJobStatus) => {
  const history = job.statusHistory ? [...job.statusHistory] : [];
  return [...history, { status, timestamp: new Date() }];
};

const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<PrintJob[]>(normalizeMockOrders());

  const updateJob = useCallback(
    (id: string, updater: (job: PrintJob) => PrintJob) => {
      setJobs((prev) =>
        prev.map((job) => (job.id === id ? { ...updater(job), lastUpdated: new Date() } : job))
      );
    },
    []
  );

  const acceptJob = useCallback(
    (id: string) =>
      updateJob(id, (job) => {
        if (job.status !== "pending") return job;
        return {
          ...job,
          status: "printing",
          acceptedAt: new Date(),
          statusHistory: addStatusHistory(job, "printing"),
        };
      }),
    [updateJob]
  );

  const startProduction = useCallback(
    (id: string) =>
      updateJob(id, (job) => {
        if (job.status !== "printing") return job;
        return {
          ...job,
          productionStartedAt: job.productionStartedAt ?? new Date(),
          statusHistory: addStatusHistory(job, "printing"),
        };
      }),
    [updateJob]
  );

  const markReady = useCallback(
    (id: string) =>
      updateJob(id, (job) => {
        if (job.status === "ready" || job.status === "delivered") return job;
        return {
          ...job,
          status: "ready",
          readyAt: new Date(),
          statusHistory: addStatusHistory(job, "ready"),
        };
      }),
    [updateJob]
  );

  const getJobById = useCallback(
    (id: string | undefined) => jobs.find((job) => job.id === id),
    [jobs]
  );

  const getSlaLabel = useCallback((job: PrintJob) => {
    if (!job.estimatedDelivery) return "ETA unavailable";
    const diff = job.estimatedDelivery.getTime() - Date.now();
    const prefix = diff >= 0 ? "Due in" : "Overdue";
    return `${prefix} ${formatDuration(diff)}`;
  }, []);

  const value = useMemo(
    () => ({
      jobs,
      acceptJob,
      startProduction,
      markReady,
      getJobById,
      getSlaLabel,
      getSlaProgress: computeSlaProgress,
    }),
    [jobs, acceptJob, startProduction, markReady, getJobById, getSlaLabel]
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobContext must be used within a JobProvider");
  }
  return context;
};

export { JobProvider };
