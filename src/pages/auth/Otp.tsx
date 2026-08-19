import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { getApiErrorMessage } from "@/lib/api";
import { clearOnboardingComplete, clearOnboardingState, isOnboardingComplete } from "@/lib/vendorOnboardingState";
import { completePendingVendorOnboarding } from "@/services/vendor-onboarding-completion.service";
import { authService } from "@/services/auth.service";
import type { OtpChallengeResponseDto, OtpMethodDto, OtpRequestDto } from "@/services/contracts";

const INPUT_LENGTH = 6;

type OTPRouteState = {
  mode?: "login" | "signup";
  challenge?: OtpChallengeResponseDto;
  contact?: string;
  method?: OtpMethodDto;
  requestPayload?: OtpRequestDto;
  resumeOnboarding?: boolean;
};

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOtpLogin, updateUser } = useAuth();
  const initialState = (location.state || {}) as OTPRouteState;
  const [challenge, setChallenge] = useState(initialState.challenge);
  const [otp, setOtp] = useState(Array(INPUT_LENGTH).fill(""));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const mode = initialState.mode;
  const isLoginFlow = mode === "login";
  const isSignupFlow = mode === "signup";
  const shouldCompletePendingOnboarding = isOnboardingComplete() && (isSignupFlow || initialState.resumeOnboarding === true);

  const deliveryLabel = useMemo(() => {
    const deliveries = challenge?.deliveries?.filter((delivery) => delivery.status === "SENT") ?? [];
    if (deliveries.length > 1) {
      return deliveries.map((delivery) => delivery.destination).join(" and ");
    }
    return initialState.contact || challenge?.destination || "your contact";
  }, [challenge?.deliveries, challenge?.destination, initialState.contact]);

  useEffect(() => {
    if ((!isLoginFlow && !isSignupFlow) || !challenge?.challenge_id) {
      toast.error("Invalid OTP session. Please login again.");
      navigate("/login", { replace: true });
      return;
    }
  }, [challenge?.challenge_id, isLoginFlow, isSignupFlow, navigate]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = window.setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timer]);

  const applyOtpDigits = (value: string, startIndex = 0) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return;

    const updatedOtp = [...otp];
    let nextIndex = startIndex

    for (const digit of digits) {
      if (nextIndex >= INPUT_LENGTH) break;
      updatedOtp[nextIndex] = digit;
      nextIndex += 1;
    }

    setOtp(updatedOtp);

    if (nextIndex >= INPUT_LENGTH) {
      inputRefs.current[INPUT_LENGTH - 1]?.focus();
      return;
    }
    inputRefs.current[nextIndex]?.focus();
  };

  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      const updatedOtp = [...otp];
      updatedOtp[index] = "";
      setOtp(updatedOtp);
      return;
    }

    applyOtpDigits(digits, index);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    event.preventDefault();
    applyOtpDigits(event.clipboardData.getData("text"), index);
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (!challenge?.challenge_id) {
      toast.error("Invalid OTP session. Please login again.");
      navigate("/login", { replace: true });
      return;
    }
    if (code.length !== INPUT_LENGTH) {
      toast.error("Enter the full 6-digit code");
      return;
    }

    try {
      setIsVerifying(true);
      const session = await authService.verifyOtp({
        challenge_id: challenge.challenge_id,
        code,
      });
      await completeOtpLogin(session.token, session.token_type);
      if (shouldCompletePendingOnboarding) {
        try {
          const vendor = await completePendingVendorOnboarding();
          updateUser({ businessId: vendor.id, businessName: vendor.business_name });
          clearOnboardingState();
          clearOnboardingComplete();
          toast.success("Your business and first store are ready.");
        } catch (error) {
          toast.error(getApiErrorMessage(error, "Your account is ready, but we could not create the business and first store yet."));
          navigate("/onboarding", { replace: true });
          return;
        }
      } else if (isSignupFlow) {
        clearOnboardingState();
        clearOnboardingComplete();
      }
      toast.success("OTP verified");
      navigate("/dashboard/stores", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "OTP verification failed"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!initialState.requestPayload) {
      toast.error("Start again to request a new code");
      navigate(isSignupFlow ? "/signup" : "/login", { replace: true });
      return;
    }

    try {
      setIsResending(true);
      const nextChallenge = await authService.requestOtp(initialState.requestPayload);
      setChallenge(nextChallenge);
      setTimer(30);
      setCanResend(false);
      setOtp(Array(INPUT_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      toast.success("OTP sent again");
      navigate("/otp", {
        replace: true,
        state: {
          ...initialState,
          challenge: nextChallenge,
          contact: nextChallenge.destination,
          method: nextChallenge.method,
        },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to resend OTP"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <button
        type="button"
        className="flex items-center gap-2 text-sm text-gray-500 mb-6 hover:text-gray-700 transition-colors"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify OTP</h1>
        <p className="text-sm text-gray-500">
          Enter the 6-digit code sent to <span className="font-semibold text-gray-900">{deliveryLabel}</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 mb-6">
        {otp.map((digit, index) => (
          <Input
            key={index}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            className="h-14 text-center text-2xl font-semibold tracking-wide rounded-xl"
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            onChange={(event) => handleOtpChange(event.target.value, index)}
            onPaste={(event) => handlePaste(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            disabled={isVerifying || isResending}
          />
        ))}
      </div>

      <Button
        className="w-full bg-printa-red hover:bg-red-700 text-white rounded-xl h-11 text-sm font-bold mb-4"
        onClick={handleVerifyOTP}
        disabled={isVerifying || isResending}
      >
        {isVerifying ? "Verifying..." : "Verify OTP"}
      </Button>

      <div className="text-center text-sm text-gray-500">
        {canResend ? (
          <button
            type="button"
            className="text-printa-red font-semibold hover:underline"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        ) : (
          <span>Resend OTP in {timer}s</span>
        )}
      </div>
    </AuthLayout>
  );
};

export default OTPVerificationPage;
