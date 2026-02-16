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
    price: "Custom",
    priceNum: "Custom",
    period: "",
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
      if (changeTo === "enterprise") {
        toast.success("We'll contact you within 24 hours");
        handleClose();
      } else {
        setWizardStep(2);
      }
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
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {isUpgrade ? "Upgrade" : "Downgrade"} to {target.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Confirm your plan change
                </p>
              </div>

              <div className="flex items-center gap-4 justify-center py-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <current.icon size={20} className="text-gray-500" />
                  </div>
                  <p className="text-xs font-bold text-gray-900">{current.name}</p>
                  <p className="text-[11px] text-gray-400">{current.price}{current.period}</p>
                </div>

                <ArrowRight size={16} className={isUpgrade ? "text-emerald-500" : "text-gray-300"} />

                <div className="text-center">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                    isUpgrade ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <target.icon size={20} />
                  </div>
                  <p className="text-xs font-bold text-gray-900">{target.name}</p>
                  <p className="text-[11px] text-gray-400">{target.price}{target.period}</p>
                </div>
              </div>

              <div className="space-y-2">
                {target.features.filter(f => f.included).map((f) => (
                  <div key={f.text} className="flex items-center gap-2 text-xs text-gray-600">
                    <Check size={12} className="text-emerald-500 flex-shrink-0" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>

              <Button onClick={handleNext} className="w-full rounded-xl bg-gray-900">
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Payment Options */}
          {wizardStep === 2 && (
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
                  Choose how to pay
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mobile")}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                    paymentMethod === "mobile"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-printa-red/10 text-printa-red">
                    <Smartphone size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900">Mobile Money</p>
                    <p className="text-xs text-gray-400">MTN, Airtel, Zamtel</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "mobile" ? "border-gray-900 bg-gray-900" : "border-gray-300"
                  }`}>
                    {paymentMethod === "mobile" && <Check size={12} className="text-white" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                    paymentMethod === "card"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <CreditCard size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900">Credit/Debit Card</p>
                    <p className="text-xs text-gray-400">Visa, Mastercard</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "card" ? "border-gray-900 bg-gray-900" : "border-gray-300"
                  }`}>
                    {paymentMethod === "card" && <Check size={12} className="text-white" />}
                  </div>
                </button>
              </div>

              <Button onClick={handleNext} disabled={!paymentMethod} className="w-full rounded-xl bg-gray-900">
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 3: Payment Details */}
          {wizardStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
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
                    <Label className="text-sm font-medium">Network</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {MOBILE_NETWORKS.map((network) => (
                        <button
                          key={network}
                          type="button"
                          onClick={() => setMobileNetwork(network)}
                          className={`py-2.5 rounded-xl text-xs font-semibold transition ${
                            mobileNetwork === network
                              ? "bg-gray-900 text-white"
                              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {network}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mobile-number" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="mobile-number"
                      type="tel"
                      placeholder="0XX XXX XXXX"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="mt-2 rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card-number" className="text-sm font-medium">Card Number</Label>
                    <Input
                      id="card-number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiry" className="text-sm font-medium">Expiry</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        className="mt-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        className="mt-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleNext} className="w-full rounded-xl bg-gray-900">
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 4: PIN Confirmation */}
          {wizardStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Confirm Payment
                </h3>
                <p className="text-sm text-gray-500">
                  Enter the PIN we sent to your phone
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-700">
                  We sent a 4-digit PIN to {paymentMethod === "mobile" ? mobileNumber : "your phone"}
                </p>
              </div>

              <div>
                <Label htmlFor="pin" className="text-sm font-medium">PIN</Label>
                <Input
                  id="pin"
                  type="text"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 rounded-xl text-center text-2xl tracking-widest"
                />
              </div>

              <Button onClick={handleNext} disabled={pin.length !== 4} className="w-full rounded-xl bg-gray-900">
                Verify & Pay
              </Button>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {wizardStep === 5 && target && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-5 text-center py-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Sparkles size={32} className="text-emerald-600" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Congratulations!
                </h3>
                <p className="text-sm text-gray-600">
                  You've been successfully {isUpgrade ? "upgraded" : "downgraded"} to the <strong>{target.name}</strong> plan
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Your new plan</p>
                <p className="text-2xl font-bold text-gray-900">{target.price}<span className="text-sm text-gray-400">{target.period}</span></p>
                <p className="text-xs text-gray-400 mt-1">Renews on Apr 15, 2026</p>
              </div>

              <Button onClick={handleFinish} className="w-full rounded-xl bg-gray-900">
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
