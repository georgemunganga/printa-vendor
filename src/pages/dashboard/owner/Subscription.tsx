import React, { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, CreditCard, Crown, Download, Gem, Receipt, Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/auth-context";
import { billingService, type SubscriptionTierDto } from "@/services/billing.service";

const TIER_PRESENTATION: Record<string, { icon: typeof Shield; accent: "gray" | "red" | "amber" }> = {
  CORE: { icon: Shield, accent: "gray" },
  PRO: { icon: Gem, accent: "red" },
  ENTERPRISE: { icon: Crown, accent: "amber" },
};

const formatMonthlyPrice = (price: number) => `K${new Intl.NumberFormat("en-ZM", { maximumFractionDigits: 2 }).format(price)}`;

const tierPresentation = (tier: SubscriptionTierDto) => TIER_PRESENTATION[tier.name.toUpperCase()] ?? { icon: Shield, accent: "gray" as const };

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "free";
}

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<SubscriptionTierDto[]>([]);
  const [currentTierID, setCurrentTierID] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [showInvoices, setShowInvoices] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const vendorId = user?.businessId;
      if (!vendorId) return;

      const [tierResult, subscriptionResult, invoiceResult] = await Promise.allSettled([
        billingService.listTiers(),
        billingService.getSubscription(vendorId),
        billingService.listInvoices(vendorId),
      ]);
      if (cancelled) return;

      if (tierResult.status === "fulfilled") {
        setTiers([...tierResult.value].sort((a, b) => a.display_order - b.display_order));
        setCatalogueError(null);
      } else {
        setTiers([]);
        setCatalogueError("Subscription plans are temporarily unavailable. Please try again shortly.");
      }

      if (subscriptionResult.status === "fulfilled") {
        setCurrentTierID(subscriptionResult.value.tier_id);
      } else {
        setCurrentTierID(null);
      }

      if (invoiceResult.status === "fulfilled") {
        setInvoices(invoiceResult.value.map((invoice) => ({
          id: invoice.invoice_number,
          date: new Date(invoice.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          amount: `${invoice.currency === "ZMW" ? "K" : invoice.currency}${invoice.amount.toFixed(2)}`,
          status: invoice.status === "PAID" ? "paid" : "free",
        })));
        setBillingError(null);
      } else {
        setInvoices([]);
        setBillingError("Unable to load billing history.");
      }
    })();
    return () => { cancelled = true; };
  }, [user?.businessId]);

  const current = currentTierID ? tiers.find((tier) => tier.id === currentTierID) : null;

  const explainTierAvailability = (tier: SubscriptionTierDto) => {
    if (tier.is_available) {
      toast.info(`${tier.name} is configured, but subscription activation is not available from this page yet.`);
      return;
    }
    toast.info(`${tier.name} is not commercially configured. Contact Printa to discuss availability.`);
  };

  return (
    <DashboardLayout pageTitle="Subscription">
      <div className="space-y-6">
        <div>
          <h1 className="dashboard-page-title">Subscription</h1>
          <p className="mt-0.5 text-xs text-gray-400">Manage your plan and billing</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gray-900 p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-white/50">Your plan</p>
              <h2 className="text-xl font-bold">{current ? current.name : "No active plan"}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{current ? formatMonthlyPrice(current.monthly_price) : "—"}</p>
              {current && <p className="text-[11px] text-white/40">/mo</p>}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-white/10 px-3 py-1">{current ? "Subscription active" : "No subscription record"}</span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300">
              <Check size={10} />
              {current ? "Active" : "Not configured"}
            </span>
          </div>
        </motion.div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Plan catalogue</h3>
          <p className="mb-3 text-xs text-gray-500">Only tiers configured in the billing service can be activated. The catalogue does not collect payment details.</p>
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {tiers.map((tier, index) => {
              const isCurrent = tier.id === currentTierID;
              const { icon: Icon, accent } = tierPresentation(tier);
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className={`flex min-w-[280px] snap-center flex-col overflow-hidden rounded-2xl border bg-white md:min-w-0 ${isCurrent ? "border-gray-900 ring-1 ring-gray-900/10" : "border-gray-100"}`}
                >
                  <div className="p-4 pb-3">
                    <div className="mb-3 flex items-center gap-2">
                      <div className={`rounded-xl p-1.5 ${accent === "red" ? "bg-printa-red/10 text-printa-red" : accent === "amber" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"}`}>
                        <Icon size={14} />
                      </div>
                      <span className="text-xs font-semibold text-gray-900">{tier.name}</span>
                      {tier.is_popular && <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-printa-red px-2 py-0.5 text-[9px] font-bold uppercase text-white">Popular</span>}
                      {isCurrent && <span className="ml-auto text-[10px] font-semibold text-gray-400">Current</span>}
                    </div>
                    <div className="mb-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">{formatMonthlyPrice(tier.monthly_price)}</span>
                      <span className="text-xs text-gray-400">/mo</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{tier.description}</p>
                  </div>

                  <div className="flex-1 px-4 pb-4">
                    <div className="space-y-2">
                      {tier.features.map((feature) => (
                        <div key={feature.text} className="flex items-center gap-2 text-xs">
                          {feature.included ? <Check size={12} className="shrink-0 text-emerald-500" /> : <X size={12} className="shrink-0 text-gray-200" />}
                          <span className={feature.included ? "text-gray-700" : "text-gray-300"}>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    {isCurrent ? (
                      <div className="w-full rounded-xl bg-gray-100 py-2.5 text-center text-xs font-semibold text-gray-400">Current plan</div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => explainTierAvailability(tier)}
                        className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-[0.97]"
                      >
                        {tier.is_available ? "Activation unavailable" : "Not available"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          {catalogueError && <p className="mt-3 text-center text-xs text-gray-400">{catalogueError}</p>}
          {!catalogueError && tiers.length === 0 && <p className="mt-3 text-center text-xs text-gray-400">No subscription plans are currently available.</p>}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowInvoices(!showInvoices)}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-100 p-2 text-gray-600"><Receipt size={16} /></div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Billing History</p>
                <p className="text-[11px] text-gray-400">{invoices.length} invoices</p>
              </div>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition ${showInvoices ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showInvoices && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                  {invoices.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">{billingError ?? "No invoices have been generated yet."}</div>
                  ) : invoices.map((invoice, index) => (
                    <div key={invoice.id} className={`flex items-center gap-3 px-4 py-3 ${index < invoices.length - 1 ? "border-b border-gray-50" : ""}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{invoice.amount}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${invoice.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"}`}>{invoice.status}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gray-400">{invoice.date}</p>
                      </div>
                      <button type="button" onClick={() => toast.error("Invoice document download is not configured yet.")} className="rounded-xl p-2 text-gray-300 transition hover:bg-gray-50 hover:text-gray-600" aria-label={`Download ${invoice.id}`}>
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/dashboard/payment-methods" className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-gray-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-2 text-gray-600"><CreditCard size={16} /></div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Payment Methods</p>
              <p className="text-[11px] text-gray-400">Payment-provider setup is not available yet</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-300" />
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
