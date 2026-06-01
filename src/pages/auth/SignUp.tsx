import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { User, PhoneCall, Mail, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/context/auth-context";
import {
  clearOnboardingComplete,
  clearOnboardingState,
  isOnboardingComplete,
} from "@/lib/vendorOnboardingState";
import { requestSignupOtp, verifySignupOtp } from "@/mock-api/auth";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api";

const countryCodes = [
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
];

const CountryCodeDropdown: React.FC<{
  value: typeof countryCodes[0];
  onChange: (country: typeof countryCodes[0]) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-l-xl border border-r-0 border-gray-300 h-10 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-printa-red focus:border-transparent"
      >
        <span className="text-lg">{value.flag}</span>
        <span className="font-semibold">{value.code}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-64 overflow-y-auto"
          >
            {countryCodes.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                  value.code === country.code ? 'bg-printa-red/5' : ''
                }`}
              >
                <span className="text-xl">{country.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{country.country}</p>
                  <p className="text-xs text-gray-500">{country.code}</p>
                </div>
                {value.code === country.code && (
                  <Check className="h-4 w-4 text-printa-red flex-shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const SignUp = () => {
  const navigate = useNavigate();
  const { login, loginWithApi } = useAuth();
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState("");
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    if (!isOnboardingComplete()) {
      navigate("/onboarding", { replace: true });
    }
  }, [navigate]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (loginMethod === 'phone') {
      if (!phoneNumber || phoneNumber.length < 9) {
        toast.error("Please enter a valid phone number");
        return;
      }
    } else {
      if (!email.trim() || !email.includes('@')) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    try {
      if (loginMethod === "email") {
        setIsCreatingAccount(true);
        const [firstName, ...lastNameParts] = name.trim().split(/\s+/);
        await authService.register({
          email,
          password,
          first_name: firstName,
          last_name: lastNameParts.join(" "),
          role: "VENDOR",
        });
        await loginWithApi(email, password);
        clearOnboardingState();
        clearOnboardingComplete();
        toast.success("Account created successfully!");
        navigate('/dashboard/stores');
        return;
      }

      const value = loginMethod === "phone" ? `${countryCode.code}${phoneNumber}` : email;
      const { challengeId: nextChallenge } = requestSignupOtp({
        name: name.trim(),
        method: loginMethod,
        value,
      });
      setChallengeId(nextChallenge);
      toast.success(`OTP sent to your ${loginMethod === 'phone' ? 'phone number' : 'email address'}`);
      setStep('otp');
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to create account");
      toast.error(message);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const contactLabel = loginMethod === 'phone' ? `${countryCode.code} ${phoneNumber}` : email;

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    if (!challengeId) {
      toast.error("Sign up session expired. Please request OTP again.");
      setStep("info");
      return;
    }

    try {
      const user = verifySignupOtp(challengeId, otp);
      login(user);
      clearOnboardingState();
      clearOnboardingComplete();
      toast.success("Account created successfully!");
      setTimeout(() => navigate('/dashboard/stores'), 700);
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTP verification failed";
      toast.error(message);
    }
  };

  const handleGoogleSignUp = () => {
    setIsGoogleLoading(true);
    window.location.assign(authService.googleOAuthStartUrl({ role: "VENDOR" }));
  };

  return (
    <AuthLayout>
      {step === 'info' ? (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an Account</h1>
            <p className="text-sm text-gray-500">Sign up to start using our printing services</p>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <GoogleIcon />
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Method Toggle */}
          <div className="mb-5">
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  loginMethod === 'phone' ? 'bg-printa-red text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <PhoneCall className="h-4 w-4" />
                  Phone
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  loginMethod === 'email' ? 'bg-printa-red text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="flex items-center">
                <div className="bg-gray-100 px-3 py-2 rounded-l-xl border border-r-0 border-gray-300 h-10 flex items-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  className="rounded-l-none rounded-r-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {loginMethod === 'phone' ? (
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <div className="flex items-center">
                  <CountryCodeDropdown value={countryCode} onChange={setCountryCode} />
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="97X XXX XXX"
                    className="rounded-l-none rounded-r-xl"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="flex items-center">
                  <div className="bg-gray-100 px-3 py-2 rounded-l-xl border border-r-0 border-gray-300 h-10 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="contact"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-l-none rounded-r-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5 mt-4">Password</label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5 mt-4">Confirm Password</label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Repeat password"
                  className="rounded-xl"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" disabled={isCreatingAccount} className="w-full bg-printa-red hover:bg-red-700 text-white rounded-xl h-11 text-sm font-bold">
              {loginMethod === "email" ? (isCreatingAccount ? "Creating Account..." : "Create Account") : "Send OTP"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-printa-red hover:underline font-semibold">Log in</Link>
          </p>
        </>
      ) : (
        <>
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-gray-500 mb-6 hover:text-gray-700 transition-colors"
            onClick={() => setStep('info')}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify OTP</h1>
            <p className="text-sm text-gray-500">
              Enter the 6-digit code sent to <span className="font-semibold text-gray-900">{contactLabel}</span>
            </p>
            <Button
              type="button"
              className="text-printa-red text-sm mt-1 hover:underline font-medium"
              onClick={() => setStep('info')}
            >
              Change {loginMethod === 'phone' ? 'number' : 'email'}
            </Button>
          </div>

          <form onSubmit={handleVerifyOTP}>
            <div className="flex justify-center py-4 mb-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2">
                    {slots.map((slot, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-10 h-12 text-center text-lg border-gray-300 focus:border-printa-red focus:ring-printa-red rounded-xl"
                      />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>

            <Button type="submit" className="w-full bg-printa-red hover:bg-red-700 text-white rounded-xl h-11 text-sm font-bold mb-4">
              Verify & Create Account
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            <button type="button" className="text-printa-red font-semibold hover:underline">
              Resend OTP
            </button>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default SignUp;
