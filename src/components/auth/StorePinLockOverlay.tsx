import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Delete, Lock, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { useStoreStaffQuery } from "@/query/hooks";
import { attendanceService } from "@/services/attendance.service";
import { Button } from "@/components/ui/button";

type UnlockMap = Record<string, true>;

type Employee = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "active" | "off";
};

const roleLabel: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
  cashier: "Cashier",
};

const toInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.trim()[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const isStoreScopedPath = (pathname: string): boolean => {
  const exact = new Set([
    "/dashboard",
    "/dashboard-old",
    "/dashboard/orders",
    "/dashboard/locations",
    "/dashboard/pos",
    "/dashboard/chat",
    "/dashboard/tracking",
    "/dashboard/inventory",
    "/dashboard/settings",
    "/dashboard/shift-management",
    "/printflow",
    "/customize",
    "/checkout",
    "/upload",
  ]);

  if (exact.has(pathname)) return true;
  if (pathname.startsWith("/dashboard/job/")) return true;
  if (pathname.startsWith("/dashboard/chat/")) return true;
  if (pathname.startsWith("/dashboard/tracking/")) return true;
  return false;
};

const STORAGE_KEY_PREFIX = "printa_shift_unlock_v1";

interface StorePinLockOverlayProps {
  pathname: string;
}

export const StorePinLockOverlay: React.FC<StorePinLockOverlayProps> = ({ pathname }) => {
  const { user } = useAuth();
  const { activeStore, setActiveStore } = useStore();
  const navigate = useNavigate();
  const { data: storeStaff = [], isLoading: isLoadingStaff } = useStoreStaffQuery(activeStore?.id);
  const [unlockMap, setUnlockMap] = useState<UnlockMap>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAssignedProfiles, setShowAssignedProfiles] = useState(false);
  const [mobileView, setMobileView] = useState<"pin" | "list">("pin");
  const [pinInput, setPinInput] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  const storageKey = user ? `${STORAGE_KEY_PREFIX}_${user.id}` : `${STORAGE_KEY_PREFIX}_anon`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) {
      setUnlockMap({});
      return;
    }
    try {
      const parsed = JSON.parse(raw) as UnlockMap;
      setUnlockMap(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setUnlockMap({});
    }
  }, [storageKey]);

  const scopedEmployees = useMemo(
    () =>
      storeStaff
        .map<Employee>((member) => {
          const name = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() || member.email || "Staff member";
          return {
            id: member.user_id,
            name,
            role: roleLabel[member.role.toLowerCase()] ?? "Staff",
            avatar: toInitials(name),
            status: member.is_active ? "active" : "off",
          };
        })
        .sort((a, b) => {
          if (a.id === user?.id) return -1;
          if (b.id === user?.id) return 1;
          return a.name.localeCompare(b.name);
        }),
    [storeStaff, user?.id],
  );

  useEffect(() => {
    if (!selectedId && scopedEmployees.length > 0) {
      setSelectedId(scopedEmployees[0].id);
    }
  }, [scopedEmployees, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    if (!scopedEmployees.some((employee) => employee.id === selectedId)) {
      setSelectedId(scopedEmployees[0]?.id ?? null);
      setPinInput("");
      setIsWrong(false);
    }
  }, [scopedEmployees, selectedId]);

  const selectedEmployee = scopedEmployees.find((employee) => employee.id === selectedId) ?? null;
  const signedInEmployee = scopedEmployees.find((employee) => employee.id === user?.id) ?? null;
  const assignedProfiles = scopedEmployees.filter((employee) => employee.id !== user?.id);
  const requiresLock = Boolean(activeStore) && isStoreScopedPath(pathname) && !unlockMap[activeStore?.id ?? ""];

  if (!requiresLock || !activeStore || !user) {
    return null;
  }

  const unlockStore = async (pin: string) => {
    if (!selectedEmployee) return;
    setIsSubmitting(true);
    try {
      const result = await attendanceService.clock(activeStore.id, selectedEmployee.id, pin);
      const nextMap: UnlockMap = { ...unlockMap, [activeStore.id]: true };
      setUnlockMap(nextMap);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(storageKey, JSON.stringify(nextMap));
      }
      toast.success(result.event.event_type === "CLOCK_IN" ? "Clocked in and store unlocked" : "Clocked out and store unlocked");
    } catch (error) {
      setIsWrong(true);
      toast.error(error instanceof Error ? error.message : "Unable to verify the staff PIN.");
      window.setTimeout(() => {
        setPinInput("");
        setIsWrong(false);
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestOwnerPINReset = async () => {
    if (!activeStore) return;
    setIsRequestingReset(true);
    try {
      await attendanceService.requestOwnerPINReset(activeStore.id);
      toast.success("A secure staff PIN reset link has been sent to your account email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send the staff PIN reset email.");
    } finally {
      setIsRequestingReset(false);
    }
  };

  const handleDigit = (digit: string) => {
    if (!selectedEmployee || isSubmitting || pinInput.length >= 6) return;
    setIsWrong(false);
    const next = `${pinInput}${digit}`;
    setPinInput(next);
  };

  const handleBackspace = () => {
    if (isSubmitting) return;
    setPinInput((prev) => prev.slice(0, -1));
    setIsWrong(false);
  };

  const selectEmployee = (employeeId: string, openMobilePinPad = false) => {
    setSelectedId(employeeId);
    setPinInput("");
    setIsWrong(false);
    if (openMobilePinPad) setMobileView("pin");
  };

  const dots = Array.from({ length: 6 }, (_, idx) => idx < pinInput.length);

  const pinPadContent = (
    <>
      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
        <LockKeyhole size={24} className="text-gray-400" />
      </div>
      <p className="text-center text-sm text-gray-500 mb-1">Clock in as</p>
      <p className="text-center text-lg font-semibold text-gray-900 mb-2">
        {selectedEmployee?.name ?? user.name}
      </p>
      <p className="text-center text-xs text-gray-400 mb-6">Enter the 4–6 digit staff PIN</p>

      <div className="flex justify-center gap-3 mb-6">
        {dots.map((filled, idx) => (
          <div
            key={idx}
            className={`h-3 w-3 rounded-full transition-all ${isWrong ? "bg-red-400" : filled ? "bg-gray-900" : "bg-gray-200"}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={isSubmitting || isLoadingStaff}
            onClick={() => handleDigit(String(digit))}
            className="h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          disabled={isSubmitting || isLoadingStaff}
          onClick={() => handleDigit("0")}
          className="h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          0
        </button>
        <button
          type="button"
          disabled={isSubmitting || isLoadingStaff}
          onClick={handleBackspace}
          className="h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Delete digit"
        >
          <Delete size={18} />
        </button>
      </div>
      <Button
        type="button"
        disabled={isSubmitting || pinInput.length < 4 || !selectedEmployee}
        onClick={() => void unlockStore(pinInput)}
        className="mt-5 w-full"
      >
        {isSubmitting ? "Verifying PIN…" : "Clock In"}
      </Button>
      {pinInput.length >= 4 && !isWrong && !isSubmitting && (
        <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
          <Check size={16} />
          PIN ready to verify
        </div>
      )}
      {user.role?.toUpperCase() === "VENDOR" && (
        <button
          type="button"
          onClick={() => void requestOwnerPINReset()}
          disabled={isRequestingReset || isSubmitting}
          className="mt-4 w-full text-center text-xs font-semibold text-printa-red hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRequestingReset ? "Sending reset email…" : "Forgot your staff PIN? Send a reset email"}
        </button>
      )}
    </>
  );

  const employeeButton = (employee: Employee) => {
    const isSelected = employee.id === selectedId;
    return (
      <button
        key={employee.id}
        type="button"
        onClick={() => selectEmployee(employee.id, true)}
        disabled={employee.status === "off"}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition ${
          isSelected ? "border-printa-red bg-printa-red/5" : "border-gray-200 hover:bg-gray-50"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold">
          {employee.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{employee.name}</p>
          <p className="text-xs text-gray-400">{employee.role}</p>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </button>
    );
  };

  const employeeList = (
    <>
      {isLoadingStaff ? (
        <p className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-400">Loading staff directory…</p>
      ) : scopedEmployees.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-400">No active staff are assigned to this store.</p>
      ) : (
        <>
          {signedInEmployee && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Currently Signed In</p>
              {employeeButton(signedInEmployee)}
            </div>
          )}
          <div className="space-y-2">
            {assignedProfiles.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAssignedProfiles((prev) => !prev)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                {showAssignedProfiles ? "Hide Assigned Staff" : "Choose Assigned Staff"}
              </button>
            )}
            {showAssignedProfiles && assignedProfiles.map(employeeButton)}
          </div>
        </>
      )}
    </>
  );

  const backToStores = () => {
    setActiveStore(null);
    navigate("/dashboard/stores", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm">
      <div className="lg:hidden absolute inset-0 flex flex-col bg-white/95">
        <div className="p-4 pb-2 shrink-0">
          <p className="inline-flex items-center text-xs font-semibold px-3 border bg-black rounded-full text-white p-2 mb-2">
            <Lock className="w-4 h-4 mr-1" /> Store Locked
          </p>
          <h2 className="text-3xl dashboard-page-title text-gray-900">{activeStore.name}</h2>
        </div>
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
              {selectedEmployee?.avatar ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{selectedEmployee?.name ?? user.name}</p>
              <p className="text-[10px] text-gray-400">{selectedEmployee?.role ?? "Staff"}</p>
            </div>
            {assignedProfiles.length > 0 && (
              <button
                type="button"
                onClick={() => setMobileView((prev) => (prev === "pin" ? "list" : "pin"))}
                className="text-xs font-medium text-printa-red px-2 py-1 rounded-lg hover:bg-printa-red/5 transition"
              >
                {mobileView === "pin" ? "Switch" : "Done"}
              </button>
            )}
          </div>
        </div>
        {mobileView === "list" ? (
          <div className="flex-1 min-h-0 overflow-y-auto px-4 space-y-2 pb-4">{employeeList}</div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6"><div className="w-full max-w-xs">{pinPadContent}</div></div>
        )}
        <div className="p-4 border-t border-gray-200 shrink-0"><Button type="button" onClick={backToStores} className="w-full transition">Back to Stores</Button></div>
      </div>

      <div className="hidden lg:grid absolute inset-0 grid-cols-[340px_1fr]">
        <div className="bg-white/95 border-r border-gray-200 p-4 flex h-full min-h-0 flex-col">
          <div className="mb-4 shrink-0">
            <p className="inline-flex items-center text-xs font-semibold px-3 border bg-black rounded-full text-white p-2 mb-2"><Lock className="w-4 h-4 mr-1" /> Store Locked</p>
            <h2 className="text-4xl dashboard-page-title text-gray-900">{activeStore.name}</h2>
            <p className="text-xs text-gray-500 mt-1">Clock in with your staff PIN to continue</p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">{employeeList}</div>
          <div className="mt-auto pt-4 border-t border-gray-200 shrink-0"><Button type="button" onClick={backToStores} className="w-full transition">Back to Stores</Button></div>
        </div>
        <div className="flex items-center justify-center"><div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl border border-gray-100">{pinPadContent}</div></div>
      </div>
    </div>
  );
};
