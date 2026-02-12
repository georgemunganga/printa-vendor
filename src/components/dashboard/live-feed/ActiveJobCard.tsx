import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  CheckCircle,
  Phone,
  FileText,
  Bike,
  MapPin,
  Package,
} from "lucide-react";
import { PrintJob } from "@/types";

interface ActiveJobCardProps {
  job: PrintJob;
  onStartPrint: (id: string) => void;
  onMarkReady: (id: string) => void;
  onCallRider: (id: string) => void;
}

const stageConfig: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  printing: {
    label: "Printing",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  ready: {
    label: "Ready",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  delivered: {
    label: "Completed",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

const getProgress = (job: PrintJob): number => {
  if (job.status === "delivered") return 100;
  if (job.status === "ready") return 90;
  if (!job.productionStartedAt) return 10;
  const elapsed = Date.now() - job.productionStartedAt.getTime();
  const estimatedDuration = 30 * 60_000;
  return Math.min(85, Math.max(15, (elapsed / estimatedDuration) * 100));
};

export const ActiveJobCard: React.FC<ActiveJobCardProps> = ({
  job,
  onStartPrint,
  onMarkReady,
  onCallRider,
}) => {
  const stage = stageConfig[job.status] || stageConfig.printing;
  const progress = getProgress(job);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`rounded-2xl border p-4 bg-white shadow-sm ${stage.borderColor} transition-all`}
    >
      {/* Stage badge + order ID */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${stage.bgColor} ${stage.color}`}
        >
          {job.status === "printing" && <Play size={10} fill="currentColor" />}
          {job.status === "ready" && <Package size={10} />}
          {job.status === "delivered" && <CheckCircle size={10} />}
          {stage.label}
        </span>
        <span className="text-xs text-gray-400 font-mono">{job.id}</span>
      </div>

      {/* File info */}
      <div className="flex items-center gap-2 text-sm mb-2">
        <FileText size={14} className="text-gray-300" />
        <span className="text-gray-900 font-medium">{job.fileName}</span>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
        <span>Qty: {job.copies}</span>
        <span>{job.pageCount} pages</span>
        <span>{job.paperSize || "A4"}</span>
        <span>{job.colorMode === "color" ? "Color" : "B&W"}</span>
      </div>

      {/* Customer + delivery */}
      {job.customerName && (
        <p className="text-xs text-gray-400 mb-1">
          <span className="text-gray-600">{job.customerName}</span>
          {job.deliveryType === "rider" ? (
            <span className="inline-flex items-center gap-1 ml-2">
              <Bike size={11} /> Rider {job.distance && `· ${job.distance}km`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 ml-2">
              <MapPin size={11} /> Pickup
            </span>
          )}
        </p>
      )}

      {/* Progress bar */}
      {job.status === "printing" && (
        <div className="mt-3 mb-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center justify-between mt-3 mb-3">
        <span className="text-base font-bold text-gray-900">
          K{job.totalPrice.toFixed(2)}
        </span>
        {job.acceptedAt && (
          <span className="text-[10px] text-gray-400">
            Accepted{" "}
            {job.acceptedAt.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
        {job.status === "printing" && !job.productionStartedAt && (
          <button
            onClick={() => onStartPrint(job.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-400 transition-colors active:scale-[0.97]"
          >
            <Play size={13} />
            Start Print
          </button>
        )}
        {job.status === "printing" && (
          <button
            onClick={() => onMarkReady(job.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors active:scale-[0.97]"
          >
            <CheckCircle size={13} />
            Mark Ready
          </button>
        )}
        {job.status === "ready" && job.deliveryType === "rider" && (
          <button
            onClick={() => onCallRider(job.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors active:scale-[0.97]"
          >
            <Phone size={13} />
            Call Rider
          </button>
        )}
        {job.status === "ready" && (
          <button
            onClick={() => onMarkReady(job.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <CheckCircle size={13} />
            Complete
          </button>
        )}
      </div>
    </motion.div>
  );
};
