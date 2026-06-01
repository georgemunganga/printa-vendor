import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Mail, PhoneCall } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api";
import {
  clearOnboardingComplete,
  clearOnboardingState,
} from "@/lib/vendorOnboardingState";
import { authService } from "@/services/auth.service";
import type { OtpChallengeResponseDto, OtpMethodDto } from "@/services/contracts";

type OTPRouteState = {
  mode?: "login" | "signup";
  challenge?: OtpChallengeResponseDto;
  contact?: string;
  method?: OtpMethodDto;
};

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOtpLogin } = useAuth();
  const state = (location.state || {}) as OTPRouteState;
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const deliveries = state.challenge?.deliveries?.filter((delivery) => delivery.status === "SENT") ?? [];
  const deliveryLabel = useMemo(() => {
    if (deliveries.length > 1) {
      return deliveries.map((delivery) => delivery.destination).join(" and ");
    }
    return state.contact || state.challenge?.destination || "your contact";
  }, [deliveries, state.challenge?.destination, state.contact]);

  const hasPhoneDelivery = deliveries.some((delivery) => delivery.method === "phone") || state.method === "phone";

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    if (!state.challenge?.challenge_id) {
      toast.error("Start again to request a new verification code");
      navigate("/login", { replace: true });
      return;
    }
    if (code.length !== 6) {
      toast.error("Enter the 6-digit verification code");
      return;
    }

    try {
      setIsVerifying(true);
      const session = await authService.verifyOtp({
        challenge_id: state.challenge.challenge_id,
        code,
      });
      await completeOtpLogin(session.token, session.token_type);
      if (state.mode === "signup") {
        clearOnboardingState();
        clearOnboardingComplete();
      }
      toast.success(state.mode === "signup" ? "Account created successfully" : "Logged in successfully");
      navigate("/dashboard/stores", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to verify code"));
    } finally {
      setIsVerifying(false);
    }
  };

  if (!state.challenge?.challenge_id) {
    return (
      <AuthLayout>
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-gray-500 mb-6 hover:text-gray-700 transition-colors"
          onClick={() => navigate("/login", { replace: true })}
        >
          <ArrowLeft size={16} />
          Back to login
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Request a code</h1>
          <p className="text-sm text-gray-500">Start from login or sign up to receive a verification code.</p>
        </div>

        <Button
          type="button"
          className="w-full bg-printa-red hover:bg-red-700 text-white rounded-xl h-11 text-sm font-bold"
          onClick={() => navigate("/login", { replace: true })}
        >
          Continue to Login
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <button
        type="button"
        className="flex items-center gap-2 text-sm text-gray-500 mb-6 hover:text-gray-700 transition-colors"
        onClick={() => navigate(state.mode === "signup" ? "/signup" : "/login", { replace: true })}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-printa-red">
          {hasPhoneDelivery ? <PhoneCall size={20} /> : <Mail size={20} />}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Enter verification code</h1>
        <p className="text-sm text-gray-500">We sent a 6-digit code to {deliveryLabel}.</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <InputOTP maxLength={6} value={code} onChange={setCode} containerClassName="justify-center">
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} className="h-11 w-11 text-base" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <Button
          type="submit"
          disabled={isVerifying}
          className="w-full bg-printa-red hover:bg-red-700 text-white rounded-xl h-11 text-sm font-bold"
        >
          {isVerifying ? "Verifying..." : "Verify and Continue"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default OTPVerificationPage;
