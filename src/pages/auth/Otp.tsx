import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { resendLoginOtp, resendSignupOtp, verifyLoginOtp, verifySignupOtp } from "@/mock-api/auth";
import { clearOnboardingComplete, clearOnboardingState } from "@/lib/vendorOnboardingState";

const INPUT_LENGTH = 6;

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const method = searchParams.get("method") ?? "phone";
  const value = searchParams.get("value") ?? "";
  const challengeId = searchParams.get("challenge") ?? "";
  const purpose = searchParams.get("purpose") ?? "login";
  const { login } = useAuth();
  const isLoginFlow = purpose === "login";
  const isSignupFlow = purpose === "signup";

  const [otp, setOtp] = useState(Array(INPUT_LENGTH).fill(""));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if ((!isLoginFlow && !isSignupFlow) || !challengeId) {
      toast.error("Invalid OTP session. Please login again.");
      navigate("/login", { replace: true });
      return;
    }
  }, [challengeId, isLoginFlow, isSignupFlow, navigate]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (digit: string, index: number) => {
    if (!/^\d?$/.test(digit)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = digit;
    setOtp(updatedOtp);

    if (digit && index < INPUT_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const code = otp.join("");
    if (code.length !== INPUT_LENGTH) {
      toast.error("Enter the full 6-digit code");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      try {
        const user = isLoginFlow
          ? verifyLoginOtp(challengeId, code)
          : verifySignupOtp(challengeId, code);
        login(user);
        if (isSignupFlow) {
          clearOnboardingState();
          clearOnboardingComplete();
        }
        setIsVerifying(false);
        toast.success("OTP verified");
        navigate("/dashboard/stores");
      } catch (error) {
        setIsVerifying(false);
        const message = error instanceof Error ? error.message : "OTP verification failed";
        toast.error(message);
      }
    }, 700);
  };

  const handleResend = () => {
    try {
      const { challengeId: nextChallenge } = isLoginFlow
        ? resendLoginOtp(challengeId)
        : resendSignupOtp(challengeId);
      setTimer(30);
      setCanResend(false);
      setOtp(Array(INPUT_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      toast.success("OTP sent again");
      navigate(
        `/otp?purpose=${encodeURIComponent(purpose)}&challenge=${encodeURIComponent(nextChallenge)}&method=${encodeURIComponent(method)}&value=${encodeURIComponent(value)}`,
        { replace: true }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to resend OTP";
      toast.error(message);
      navigate(isSignupFlow ? "/signup" : "/login", { replace: true });
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
          Enter the 6-digit code sent to <span className="font-semibold text-gray-900">{value}</span>
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
            onKeyDown={(event) => handleKeyDown(event, index)}
            disabled={isVerifying}
          />
        ))}
      </div>

      <Button
        className="w-full bg-printa-red hover:bg-red-700 text-white rounded-xl h-11 text-sm font-bold mb-4"
        onClick={handleVerifyOTP}
        disabled={isVerifying}
      >
        {isVerifying ? "Verifying..." : "Verify OTP"}
      </Button>

      <div className="text-center text-sm text-gray-500">
        {canResend ? (
          <button
            type="button"
            className="text-printa-red font-semibold hover:underline"
            onClick={handleResend}
          >
            Resend OTP
          </button>
        ) : (
          <span>Resend OTP in {timer}s</span>
        )}
      </div>
    </AuthLayout>
  );
};

export default OTPVerificationPage;
