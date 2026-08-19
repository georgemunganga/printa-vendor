import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, CreditCard, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  operatingStatusService,
  type VendorOperatingBlockReason,
  type VendorOperatingStatusDto,
} from "@/services/operating-status.service";

const blockCopy: Record<VendorOperatingBlockReason, { title: string; body: string }> = {
  COMPLIANCE_APPROVAL_REQUIRED: {
    title: "Vendor approval is pending",
    body: "Your business is awaiting Printa’s approval. Vendor operations will unlock once the review is approved.",
  },
  COMPLIANCE_APPROVAL_REJECTED: {
    title: "Vendor approval needs attention",
    body: "Your vendor approval was not completed. Review the decision details and contact support before attempting to operate your store.",
  },
  SUBSCRIPTION_PAYMENT_DUE: {
    title: "Your subscription payment is due",
    body: "Your subscription period has ended. Pay when collection is available, or request your one automatic five-day grace period if eligible.",
  },
  SUBSCRIPTION_REQUIRED: {
    title: "A subscription is required",
    body: "Your vendor profile does not yet have a recorded subscription. Contact support to complete subscription setup.",
  },
  SUBSCRIPTION_INACTIVE: {
    title: "Your subscription is inactive",
    body: "Your subscription is not active. Contact support to restore subscription access.",
  },
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

export const VendorOperatingStatusOverlay: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState<VendorOperatingStatusDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingGrace, setIsRequestingGrace] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.businessId) {
      setStatus(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await operatingStatusService.get();
      setStatus(response);
      setError(null);
    } catch (requestError) {
      setStatus(null);
      setError(requestError instanceof Error ? requestError.message : "Unable to verify vendor operating status.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.businessId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const normalizedPath = location.pathname.replace(/\/$/, "");
  const isDashboardHome = normalizedPath === "/dashboard";
  const isStoresRoute = normalizedPath === "/dashboard/stores";

  useEffect(() => {
    if (isStoresRoute && status && !status.operational) {
      navigate("/dashboard", { replace: true });
    }
  }, [isStoresRoute, navigate, status]);

  const requestGrace = async () => {
    setIsRequestingGrace(true);
    try {
      const result = await operatingStatusService.requestGrace();
      setStatus(result.status);
      if (!result.granted) {
        setError("A new grace period was not available for this subscription period.");
      } else {
        setError(null);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to request the grace period.");
    } finally {
      setIsRequestingGrace(false);
    }
  };

  if (!user?.businessId || (status?.operational && !error)) return null;

  const reasons = status?.blocking_reasons ?? [];
  const hasSubscriptionBlock = reasons.some((reason) => reason.startsWith("SUBSCRIPTION_"));
  const showBlockingOverlay = Boolean(status && !status.operational);

  // The dashboard home is the single location for this notice. Navigation remains available so
  // vendors can resolve their account requirements; protected operational APIs stay enforced by
  // the server on every route.
  if (!isDashboardHome) return null;
  if (!showBlockingOverlay && !error) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-[2px]">
      <section aria-live="assertive" className="w-full max-w-xl rounded-3xl border border-white/70 bg-white p-6 shadow-2xl shadow-slate-900/25 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-printa-red">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-printa-red">Vendor operations paused</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">Action is required before you can continue.</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">Printa has temporarily paused operational actions for the reasons below. Your account remains visible, but the pause cannot be dismissed until the server confirms the requirements have been resolved.</p>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {error}
            <Button type="button" variant="link" className="h-auto px-1 text-amber-900" onClick={() => void refresh()} disabled={isLoading}>Retry status check</Button>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {reasons.map((reason) => {
            const copy = blockCopy[reason];
            if (!copy) return null;
            const compliance = reason.startsWith("COMPLIANCE");
            const Icon = compliance ? ShieldCheck : CreditCard;
            return (
              <div key={reason} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0 text-gray-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{copy.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-gray-600">{copy.body}</p>
                    {reason === "COMPLIANCE_APPROVAL_REJECTED" && status?.compliance.decision_reason && (
                      <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs text-gray-700">Review note: {status.compliance.decision_reason}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {status?.grace_period && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <Clock3 size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm leading-5">Your subscription grace period is active until <strong>{formatDate(status.grace_period.ends_at)}</strong>. Subscription payment is still required; any other block remains in force.</p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard/support")}>Contact support</Button>
          {hasSubscriptionBlock && (
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/subscription")}>Manage subscription</Button>
          )}
          {status?.grace_eligible && (
            <Button type="button" className="bg-printa-red text-white hover:bg-printa-red/90" onClick={() => void requestGrace()} disabled={isRequestingGrace}>
              {isRequestingGrace ? "Requesting grace…" : "Request 5-day grace period"}
            </Button>
          )}
          {status?.payment.available && status.payment.url && (
            <Button type="button" className="bg-printa-red text-white hover:bg-printa-red/90" onClick={() => window.location.assign(status.payment.url!)}>Pay subscription</Button>
          )}
        </div>

        {status?.payment.message && (
          <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-gray-500"><CheckCircle2 size={14} /> {status.payment.message}</p>
        )}
      </section>
    </div>
  );
};
