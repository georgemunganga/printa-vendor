import { useEffect, useState } from "react";
import { Wallet, CircleAlert, ShieldCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { walletService, type WalletOverviewDto } from "@/services/wallet.service";

const formatWalletAmount = (amountMinor: number, currency = "ZMW") => {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const entryLabel = (entryType: string) => entryType
  .toLowerCase()
  .split("_")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const PaymentMethodsPage = () => {
  const [overview, setOverview] = useState<WalletOverviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      try {
        const liveOverview = await walletService.getOverview();
        if (!cancelled) {
          setOverview(liveOverview);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setOverview(null);
          setLoadError(error instanceof Error ? error.message : "Unable to load wallet information.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshVersion]);

  const account = overview?.account;
  const balance = overview?.balance;
  const entries = overview?.entries ?? [];

  const handleUnavailableAction = () => {
    toast.info("Printa Wallet activation, transaction reporting, and withdrawals will become available only after the required operational controls are activated.");
  };

  const status = loadError
    ? "Status unavailable"
    : !account
      ? "Not connected"
      : account.state === "ACTIVE"
        ? "Connected"
        : "Setup pending";

  const statusDescription = loadError
    ? "Wallet information could not be loaded. No balance or transaction activity is shown."
    : isLoading
      ? "Loading wallet information from Printa."
      : !account
        ? "Wallet balances, transaction reporting, transaction charges, and withdrawals are not active for this account yet."
        : account.state === "ACTIVE"
          ? "Amounts and activity below are derived from Printa's verified wallet records."
          : "A wallet record exists, but activation has not been completed. No wallet action is available from this screen.";

  return (
    <DashboardLayout pageTitle="Payment">
      <div className="space-y-4 md:max-w-3xl md:mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="dashboard-page-heading">
            <h1 className="dashboard-page-title">Payment Methods</h1>
            <p className="dashboard-page-subtitle">
              View your Printa payment and wallet access
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Printa Wallet
          </h2>
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-start gap-3 p-4 md:p-5">
              <div className="rounded-xl bg-printa-red p-3 text-white">
                <Wallet size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">Printa Wallet</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                    {isLoading ? <LoaderCircle size={10} className="animate-spin" /> : <CircleAlert size={10} />}
                    {status}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-500">{statusDescription}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-gray-50/70 p-4 md:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Available balance</p>
                  <p className="mt-1 text-lg font-semibold text-gray-700">
                    {balance ? formatWalletAmount(balance.available_minor, balance.currency) : "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {balance ? `Pending: ${formatWalletAmount(balance.pending_minor, balance.currency)} · Held: ${formatWalletAmount(balance.held_minor, balance.currency)}` : "All wallet amounts will be shown in ZMW."}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Transaction activity</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {isLoading ? "Loading wallet activity" : entries.length > 0 ? `${entries.length} recent record${entries.length === 1 ? "" : "s"}` : "No wallet data available"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entries.length > 0 ? "Recent records are shown below." : "There are no wallet records to display."}
                  </p>
                </div>
              </div>

              {entries.length > 0 && (
                <div className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-700">{entryLabel(entry.entry_type)}</p>
                        <p className="text-[11px] text-gray-400">{new Date(entry.created_at).toLocaleString()}</p>
                      </div>
                      <p className={`shrink-0 text-xs font-semibold ${entry.amount_minor >= 0 ? "text-emerald-600" : "text-gray-700"}`}>
                        {entry.amount_minor >= 0 ? "+" : ""}{formatWalletAmount(entry.amount_minor, entry.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {loadError ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRefreshVersion((version) => version + 1)}
                  className="mt-4 w-full rounded-xl border-printa-red/30 text-printa-red hover:bg-printa-red/5 hover:text-printa-red sm:w-auto"
                >
                  Try again
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUnavailableAction}
                  disabled={isLoading || account?.state === "ACTIVE"}
                  className="mt-4 w-full rounded-xl border-printa-red/30 text-printa-red hover:bg-printa-red/5 hover:text-printa-red disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {account?.state === "ACTIVE" ? "Wallet actions are not available yet" : "Wallet access is not available yet"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
        >
          {loadError ? <TriangleAlert size={18} className="mt-0.5 shrink-0 text-printa-red" /> : <ShieldCheck size={18} className="mt-0.5 shrink-0 text-printa-red" />}
          <p className="text-xs leading-5 text-gray-500">
            Payment methods are not stored in this portal. Wallet balances, activity, and withdrawal records are shown only when returned by Printa&apos;s verified transaction records.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentMethodsPage;
