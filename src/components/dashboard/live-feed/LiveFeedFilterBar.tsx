import React from "react";

export type StatusFilter =
  | "all"
  | "pending"
  | "printing"
  | "ready"
  | "delivered";

interface LiveFeedFilterBarProps {
  activeStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}

const statusFilters: { key: StatusFilter; label: string; dot: string }[] = [
  { key: "all", label: "All", dot: "bg-gray-400" },
  { key: "pending", label: "Incoming", dot: "bg-emerald-500" },
  { key: "printing", label: "Printing", dot: "bg-amber-500" },
  { key: "ready", label: "Ready", dot: "bg-purple-500" },
  { key: "delivered", label: "Completed", dot: "bg-gray-400" },
];

export const LiveFeedFilterBar: React.FC<LiveFeedFilterBarProps> = ({
  activeStatus,
  onStatusChange,
  counts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {statusFilters.map((f) => {
        const isActive = activeStatus === f.key;
        const count = counts[f.key];
        return (
          <button
            key={f.key}
            onClick={() => onStatusChange(f.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-200 text-gray-500 hover:bg-printa-black hover:text-white"
            }`}
          >
            {!isActive && (
              <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />
            )}
            {f.label}
            {count > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
