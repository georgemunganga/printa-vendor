import React, { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, CreditCard, Crown, Download, Gem, Loader2, Receipt, RefreshCw, Shield, Smartphone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { billingService, type SubscriptionCheckoutDto, type SubscriptionTierDto } from "@/services/billing.service";

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
  const [checkout, setCheckout] = useState<SubscriptionCheckoutDto | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState<"airtel" | "mtn" | "zamtel">("mtn");
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [requestingCollection, setRequestingCollection] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [collectionRequested, setCollectionRequested] = useState(false);

  const loadBilling = useCallback(async () => {
    const vendorId = user?.businessId;
    if (!vendorId) return;

    const [tierResult, subscriptionResult, invoiceResult] = await Promise.allSettled([
      billingService.listTiers(),
      billingService.getSubscription(vendorId),
      billingService.listInvoices(vendorId),
    ]);

    if (tierResult.status === "fulfilled") {
      setTiers([...tierResult.value].sort((a, b) => a.display_order - b.display_order));
      setCatalogueError(null);
    } else {
      setTiers([]);
      setCatalogueError("Subscription plans are temporarily unavailable. Please try again shortly.");
    }
    setCurrentTierID(subscriptionResult.status === "fulfilled" ? subscriptionResult.value.tier_id : null);

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
  }, [user?.businessId]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  const current = currentTierID ? tiers.find((tier) => tier.id === currentTierID) : null;

  const completeCheckout = useCallback((updated: SubscriptionCheckoutDto) => {
    setCheckout(updated);
    setCheckoutOpen(false);
    setCollectionRequested(false);
    toast.success("Subscription activated. Your plan is now active.");
    void loadBilling();
  }, [loadBilling]);

  useEffect(() => {
    if (!checkoutOpen || !checkout || checkout.status !== "PENDING" || !collectionRequested) return;
    const timer = window.setInterval(() => {
      void billingService.verifyCheckout(checkout.id).then((updated) => {
        setCheckout(updated);
        if (updated.status === "SUCCESSFUL") completeCheckout(updated);
      }).catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [checkout, checkoutOpen, collectionRequested, completeCheckout]);

  const startTierCheckout = async (tier: SubscriptionTierDto) => {
    if (!tier.is_available) {
      toast.info(`${tier.name} is not commercially configured. Contact Printa to discuss availability.`);
      return;
    }
    setCreatingCheckout(true);
    try {
      const session = await billingService.createCheckout(tier.id);
      setCheckout(session.checkout);
      setCollectionRequested(Boolean(session.checkout.provider_collection_id));
      setCheckoutOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to prepare your subscription payment. Please try again.");
    } finally {
      setCreatingCheckout(false);
    }
  };

  const requestMobileMoneyCollection = async () => {
    if (!checkout) return;
    const normalizedPhone = phone.replace(/[\s()-]/g, "").replace(/^\+/, "");
    if (!/^\d{9,15}$/.test(normalizedPhone)) {
      toast.error("Enter a valid mobile-money phone number.");
      return;
    }
    setRequestingCollection(true);
    try {
      const updated = await billingService.initiateMobileMoneyCollection(checkout.id, { phone: normalizedPhone, operator });
      setCheckout(updated);
      if (updated.status === "SUCCESSFUL") {
        completeCheckout(updated);
      } else if (updated.status === "FAILED") {
        toast.error(updated.failure_reason || "The payment request was not completed. Please try again.");
      } else {
        setCollectionRequested(true);
        toast.success("Approval request sent. Confirm it on your mobile phone to continue.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send a mobile-money approval request.");
    } finally {
      setRequestingCollection(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!checkout) return;
    setCheckingPayment(true);
    try {
      const updated = await billingService.verifyCheckout(checkout.id);
      setCheckout(updated);
      if (updated.status === "SUCCESSFUL") {
        completeCheckout(updated);
      } else if (updated.status === "FAILED") {
        toast.error(updated.failure_reason || "The payment was not completed. You can try again from the plan catalogue.");
      } else {
        toast.info("Payment approval is still pending. Confirm the request on your mobile phone, then check again.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to check payment status. Please try again.");
    } finally {
      setCheckingPayment(false);
    }
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
          <p className="mb-3 text-xs text-gray-500">Select a configured plan to pay securely with mobile money. Your plan price is confirmed by Printa before the payment request is sent.</p>
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
                        disabled={creatingCheckout}
                        onClick={() => void startTierCheckout(tier)}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${tier.is_available ? "bg-printa-red text-white hover:bg-printa-red/90" : "border border-gray-200 text-gray-400"}`}
                      >
                        {creatingCheckout && tier.is_available ? <Loader2 size={14} className="animate-spin" /> : null}
                        {tier.is_available ? "Subscribe" : "Not available"}
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

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md border-gray-100 p-0">
          <div className="p-6">
            <DialogHeader className="text-left">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-printa-red/10 text-printa-red"><Smartphone size={18} /></div>
              <DialogTitle className="text-xl text-gray-900">Pay for {checkout?.tier_name ?? "your"} plan</DialogTitle>
              <DialogDescription className="text-left text-xs leading-5 text-gray-500">Printa will send an approval request to your mobile money number. Confirm it on your phone to activate the subscription.</DialogDescription>
            </DialogHeader>

            {checkout && <div className="mt-5 rounded-xl bg-gray-50 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Subscription payment</p><p className="mt-1 text-sm font-semibold text-gray-900">{checkout.tier_name} · monthly</p></div><p className="text-lg font-bold text-gray-900">{formatMonthlyPrice(checkout.amount)}</p></div></div>}

            {checkout?.status === "PENDING" && !collectionRequested && <div className="mt-5 space-y-3">
              <label className="block text-xs font-semibold text-gray-700" htmlFor="subscription-phone">Mobile money number</label>
              <input id="subscription-phone" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0977 433 571" className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-printa-red focus:ring-2 focus:ring-printa-red/10" />
              <label className="block text-xs font-semibold text-gray-700" htmlFor="subscription-operator">Mobile money network</label>
              <select id="subscription-operator" value={operator} onChange={(event) => setOperator(event.target.value as "airtel" | "mtn" | "zamtel")} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-printa-red focus:ring-2 focus:ring-printa-red/10"><option value="mtn">MTN</option><option value="airtel">Airtel</option><option value="zamtel">Zamtel</option></select>
              <p className="text-[11px] leading-4 text-gray-400">Your number is used only to request this subscription payment. Printa does not store card details in the portal.</p>
              <button type="button" disabled={requestingCollection} onClick={() => void requestMobileMoneyCollection()} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-printa-red text-sm font-semibold text-white transition hover:bg-printa-red/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60">{requestingCollection ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}{requestingCollection ? "Sending request..." : "Send approval request"}</button>
            </div>}

            {checkout?.status === "PENDING" && collectionRequested && <div className="mt-5 space-y-4"><div className="rounded-xl border border-amber-100 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-900">Awaiting your mobile approval</p><p className="mt-1 text-xs leading-5 text-amber-800">Confirm the payment prompt on your mobile phone. This screen will check for confirmation automatically while it is open.</p></div><button type="button" disabled={checkingPayment} onClick={() => void checkPaymentStatus()} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-printa-red text-sm font-semibold text-white transition hover:bg-printa-red/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60">{checkingPayment ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}{checkingPayment ? "Checking payment..." : "I have approved — check status"}</button></div>}

            {checkout?.status === "FAILED" && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-xs leading-5 text-red-800">{checkout.failure_reason || "This payment request was not completed. Close this sheet and select the plan again to try a new request."}</div>}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
