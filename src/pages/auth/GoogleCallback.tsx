import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api";
import { clearOnboardingComplete, clearOnboardingState, isOnboardingComplete } from "@/lib/vendorOnboardingState";
import { completePendingVendorOnboarding } from "@/services/vendor-onboarding-completion.service";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { completeOAuthLogin, updateUser } = useAuth();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const oauthError = params.get("error");
      if (oauthError) {
        toast.error(oauthError);
        navigate("/signup", { replace: true });
        return;
      }
      const token = params.get("token");
      const tokenType = params.get("token_type") || "Bearer";
      if (!token) {
        toast.error("Google authentication did not return a session.");
        navigate("/login", { replace: true });
        return;
      }
      try {
        await completeOAuthLogin(token, tokenType);
        if (isOnboardingComplete()) {
          try {
            const vendor = await completePendingVendorOnboarding();
            updateUser({ businessId: vendor.id, businessName: vendor.business_name });
            clearOnboardingState();
            clearOnboardingComplete();
          } catch (error) {
            if (!cancelled) {
              toast.error(getApiErrorMessage(error, "Your account is ready, but we could not create the business and first store yet."));
              navigate("/onboarding", { replace: true });
            }
            return;
          }
        }
        if (!cancelled) {
          window.history.replaceState(null, "", "/auth/google/callback");
          toast.success("Logged in with Google");
          navigate("/dashboard/stores", { replace: true });
        }
      } catch {
        if (!cancelled) {
          toast.error("Unable to complete Google login.");
          navigate("/login", { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [completeOAuthLogin, navigate, updateUser]);

  return (
    <AuthLayout>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Completing Google login</h1>
        <p className="text-sm text-gray-500">Please wait while Printa verifies your account.</p>
      </div>
    </AuthLayout>
  );
};

export default GoogleCallback;
