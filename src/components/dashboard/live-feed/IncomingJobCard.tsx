import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Bike,
  MapPin,
  Eye,
  Check,
  X,
  AlertTriangle,
  Package,
  Image,
  BookOpen,
  CreditCard,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";
import { PrintJob } from "@/types";

interface IncomingJobCardProps {
  job: PrintJob;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onPreview: (id: string) => void;
}

const useCountdown = (deadline: Date | undefined) => {
  const [remaining, setRemaining] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("00:00");
        setExpired(true);
        return;
      }
      const mins = Math.floor(diff / 60_000);
      const secs = Math.floor((diff % 60_000) / 1000);
      setRemaining(
        `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return { remaining, expired };
};

// Map file name to a relevant print-type icon
const getPrintIcon = (fileName: string) => {
  const name = fileName.toLowerCase();
  if (name.includes("poster") || name.includes("banner") || name.includes("flyer"))
    return Image;
  if (name.includes("card") || name.includes("invite"))
    return CreditCard;
  if (name.includes("brochure") || name.includes("booklet") || name.includes("report") || name.includes("thesis"))
    return BookOpen;
  if (name.includes("spread") || name.includes("certificate"))
    return FileSpreadsheet;
  if (name.includes("presentation") || name.includes("slide"))
    return Presentation;
  return FileText;
};

export const IncomingJobCard: React.FC<IncomingJobCardProps> = ({
  job,
  onAccept,
  onReject,
  onPreview,
}) => {
  const { remaining, expired } = useCountdown(job.acceptDeadline);
  const timeLabel = job.createdAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const isLargeJob = job.copies >= 50;
  const PrintIcon = getPrintIcon(job.fileName);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative rounded-2xl border bg-white p-4 shadow-sm transition-all overflow-hidden ${
        job.urgent
          ? "border-red-200 shadow-red-printa-red"
          : "border-printa-red/30 hover:border-printa-red"
      }`}
    >
      {/* Orange accent top strip */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradjient-to-r from-printa-red to-printa-black" />

      {/* Header + icon — top right */}
      <div className="absolute top-3 right-3 flex flex-col items-end">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-printa-red animate-pulse" />
          <span className="text-[10px] font-bold text-printa-red uppercase tracking-wide">
            New Order
          </span>
          <span className="text-[10px] text-gray-300">—</span>
          <span className="text-[10px] text-gray-400">{timeLabel}</span>
        </div>
        <div className="h-14 w-14 flex items-center justify-center">
          <PrintIcon size={36} strokeWidth={1.5} className="text-printa-red" />
        </div>
      </div>
      {/* Notice flags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2 pr-24">
        {job.urgent && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-red-50 text-red-500 text-[10px] font-bold uppercase border border-red-100">
            <AlertTriangle size={10} />
            Urgent
          </span>
        )}
        {isLargeJob && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-printa-red/10 text-printa-red text-[10px] font-bold uppercase border border-printa-red">
            <Package size={10} />
            Large Job
          </span>
        )}
        {job.deliveryType === "rider" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-printa-black text-white text-[10px] font-bold uppercase border border-printa-black">
            <Bike size={10} />
            Delivery {job.distance && `· ${job.distance}km`}
          </span>
        )}
        {job.deliveryType === "pickup" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-printa-black text-white  text-[10px] font-bold uppercase border border-printa-black">
            <MapPin size={10} />
            Pickup
          </span>
        )}
      </div>
      
      {/* Customer */}
      <p className="text-base font-semibold text-gray-900 mb-2 pr-24">
        {job.customerName || "Customer"}
      </p>

      {/* Price + countdown */}
      <div className="flex items-center justify-between mb-3 pr-24">
        <span className="text-3xl font-bold text-gray-900">
          K{job.totalPrice.toFixed(2)}
        </span>
        {job.acceptDeadline && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-semibold ${
              expired
                ? "text-red-600 bg-red-50 border border-red-100"
                : "text-printa-red bg-printa-red/10 border border-printa-red"
            }`}
          >
            <Clock size={12} />
            <span>{remaining}</span>
          </div>
        )}
      </div>
      {/* File details */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 mb-3">
        <span className="text-gray-700 font-medium">{job.fileName}</span>
        <span className="text-orange-200">·</span>
        <span>{job.paperSize || "A4"}</span>
        <span className="text-orange-200">·</span>
        <span>{job.copies} copies</span>
        <span className="text-orange-200">·</span>
        <span>{job.colorMode === "color" ? "Full color" : "B&W"}</span>
        {job.doubleSided && (
          <>
            <span className="text-orange-200">·</span>
            <span>Double-sided</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-printa-red/60 ">
        <button
          onClick={() => onPreview(job.id)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white bg-printa-black border border-gray-200 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <Eye size={13} />
          Preview
        </button>
        <button
          onClick={() => onAccept(job.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-printa-red hover:bg-printa-red transition-colors active:scale-[0.97]"
        >
          <Check size={15} />
          Accept
        </button>
        <button
          onClick={() => onReject(job.id)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <X size={13} />
          Reject
        </button>
      </div>
    </motion.div>
  );
};
