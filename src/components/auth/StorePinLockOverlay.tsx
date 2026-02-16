import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Delete, Lock, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { listMockDirectoryUsers } from "@/mock-api/auth";
import { Button } from "@/components/ui/button";

type UnlockMap = Record<string, true>;

type Employee = {
  id: string;
  name: string;
  role: string;
  pin: string;
  avatar: string;
  status: "active" | "off";
};

const roleLabel: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
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
    "/dashboard/settings",
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
  const [unlockMap, setUnlockMap] = useState<UnlockMap>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAssignedProfiles, setShowAssignedProfiles] = useState(false);
  const [mobileView, setMobileView] = useState<"pin" | "list">("pin");
  const [pinInput, setPinInput] = useState("");
  const [isWrong, setIsWrong] = useState(false);

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

  const scopedEmployees = useMemo(() => {
    if (!user) return [];

    const directory = listMockDirectoryUsers(user.businessId);
    const activeStoreId = activeStore?.id;
    const filtered = directory.filter((member) => {
      if (member.id === user.id) return true;
      if (!activeStoreId) return false;
      if (member.role === "owner") return true;
      return (member.assignedStoreIds ?? []).includes(activeStoreId);
    });

    const unique = Array.from(new Map(filtered.map((m) => [m.id, m])).values());
    return unique
      .map<Employee>((member) => ({
        id: member.id,
        name: member.name,
        role: roleLabel[member.role] ?? "Staff",
        pin: member.pin,
        avatar: toInitials(member.name),
        status: member.id === user.id ? "active" : "off",
      }))
      .sort((a, b) => {
        if (a.id === user.id) return -1;
        if (b.id === user.id) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [activeStore?.id, user]);

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

  useEffect(() => {
    if (!user) return;
    // Default mode stays simple: signed-in user only.
    if (selectedId === user.id) {
      setShowAssignedProfiles(false);
    }
  }, [selectedId, user]);

  const selectedEmployee = scopedEmployees.find((employee) => employee.id === selectedId) ?? null;
  const signedInEmployee = scopedEmployees.find((employee) => employee.id === user.id) ?? null;
  const assignedProfiles = scopedEmployees.filter((employee) => employee.id !== user.id);
  const requiresLock =
    Boolean(activeStore) &&
    isStoreScopedPath(pathname) &&
    Boolean(activeStore && !unlockMap[activeStore.id]);

  if (!requiresLock || !activeStore || !user) {
    return null;
  }

  const handleDigit = (digit: string) => {
    if (!selectedEmployee || pinInput.length >= 4) return;
    setIsWrong(false);
    const next = `${pinInput}${digit}`;
    setPinInput(next);
    if (next.length === 4) {
      if (next === selectedEmployee.pin) {
        const nextMap: UnlockMap = { ...unlockMap, [activeStore.id]: true };
        setUnlockMap(nextMap);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(storageKey, JSON.stringify(nextMap));
        }
      } else {
        setIsWrong(true);
        setTimeout(() => {
          setPinInput("");
          setIsWrong(false);
        }, 500);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setIsWrong(false);
  };

  const selectEmployee = (employeeId: string, openMobilePinPad = false) => {
    setSelectedId(employeeId);
    setPinInput("");
    setIsWrong(false);
    if (openMobilePinPad) {
      setMobileView("pin");
    }
  };

  const dots = Array.from({ length: 4 }, (_, idx) => idx < pinInput.length);

  const pinPadContent = (
    <>
      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
        <LockKeyhole size={24} className="text-gray-400" />
      </div>
      <p className="text-center text-sm text-gray-500 mb-1">Signed in as</p>
      <p className="text-center text-lg font-semibold text-gray-900 mb-6">
        {selectedEmployee?.name ?? user.name}
      </p>

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
            onClick={() => handleDigit(String(digit))}
            className="h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleDigit("0")}
          className="h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center"
        >
          <Delete size={18} />
        </button>
      </div>
      {pinInput.length === 4 && !isWrong && (
        <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
          <Check size={16} />
          Unlocked
        </div>
      )}
    </>
  );

  const employeeList = (
    <>
      {signedInEmployee && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Currently Signed In
          </p>
          <button
            type="button"
            onClick={() => selectEmployee(signedInEmployee.id, true)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition ${selectedId === signedInEmployee.id
                ? "border-printa-red bg-printa-red/5"
                : "border-gray-200 hover:bg-gray-50"
              }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold">
              {signedInEmployee.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{signedInEmployee.name}</p>
              <p className="text-xs text-gray-400">{signedInEmployee.role}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>
      )}
      <div className="space-y-2">
        {assignedProfiles.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAssignedProfiles((prev) => !prev)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            {showAssignedProfiles ? "Hide Worker Profiles" : "Login as Worker Profile"}
          </button>
        )}
        {showAssignedProfiles && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 pt-1">
              Assigned To This Store
            </p>
            {assignedProfiles.map((emp) => {
              const isSelected = emp.id === selectedId;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => selectEmployee(emp.id, true)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition ${isSelected ? "border-printa-red bg-printa-red/5" : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold">
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.role}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              );
            })}
          </>
        )}
      </div>
    </>
  );

  const handleMobileSelectEmployee = (employeeId: string) => {
    setSelectedId(employeeId);
    setPinInput("");
    setIsWrong(false);
    setMobileView("pin");
  };

  const handleMobileBack = () => {
    setMobileView("list");
    setPinInput("");
    setIsWrong(false);
  };

  const backToStores = () => {
    setActiveStore(null);
    navigate("/dashboard/stores", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm">
      {/* ── Mobile layout ── */}
      <div className="lg:hidden absolute inset-0 flex flex-col bg-white/95">
        {/* Header */}
        <div className="p-4 pb-2 shrink-0">
          <p className="inline-flex items-center text-xs font-semibold px-3 border bg-black rounded-full text-white p-2 mb-2">
            <Lock className="w-4 h-4 mr-1" /> Store Locked
          </p>
          <h2 className="text-3xl dashboard-page-title text-gray-900">{activeStore.name}</h2>
        </div>

        {/* Profile switcher chip */}
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
              {selectedEmployee?.avatar ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{selectedEmployee?.name ?? user.name}</p>
              <p className="text-[10px] text-gray-400">{selectedEmployee?.role ?? "Owner"}</p>
            </div>
            {assignedProfiles.length > 0 && (
              <button
                type="button"
                onClick={() => setMobileView((prev) => prev === "pin" ? "list" : "pin")}
                className="text-xs font-medium text-printa-red px-2 py-1 rounded-lg hover:bg-printa-red/5 transition"
              >
                {mobileView === "pin" ? "Switch" : "Done"}
              </button>
            )}
          </div>
        </div>

        {/* Content area - takes remaining space */}
        {mobileView === "list" ? (
          <div className="flex-1 min-h-0 overflow-y-auto px-4 space-y-2 pb-4">
            {signedInEmployee && (
              <button
                type="button"
                onClick={() => {
                  handleMobileSelectEmployee(signedInEmployee.id);
                  setMobileView("pin");
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition ${selectedId === signedInEmployee.id
                    ? "border-printa-red bg-printa-red/5"
                    : "border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold">
                  {signedInEmployee.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{signedInEmployee.name}</p>
                  <p className="text-xs text-gray-400">{signedInEmployee.role}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            )}
            {assignedProfiles.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  handleMobileSelectEmployee(emp.id);
                  setMobileView("pin");
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition ${emp.id === selectedId ? "border-printa-red bg-printa-red/5" : "border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold">
                  {emp.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.role}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-xs">
              {pinPadContent}
            </div>
          </div>
        )}

        {/* Bottom button - always visible */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <Button type="button" onClick={backToStores} className="w-full transition">
            Back to Stores
          </Button>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden lg:grid absolute inset-0 grid-cols-[340px_1fr]">
        <div className="bg-white/95 border-r border-gray-200 p-4 flex h-full min-h-0 flex-col">
          <div className="mb-4 shrink-0">
            <p className="inline-flex items-center text-xs font-semibold px-3 border bg-black rounded-full text-white p-2 mb-2">
              <Lock className="w-4 h-4 mr-1" /> Store Locked
            </p>
            <h2 className="text-4xl dashboard-page-title text-gray-900">{activeStore.name}</h2>
            <p className="text-xs text-gray-500 mt-1">Enter PIN to continue</p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
            {employeeList}
          </div>
          <div className="mt-auto pt-4 border-t border-gray-200 shrink-0">
            <Button type="button" onClick={backToStores} className="w-full transition">
              Back to Stores
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
            {pinPadContent}
          </div>
        </div>
      </div>
    </div>
  );
};
