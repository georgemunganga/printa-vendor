import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";

const OTPVerificationPage = () => {
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">OTP not available</h1>
        <p className="text-sm text-gray-500">
          Phone OTP will be enabled after SMS provider keys are configured. Use email/password or Google sign-in for now.
        </p>
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
};

export default OTPVerificationPage;
