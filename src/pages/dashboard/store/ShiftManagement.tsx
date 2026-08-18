import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Clock, Delete, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { useStoreStaffQuery } from "@/query/hooks";
import { attendanceService } from "@/services/attendance.service";

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

const avatarColors = [
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-purple-100 text-purple-600",
];

const isPIN = (value: string) => /^\d{4,6}$/.test(value);

/* ─── PIN Pad Sub-component ─── */
const PinPad: React.FC<{
  employee: Employee;
  storeId: string;
  onBack?: () => void;
  showBackButton?: boolean;
  canManagePIN: boolean;
  onClocked?: () => void;
}> = ({ employee, storeId, onBack, showBackButton, canManagePIN, onClocked }) => {
  const [pinInput, setPinInput] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [newPIN, setNewPIN] = useState("");
  const [isSettingPIN, setIsSettingPIN] = useState(false);

  const handleDigit = (digit: string) => {
    if (isSubmitting || pinInput.length >= 6) return;
    setIsWrong(false);
    setPinInput((value) => `${value}${digit}`);
  };

  const handleBackspace = () => {
    if (isSubmitting) return;
    setPinInput((value) => value.slice(0, -1));
    setIsWrong(false);
  };

  const handleClock = async () => {
    if (!isPIN(pinInput)) {
      toast.error("Enter a 4–6 digit staff PIN.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await attendanceService.clock(storeId, employee.id, pinInput);
      toast.success(result.event.event_type === "CLOCK_IN" ? `${employee.name} clocked in` : `${employee.name} clocked out`);
      setPinInput("");
      onClocked?.();
    } catch (error) {
      setIsWrong(true);
      toast.error(error instanceof Error ? error.message : "Unable to verify this staff PIN.");
      window.setTimeout(() => {
        setPinInput("");
        setIsWrong(false);
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPIN = async () => {
    if (!isPIN(newPIN)) {
      toast.error("PIN must contain 4–6 digits.");
      return;
    }
    setIsSettingPIN(true);
    try {
      await attendanceService.setStaffPIN(storeId, employee.id, newPIN);
      toast.success(`PIN set for ${employee.name}.`);
      setNewPIN("");
      setShowPINSetup(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Only a vendor owner or store manager can set a PIN.");
    } finally {
      setIsSettingPIN(false);
    }
  };

  const dots = Array.from({ length: 6 }, (_, idx) => idx < pinInput.length);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 overflow-y-auto">
      {showBackButton && (
        <button
          type="button"
          onClick={onBack}
          className="self-start mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition lg:hidden"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      )}

      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600 mb-3">
        {employee.avatar}
      </div>
      <p className="text-base font-semibold text-gray-900">{employee.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">{employee.role}</p>

      <div className="mt-5 mb-5 text-center">
        <p className="text-sm text-gray-400">Enter staff PIN to clock in or out</p>
      </div>

      <div className="flex gap-3 mb-8" aria-hidden="true">
        {dots.map((filled, idx) => (
          <div
            key={idx}
            className={`h-3 w-3 rounded-full transition-all duration-150 ${
              isWrong ? "bg-red-400 animate-shake" : filled ? "bg-gray-900 scale-110" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(String(digit))}
            disabled={isSubmitting}
            className="h-14 rounded-2xl bg-gray-50 text-lg font-semibold text-gray-800 hover:bg-gray-100 active:scale-95 transition disabled:opacity-40"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleDigit("0")}
          disabled={isSubmitting}
          className="h-14 rounded-2xl bg-gray-50 text-lg font-semibold text-gray-800 hover:bg-gray-100 active:scale-95 transition disabled:opacity-40"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          disabled={isSubmitting}
          className="h-14 rounded-2xl bg-gray-50 text-gray-500 hover:bg-gray-100 active:scale-95 transition flex items-center justify-center disabled:opacity-40"
          aria-label="Delete digit"
        >
          <Delete size={18} />
        </button>
      </div>

      <Button
        type="button"
        onClick={handleClock}
        disabled={isSubmitting || pinInput.length < 4}
        className="mt-6 w-full max-w-[240px] h-12 rounded-2xl bg-printa-red text-white hover:bg-red-700"
      >
        {isSubmitting ? "Verifying PIN…" : "Clock In / Out"}
      </Button>

      {canManagePIN && (
        <div className="mt-5 w-full max-w-[240px] border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setShowPINSetup((value) => !value)}
            className="w-full text-xs font-semibold text-printa-red hover:underline"
          >
            {showPINSetup ? "Cancel PIN setup" : "Manager: set or reset PIN"}
          </button>
          {showPINSetup && (
            <div className="mt-3 space-y-2">
              <Input
                type="password"
                inputMode="numeric"
                value={newPIN}
                maxLength={6}
                onChange={(event) => setNewPIN(event.target.value.replace(/\D/g, ""))}
                placeholder="4–6 digit PIN"
                aria-label={`New PIN for ${employee.name}`}
              />
              <Button
                type="button"
                onClick={handleSetPIN}
                disabled={isSettingPIN || !isPIN(newPIN)}
                variant="outline"
                className="w-full"
              >
                {isSettingPIN ? "Saving PIN…" : "Save PIN"}
              </Button>
              <p className="text-[11px] leading-4 text-gray-400">Only the owner or a store manager is authorized to save this PIN.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ─── */
const ShiftManagement: React.FC = () => {
  const { user, isOwner, isManager } = useAuth();
  const { activeStore } = useStore();
  const { data: storeStaff = [], isLoading: isLoadingStaff, refetch: refetchStaff } = useStoreStaffQuery(activeStore?.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMobilePin, setShowMobilePin] = useState(false);

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

  const selectedEmployee = useMemo(
    () => scopedEmployees.find((employee) => employee.id === selectedId) ?? null,
    [scopedEmployees, selectedId],
  );

  useEffect(() => {
    if (!selectedId && scopedEmployees.length > 0) {
      setSelectedId(scopedEmployees[0].id);
    }
  }, [scopedEmployees, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    if (!scopedEmployees.some((employee) => employee.id === selectedId)) {
      setSelectedId(null);
      setShowMobilePin(false);
    }
  }, [scopedEmployees, selectedId]);

  const handleSelectEmployee = (id: string) => {
    setSelectedId(id);
    setShowMobilePin(true);
  };

  const canManagePIN = isOwner() || isManager();

  const onClocked = () => {
    void refetchStaff();
  };

  return (
    <DashboardLayout pageTitle="Shift Management">
      {showMobilePin && selectedEmployee && activeStore && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <PinPad employee={selectedEmployee} storeId={activeStore.id} showBackButton onBack={() => setShowMobilePin(false)} canManagePIN={canManagePIN} onClocked={onClocked} />
        </div>
      )}

      <div className="flex items-start gap-6">
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <h1 className="dashboard-page-title">Shift Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">{activeStore?.name ?? "Store"} · Select a staff member to clock in or out</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Clock size={13} />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
          </div>

          <div className="space-y-2">
            {isLoadingStaff ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-400">Loading staff directory…</div>
            ) : scopedEmployees.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-400">No staff members are assigned to this store yet.</div>
            ) : (
              scopedEmployees.map((employee, index) => {
                const isSelected = employee.id === selectedId;
                const colorClass = avatarColors[index % avatarColors.length];
                return (
                  <button
                    key={employee.id}
                    type="button"
                    disabled={employee.status === "off"}
                    onClick={() => handleSelectEmployee(employee.id)}
                    className={`w-full flex items-center gap-3 px-4 py-5 rounded-2xl text-left transition-all ${
                      isSelected ? "bg-printa-red ring-1 ring-gray-200 shadow-sm" : "hover:bg-white/70 border border-gray-200"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <div className={`w-11 h-11 rounded-full ${colorClass} flex items-center justify-center text-sm font-bold flex-shrink-0`}>{employee.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{employee.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{employee.role}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`w-2 h-2 rounded-full ${employee.status === "active" ? "bg-emerald-400" : "bg-gray-300"}`} />
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="hidden lg:block w-[360px] flex-shrink-0">
          <div className="sticky top-2 h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {selectedEmployee && activeStore ? (
              <PinPad employee={selectedEmployee} storeId={activeStore.id} canManagePIN={canManagePIN} onClocked={onClocked} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3"><LockKeyhole size={22} className="text-gray-300" /></div>
                <p className="text-sm font-medium text-gray-400">Select an employee</p>
                <p className="text-xs text-gray-300 mt-1">Choose from the list to enter their PIN</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShiftManagement;
