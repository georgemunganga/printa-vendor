import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, KeyRound, LockKeyhole } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { attendanceService } from "@/services/attendance.service";

const isPIN = (value: string) => /^\d{4,6}$/.test(value);

const StaffPinReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const [pin, setPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const updatePIN = (value: string, setter: (next: string) => void) => {
    setter(value.replace(/\D/g, "").slice(0, 6));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error("This PIN reset link is incomplete. Request a new email from the store lock screen.");
      return;
    }
    if (!isPIN(pin) || pin !== confirmPIN) {
      toast.error("Enter matching 4–6 digit staff PINs.");
      return;
    }

    setIsSubmitting(true);
    try {
      await attendanceService.confirmOwnerPINReset(token, pin);
      setPIN("");
      setConfirmPIN("");
      setIsComplete(true);
      toast.success("Your staff PIN has been reset.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset your staff PIN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 px-4 py-8 sm:flex sm:items-center sm:justify-center">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-red-100/40 sm:p-8">
        <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-printa-red">
          {isComplete ? <CheckCircle2 size={25} /> : <LockKeyhole size={24} />}
        </div>
        {isComplete ? (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff PIN updated</h1>
              <p className="mt-2 text-sm leading-6 text-gray-500">Your new PIN is ready for your store’s staff lock screen. Sign in with your usual email or phone OTP to continue.</p>
            </div>
            <Button type="button" className="w-full rounded-xl bg-printa-red text-white hover:bg-red-700" onClick={() => navigate("/login", { replace: true })}>Go to sign in</Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            <div>
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-printa-red" />
                <p className="text-xs font-semibold uppercase tracking-wide text-printa-red">Store access</p>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Reset staff PIN</h1>
              <p className="mt-2 text-sm leading-6 text-gray-500">Choose a new 4–6 digit PIN for the first store. This email link expires in 15 minutes and can be used once.</p>
            </div>
            {!token && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">This reset link is missing its secure token. Return to the store lock screen and request another email.</div>}
            <label className="block text-sm font-semibold text-gray-800">New staff PIN
              <input type="password" inputMode="numeric" autoComplete="new-password" maxLength={6} value={pin} onChange={(event) => updatePIN(event.target.value, setPIN)} placeholder="4–6 digits" className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base tracking-[0.35em] focus:border-printa-red focus:outline-none focus:ring-2 focus:ring-printa-red/40" />
            </label>
            <label className="block text-sm font-semibold text-gray-800">Confirm new staff PIN
              <input type="password" inputMode="numeric" autoComplete="new-password" maxLength={6} value={confirmPIN} onChange={(event) => updatePIN(event.target.value, setConfirmPIN)} placeholder="Re-enter PIN" className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base tracking-[0.35em] focus:border-printa-red focus:outline-none focus:ring-2 focus:ring-printa-red/40" />
            </label>
            {confirmPIN && pin !== confirmPIN && <p className="text-xs font-medium text-printa-red">The PINs must match.</p>}
            <Button type="submit" disabled={isSubmitting || !token} className="w-full rounded-xl bg-printa-red text-white hover:bg-red-700">{isSubmitting ? "Updating PIN…" : "Set new staff PIN"}</Button>
          </form>
        )}
      </section>
    </main>
  );
};

export default StaffPinReset;
