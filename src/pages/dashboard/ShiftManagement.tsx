import React, { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Clock, Delete, LockKeyhole } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

type Employee = {
  id: string;
  name: string;
  role: string;
  pin: string;
  avatar: string;
  status: "active" | "off";
};

const employees: Employee[] = [
  { id: "e1", name: "Leslie K.", role: "Cashier", pin: "1234", avatar: "LK", status: "active" },
  { id: "e2", name: "Cameron W.", role: "Operator", pin: "4567", avatar: "CW", status: "off" },
  { id: "e3", name: "Jacob J.", role: "Supervisor", pin: "7890", avatar: "JJ", status: "off" },
];

const avatarColors = [
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-purple-100 text-purple-600",
];

/* ─── PIN Pad Sub-component ─── */
const PinPad: React.FC<{
  employee: Employee;
  onBack?: () => void;
  showBackButton?: boolean;
}> = ({ employee, onBack, showBackButton }) => {
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const handleDigit = (digit: string) => {
    if (isUnlocked || pinInput.length >= 4) return;
    setIsWrong(false);
    const next = `${pinInput}${digit}`;
    setPinInput(next);
    if (next.length === 4) {
      if (next === employee.pin) {
        setIsUnlocked(true);
      } else {
        setIsWrong(true);
        setTimeout(() => {
          setPinInput("");
          setIsWrong(false);
        }, 600);
      }
    }
  };

  const handleBackspace = () => {
    if (isUnlocked) return;
    setPinInput((prev) => prev.slice(0, -1));
    setIsWrong(false);
  };

  const handleReset = () => {
    setPinInput("");
    setIsUnlocked(false);
    setIsWrong(false);
  };

  const dots = Array.from({ length: 4 }, (_, idx) => idx < pinInput.length);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* Mobile back button */}
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

      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600 mb-3">
        {employee.avatar}
      </div>

      <p className="text-base font-semibold text-gray-900">{employee.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">{employee.role}</p>

      {/* Status / prompt */}
      <div className="mt-5 mb-5 text-center">
        {isUnlocked ? (
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Check size={16} />
            <span className="text-sm font-medium">Shift unlocked</span>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Enter your PIN</p>
        )}
      </div>

      {/* PIN dots */}
      <div className="flex gap-3 mb-8">
        {dots.map((filled, idx) => (
          <div
            key={idx}
            className={`h-3 w-3 rounded-full transition-all duration-150 ${
              isWrong
                ? "bg-red-400 animate-shake"
                : filled
                ? "bg-gray-900 scale-110"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(String(digit))}
            disabled={isUnlocked}
            className="h-14 rounded-2xl bg-gray-50 text-lg font-semibold text-gray-800 hover:bg-gray-100 active:scale-95 transition disabled:opacity-40"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleDigit("0")}
          disabled={isUnlocked}
          className="h-14 rounded-2xl bg-gray-50 text-lg font-semibold text-gray-800 hover:bg-gray-100 active:scale-95 transition disabled:opacity-40"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          disabled={isUnlocked}
          className="h-14 rounded-2xl bg-gray-50 text-gray-500 hover:bg-gray-100 active:scale-95 transition flex items-center justify-center disabled:opacity-40"
          aria-label="Delete digit"
        >
          <Delete size={18} />
        </button>
      </div>

      {/* Action button */}
      <button
        type="button"
        onClick={isUnlocked ? handleReset : undefined}
        disabled={!isUnlocked}
        className={`mt-6 w-full max-w-[240px] h-12 rounded-2xl text-sm font-semibold transition ${
          isUnlocked
            ? "bg-printa-red text-white hover:bg-red-700"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isUnlocked ? "Clock In" : "Enter PIN to continue"}
      </button>
    </div>
  );
};

/* ─── Main Page ─── */
const ShiftManagement: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMobilePin, setShowMobilePin] = useState(false);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedId) ?? null,
    [selectedId],
  );

  const handleSelectEmployee = (id: string) => {
    setSelectedId(id);
    setShowMobilePin(true);
  };

  return (
    <DashboardLayout pageTitle="Shift Management">
      {/* ── Mobile full-screen PIN view ── */}
      {showMobilePin && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <PinPad
            employee={selectedEmployee}
            showBackButton
            onBack={() => setShowMobilePin(false)}
          />
        </div>
      )}

      {/* ── Desktop: side-by-side | Mobile: employee list only ── */}
      <div className="flex items-start gap-6">
        {/* Left — Employee list */}
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <h1 className="dashboard-page-title">Shift Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">Select an employee to clock in</p>
          </div>

          {/* Time indicator */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Clock size={13} />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
          </div>

          {/* Employee cards */}
          <div className="space-y-2">
            {employees.map((emp, index) => {
              const isSelected = emp.id === selectedId;
              const colorClass = avatarColors[index % avatarColors.length];
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleSelectEmployee(emp.id)}
                  className={`w-full flex items-center gap-3 px-4 py-5 rounded-2xl text-left transition-all ${
                    isSelected
                      ? "bg-printa-red ring-1 ring-gray-200 shadow-sm"
                      : "hover:bg-white/70 border border-gray-200"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full ${colorClass} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{emp.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{emp.role}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`w-2 h-2 rounded-full ${emp.status === "active" ? "bg-emerald-400" : "bg-gray-300"}`} />
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — PIN pad (desktop only) */}
        <div className="hidden lg:block w-[360px] flex-shrink-0">
          <div className="sticky top-2 h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {selectedEmployee ? (
              <PinPad employee={selectedEmployee} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <LockKeyhole size={22} className="text-gray-300" />
                </div>
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
