import { Wallet, CircleAlert, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const PaymentMethodsPage = () => {
  const handleUnavailableAction = () => {
    toast.info("Printa Wallet is not available yet. Wallet balances, transaction reports, and withdrawals will appear here once the wallet service is activated.");
  };

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
                    <CircleAlert size={10} />
                    Not connected
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Wallet balances, transaction reporting, transaction charges, and withdrawals are not active for this account yet.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-gray-50/70 p-4 md:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Available balance</p>
                  <p className="mt-1 text-lg font-semibold text-gray-700">—</p>
                  <p className="text-xs text-gray-500">All wallet amounts will be shown in ZMW.</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Transaction activity</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">No wallet data available</p>
                  <p className="text-xs text-gray-500">There are no wallet records to display.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleUnavailableAction}
                className="mt-4 w-full rounded-xl border-printa-red/30 text-printa-red hover:bg-printa-red/5 hover:text-printa-red sm:w-auto"
              >
                Wallet access is not available yet
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
        >
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-printa-red" />
          <p className="text-xs leading-5 text-gray-500">
            Payment methods are not stored in this portal. When wallet services are activated, the amounts and activity shown here will come from Printa&apos;s verified transaction records.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentMethodsPage;
