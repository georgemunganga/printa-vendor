import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Clock, Delete, LockKeyhole } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { Button } from "@/components/ui/button";
import { useStoreStaffQuery } from "@/query/hooks";

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

/* ─── PIN Pad Sub-component ─── */
const PinPad: React.FC<{
  employee: Employee;
  onBack?: () => void;
  showBackButton?: boolean;
}> = ({ employee, onBack, showBackButton }) => {
  const dots = Array.from({ length: 4 });

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
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
        <p className="text-sm text-gray-400">Clock-in service is not configured</p>
      </div>

      <div className="flex gap-3 mb-8" aria-hidden="true">
        {dots.map((_, idx) => (
          <div key={idx} className="h-3 w-3 rounded-full bg-gray-200" />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]" aria-label="PIN entry unavailable">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled
            className="h-14 rounded-2xl bg-gray-50 text-lg font-semibold text-gray-300 cursor-not-allowed"
          >
            {digit}
          </button>
        ))}
        <div />
        <button type="button" disabled className="h-14 rounded-2xl bg-gray-50 text-lg font-semibold text-gray-300 cursor-not-allowed">
          0
        </button>
        <button
          type="button"
          disabled
          className="h-14 rounded-2xl bg-gray-50 text-gray-300 cursor-not-allowed flex items-center justify-center"
          aria-label="Delete digit"
        >
          <Delete size={18} />
        </button>
      </div>

      <Button
        type="button"
        disabled
        className="mt-6 w-full max-w-[240px] h-12 rounded-2xl bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        Clock-in unavailable
      </Button>
      <p className="mt-3 max-w-[260px] text-center text-xs leading-5 text-gray-400">
        PIN verification and attendance recording will be enabled when the staff clock API is available.
      </p>
    </div>
  );
};

/* ─── Main Page ─── */
const ShiftManagement: React.FC = () => {
  const { user } = useAuth();
  const { activeStore } = useStore();
  const { data: storeStaff = [], isLoading: isLoadingStaff } = useStoreStaffQuery(activeStore?.id);
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
            status: member.user_id === user?.id && member.is_active ? "active" : "off",
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
    () => scopedEmployees.find((e) => e.id === selectedId) ?? null,
    [scopedEmployees, selectedId],
  );

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
            <p className="text-xs text-gray-400 mt-0.5">
              {activeStore?.name ?? "Store"} · Review assigned staff
            </p>
          </div>

          {/* Time indicator */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Clock size={13} />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
          </div>

          {/* Employee cards */}
          <div className="space-y-2">
            {isLoadingStaff ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-400">Loading staff directory…</div>
            ) : scopedEmployees.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-400">
                No staff members are assigned to this store yet.
              </div>
            ) : (
              scopedEmployees.map((emp, index) => {
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
              })
            )}
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
                <p className="text-xs text-gray-300 mt-1">Choose from the list to view clock service status</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShiftManagement;
