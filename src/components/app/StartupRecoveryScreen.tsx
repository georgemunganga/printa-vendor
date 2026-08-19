import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StartupRecoveryScreenProps {
  stage: "session" | "stores";
}

/**
 * A deliberate, user-visible wait state for protected routes. It replaces the
 * historical `null` render during API/session hydration, which appeared as a
 * white screen when connectivity was slow or unavailable.
 */
export function StartupRecoveryScreen({ stage }: StartupRecoveryScreenProps) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  const message = offline
    ? "You appear to be offline. Printa is checking the information saved on this device."
    : stage === "session"
      ? "Restoring your secure Printa session…"
      : "Loading your available stores…";

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8 flex items-center justify-center" aria-live="polite">
      <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${offline ? "bg-amber-50 text-amber-600" : "bg-red-50 text-printa-red"}`}>
          {offline ? <WifiOff size={25} /> : <RefreshCw size={25} className="animate-spin" />}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Printa vendor portal</p>
        <h1 className="mt-2 text-xl font-bold text-gray-900">{offline ? "Working offline" : "Preparing your workspace"}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">{message}</p>
        {offline && (
          <Button type="button" variant="outline" onClick={() => window.location.reload()} className="mt-6 rounded-xl">
            <RefreshCw size={15} className="mr-2" /> Try again
          </Button>
        )}
      </section>
    </main>
  );
}
