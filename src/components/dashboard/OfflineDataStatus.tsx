import { CloudOff, RefreshCw, WifiOff } from "lucide-react";
import { useStore } from "@/context/store-context";

export function OfflineDataStatus() {
  const { dataSource, lastSyncedAt, refreshStores, isOffline } = useStore();

  if (!isOffline && dataSource !== "offline") return null;

  const timestamp = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
      <div className="mt-0.5 shrink-0 text-amber-700">{isOffline ? <WifiOff size={17} /> : <CloudOff size={17} />}</div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{dataSource === "offline" ? "Offline data" : "No network connection"}</p>
        <p className="mt-0.5 text-xs leading-5 text-amber-800">
          {dataSource === "offline"
            ? `Showing the last store information saved on this device${timestamp ? ` on ${timestamp}` : ""}. New payments, orders, pricing, and other live actions remain unavailable until Printa reconnects.`
            : "Printa cannot retrieve live operational information until your connection returns."}
        </p>
        {!isOffline && (
          <button
            type="button"
            onClick={() => void refreshStores()}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:underline"
          >
            <RefreshCw size={13} /> Retry live data
          </button>
        )}
      </div>
    </div>
  );
}
