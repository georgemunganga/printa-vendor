import React, { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Crown,
  Download,
  Gem,
  Receipt,
  Shield,
  Smartphone,
  Star,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─── Data ─── */

const TIERS = [
  {
    id: "core",
    name: "Core",
    icon: Shield,
    price: "Free",
    priceNum: "K0",
    period: "/mo",
    desc: "For getting started",
    accent: "gray",
    features: [
      { text: "20 jobs/day", included: true },
      { text: "3 team members", included: true },
      { text: "Standard routing", included: true },
      { text: "Basic reporting", included: true },
      { text: "Priority routing", included: false },
      { text: "SLA guarantees", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Gem,
    price: "K150",
    priceNum: "K150",
    period: "/mo",
    desc: "Scale your business",
    accent: "red",
    popular: true,
    features: [
      { text: "100 jobs/day", included: true },
      { text: "10 team members", included: true },
      { text: "Priority routing", included: true },
      { text: "Advanced reporting", included: true },
      { text: "2-hour handoff SLA", included: true },
      { text: "Bulk price updates", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    price: "K500",
    priceNum: "K500",
    period: "/mo",
    desc: "High-volume operations",
    accent: "amber",
    features: [
      { text: "Unlimited jobs/day", included: true },
      { text: "Unlimited team", included: true },
      { text: "Highest priority", included: true },
      { text: "Custom SLA", included: true },
      { text: "Account manager", included: true },
      { text: "API access", included: true },
    ],
  },
] as const;

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "free";
}

const INVOICES: Invoice[] = [
  { id: "INV-2026-02", date: "Feb 15, 2026", amount: "K150", status: "paid" },
  { id: "INV-2026-01", date: "Jan 15, 2026", amount: "K150", status: "paid" },
  { id: "INV-2025-12", date: "Dec 15, 2025", amount: "K150", status: "paid" },
  { id: "INV-2025-11", date: "Nov 15, 2025", amount: "K150", status: "paid" },
  { id: "INV-2025-10", date: "Oct 15, 2025", amount: "K0", status: "free" },
  { id: "INV-2025-09", date: "Sep 15, 2025", amount: "K0", status: "free" },
];

const MOBILE_NETWORKS = ["MTN", "Airtel", "Zamtel"];

/* ─── Page ─── */

const SubscriptionPage: React.FC = () => {
  const [currentTier] = useState("pro");
  const [changeTo, setChangeTo] = useState<string | null>(null);
  const [showInvoices, setShowInvoices] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "card" | null>(null);
  const [mobileNetwork, setMobileNetwork] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [pin, setPin] = useState("");

  const current = TIERS.find((t) => t.id === currentTier)!;
  const target = changeTo ? TIERS.find((t) => t.id === changeTo) : null;
  const isUpgrade = target
    ? TIERS.findIndex((t) => t.id === changeTo) > TIERS.findIndex((t) => t.id === currentTier)
    : false;

  const resetWizard = () => {
    setWizardStep(1);
    setPaymentMethod(null);
    setMobileNetwork("");
    setMobileNumber("");
    setPin("");
  };

  const handleClose = () => {
    setChangeTo(null);
    setTimeout(resetWizard, 300);
  };

  const handleNext = () => {
    if (wizardStep === 1) {
      setWizardStep(2);
    } else if (wizardStep === 2) {
      if (!paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }
      setWizardStep(3);
    } else if (wizardStep === 3) {
      if (paymentMethod === "mobile" && (!mobileNetwork || !mobileNumber)) {
        toast.error("Please fill in all fields");
        return;
      }
      setWizardStep(4);
      // Simulate sending PIN
      toast.info("PIN sent to your phone");
    } else if (wizardStep === 4) {
      if (!pin || pin.length !== 4) {
        toast.error("Please enter a 4-digit PIN");
        return;
      }
      setWizardStep(5);
    }
  };

  const handleFinish = () => {
    handleClose();
    toast.success(`Successfully switched to ${target?.name}!`);
  };

  return (
    <DashboardLayout pageTitle="Subscription">
      <div className="space-y-6">
        {/* Page heading */}
        <div>
          <h1 className="dashboard-page-title">Subscription</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage your plan and billing
          </p>
        </div>

        {/* ── Current plan pill ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gray-900 p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-white/50 mb-1">
                Your plan
              </p>
              <h2 className="text-xl font-bold">{current.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{current.price}</p>
              {current.period && (
                <p className="text-[11px] text-white/40">{current.period}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-white/10 px-3 py-1">
              Renews Mar 15
            </span>
            <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 flex items-center gap-1">
              <Check size={10} />
              Active
            </span>
          </div>
        </motion.div>

        {/* ── Plan cards (swipeable on mobile) ── */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Choose a plan
          </h3>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
            {TIERS.map((tier, i) => {
              const isCurrent = tier.id === currentTier;
              const Icon = tier.icon;
              const tierIdx = TIERS.findIndex((t) => t.id === tier.id);
              const currentIdx = TIERS.findIndex((t) => t.id === currentTier);

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`snap-center min-w-[280px] md:min-w-0 rounded-2xl border bg-white overflow-hidden flex flex-col ${
                    isCurrent
                      ? "border-gray-900 ring-1 ring-gray-900/10"
                      : "border-gray-100"
                  }`}
                >
                  {/* Tier header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`p-1.5 rounded-xl ${
                          tier.accent === "red"
                            ? "bg-printa-red/10 text-printa-red"
                            : tier.accent === "amber"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon size={14} />
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        {tier.name}
                      </span>
                      {tier.popular && (
                        <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-printa-red px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                          <Star size={8} />
                          Popular
                        </span>
                      )}
                      {isCurrent && !tier.popular && (
                        <span className="ml-auto text-[10px] font-semibold text-gray-400">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span className="text-xs text-gray-400">
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{tier.desc}</p>
                  </div>

                  {/* Features */}
                  <div className="px-4 pb-4 flex-1">
                    <div className="space-y-2">
                      {tier.features.map((f) => (
                        <div
                          key={f.text}
                          className="flex items-center gap-2 text-xs"
                        >
                          {f.included ? (
                            <Check
                              size={12}
                              className="text-emerald-500 flex-shrink-0"
                            />
                          ) : (
                            <X
                              size={12}
                              className="text-gray-200 flex-shrink-0"
                            />
                          )}
                          <span
                            className={
                              f.included ? "text-gray-700" : "text-gray-300"
                            }
                          >
                            {f.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="p-4 pt-0">
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-xl bg-gray-100 text-center text-xs font-semibold text-gray-400">
                        Current plan
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setChangeTo(tier.id);
                          setWizardStep(1);
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.97] ${
                          tierIdx > currentIdx
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {tierIdx > currentIdx ? "Upgrade" : "Downgrade"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Billing section ── */}
        <div>
          <button
            type="button"
            onClick={() => setShowInvoices(!showInvoices)}
            className="w-full flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-4 transition hover:border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gray-100 text-gray-600">
                <Receipt size={16} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  Billing History
                </p>
                <p className="text-[11px] text-gray-400">
                  {INVOICES.length} invoices
                </p>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition ${
                showInvoices ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {showInvoices && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 rounded-2xl bg-white border border-gray-100 overflow-hidden">
                  {INVOICES.map((inv, i) => (
                    <div
                      key={inv.id}
                      className={`flex items-center gap-3 px-4 py-3 ${
                        i < INVOICES.length - 1 ? "border-b border-gray-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {inv.amount}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                              inv.status === "paid"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-50 text-gray-400"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {inv.date}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          toast.success(`Downloading ${inv.id}...`)
                        }
                        className="p-2 rounded-xl text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Payment methods link ── */}
        <Link
          to="/dashboard/payment-methods"
          className="flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-4 transition hover:border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-100 text-gray-600">
              <CreditCard size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Payment Methods
              </p>
              <p className="text-[11px] text-gray-400">
                Cards, M-Pesa, Wallet
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-300" />
        </Link>
      </div>

      {/* ── Wizard Modal/Bottom Sheet ── */}
      <ResponsiveModal open={changeTo !== null} onOpenChange={(open) => !open && handleClose()}>
        {/* Step progress bar */}
        {target && wizardStep < 5 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        wizardStep === step
                          ? "bg-gray-900 text-white scale-110 shadow-lg shadow-gray-900/20"
                          : wizardStep > step
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {wizardStep > step ? <Check size={14} /> : step}
                    </div>
                    <span className={`text-[9px] font-medium hidden sm:block ${
                      wizardStep >= step ? "text-gray-700" : "text-gray-300"
                    }`}>
                      {step === 1 ? "Plan" : step === 2 ? "Method" : step === 3 ? "Details" : "Confirm"}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                      wizardStep > step ? "bg-emerald-500" : "bg-gray-100"
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Acknowledge */}
          {wizardStep === 1 && target && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-3 ${
                  isUpgrade ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {isUpgrade ? <Sparkles size={10} /> : <ArrowRight size={10} />}
                  {isUpgrade ? "Upgrade" : "Downgrade"}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Switch to {target.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Review what's included in your new plan
                </p>
              </div>

              <div className="flex items-center gap-3 justify-center py-3">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-2">
                    <current.icon size={22} className="text-gray-400" />
                  </div>
                  <p className="text-xs font-bold text-gray-900">{current.name}</p>
                  <p className="text-[11px] text-gray-400">{current.price}{current.period}</p>
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isUpgrade ? "bg-emerald-50" : "bg-gray-50"
                }`}>
                  <ArrowRight size={14} className={isUpgrade ? "text-emerald-500" : "text-gray-400"} />
                </div>

                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg ${
                    isUpgrade ? "bg-gray-900 text-white shadow-gray-900/20" : "bg-gray-100 text-gray-500"
                  }`}>
                    <target.icon size={22} />
                  </div>
                  <p className="text-xs font-bold text-gray-900">{target.name}</p>
                  <p className="text-[11px] font-semibold text-printa-red">{target.price}{target.period}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">What you get</p>
                {target.features.filter(f => f.included).map((f) => (
                  <div key={f.text} className="flex items-center gap-2.5 text-xs text-gray-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-emerald-600" />
                    </div>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>

              <Button onClick={handleNext} className="w-full rounded-xl bg-gray-900 h-12 text-sm font-semibold">
                Continue to Payment
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Payment Options */}
          {wizardStep === 2 && target && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Payment Method
                </h3>
                <p className="text-sm text-gray-500">
                  How would you like to pay?
                </p>
              </div>

              {/* Amount summary */}
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount due</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{target.price}<span className="text-xs text-gray-400 font-normal">{target.period}</span></p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-gray-100">
                  <target.icon size={18} className="text-gray-500" />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mobile")}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === "mobile"
                      ? "border-gray-900 bg-gray-900/[0.02] shadow-sm"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    paymentMethod === "mobile" ? "bg-printa-red text-white" : "bg-printa-red/10 text-printa-red"
                  }`}>
                    <Smartphone size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900">Mobile Money</p>
                    <p className="text-xs text-gray-400">MTN, Airtel, Zamtel</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    paymentMethod === "mobile" ? "border-gray-900 bg-gray-900" : "border-gray-300"
                  }`}>
                    {paymentMethod === "mobile" && <Check size={12} className="text-white" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-gray-900 bg-gray-900/[0.02] shadow-sm"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    paymentMethod === "card" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                  }`}>
                    <CreditCard size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900">Credit/Debit Card</p>
                    <p className="text-xs text-gray-400">Visa, Mastercard</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    paymentMethod === "card" ? "border-gray-900 bg-gray-900" : "border-gray-300"
                  }`}>
                    {paymentMethod === "card" && <Check size={12} className="text-white" />}
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setWizardStep(1)} className="rounded-xl h-12 px-5">
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!paymentMethod} className="flex-1 rounded-xl bg-gray-900 h-12 text-sm font-semibold">
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Details */}
          {wizardStep === 3 && target && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${
                  paymentMethod === "mobile" ? "bg-printa-red/10" : "bg-blue-50"
                }`}>
                  {paymentMethod === "mobile" ? (
                    <Smartphone size={20} className="text-printa-red" />
                  ) : (
                    <CreditCard size={20} className="text-blue-600" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {paymentMethod === "mobile" ? "Mobile Money" : "Card"} Details
                </h3>
                <p className="text-sm text-gray-500">
                  Enter your payment information
                </p>
              </div>

              {paymentMethod === "mobile" ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Network</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {MOBILE_NETWORKS.map((network) => (
                        <button
                          key={network}
                          type="button"
                          onClick={() => setMobileNetwork(network)}
                          className={`py-3 rounded-xl text-xs font-semibold transition-all ${
                            mobileNetwork === network
                              ? "bg-gray-900 text-white shadow-lg shadow-gray-900/10"
                              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {network}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mobile-number" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone Number</Label>
                    <Input
                      id="mobile-number"
                      type="tel"
                      placeholder="0XX XXX XXXX"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="mt-2 rounded-xl h-12"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card-number" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Card Number</Label>
                    <Input
                      id="card-number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 rounded-xl h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiry" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expiry</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        className="mt-2 rounded-xl h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-xs font-semibold uppercase tracking-wider text-gray-500">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        className="mt-2 rounded-xl h-12"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment summary */}
              <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">You'll be charged</span>
                <span className="text-sm font-bold text-gray-900">{target.price}{target.period}</span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setWizardStep(2)} className="rounded-xl h-12 px-5">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1 rounded-xl bg-gray-900 h-12 text-sm font-semibold">
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: PIN Confirmation */}
          {wizardStep === 4 && target && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 mb-3">
                  <Shield size={22} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Confirm Payment
                </h3>
                <p className="text-sm text-gray-500">
                  Enter the 4-digit PIN sent to your phone
                </p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Smartphone size={14} className="text-blue-600" />
                </div>
                <p className="text-xs text-blue-700">
                  PIN sent to <span className="font-semibold">{paymentMethod === "mobile" ? mobileNumber : "your phone"}</span>
                </p>
              </div>

              <div>
                <Input
                  id="pin"
                  type="text"
                  maxLength={4}
                  placeholder="0  0  0  0"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="rounded-xl text-center text-3xl tracking-[0.5em] h-16 font-bold"
                />
              </div>

              <button type="button" className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition">
                Didn't receive a PIN? <span className="font-semibold text-printa-red">Resend</span>
              </button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setWizardStep(3)} className="rounded-xl h-12 px-5">
                  Back
                </Button>
                <Button onClick={handleNext} disabled={pin.length !== 4} className="flex-1 rounded-xl bg-gray-900 h-12 text-sm font-semibold">
                  Verify & Pay {target.price}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {wizardStep === 5 && target && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                >
                  <Check size={36} className="text-emerald-600" strokeWidth={3} />
                </motion.div>
              </motion.div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-sm text-gray-500">
                  You're now on the <span className="font-semibold text-gray-900">{target.name}</span> plan
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Plan</span>
                  <span className="text-sm font-semibold text-gray-900">{target.name}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Amount</span>
                  <span className="text-sm font-bold text-gray-900">{target.price}<span className="text-xs text-gray-400 font-normal">{target.period}</span></span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Next billing</span>
                  <span className="text-sm font-medium text-gray-900">Apr 15, 2026</span>
                </div>
              </div>

              <Button onClick={handleFinish} className="w-full rounded-xl bg-gray-900 h-12 text-sm font-semibold">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveModal>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
