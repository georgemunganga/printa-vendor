import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  MoreHorizontal,
  Edit2,
  Trash2,
  Send,
  Grid3x3,
  List,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import type { StaffMember, UserRole, Store } from "@/types";
import { toast } from "sonner";
import { useStore } from "@/context/store-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock working hours interface
interface WorkingHours {
  monday?: { start: string; end: string; enabled: boolean };
  tuesday?: { start: string; end: string; enabled: boolean };
  wednesday?: { start: string; end: string; enabled: boolean };
  thursday?: { start: string; end: string; enabled: boolean };
  friday?: { start: string; end: string; enabled: boolean };
  saturday?: { start: string; end: string; enabled: boolean };
  sunday?: { start: string; end: string; enabled: boolean };
}

// Mock stores data
const MOCK_STORES: Store[] = [
  {
    id: "store-1",
    name: "Downtown Branch",
    address: "123 Main St, Lusaka",
    phone: "+260 97 123 4567",
    status: "active",
    businessId: "biz-001",
    createdAt: new Date().toISOString(),
  },
  {
    id: "store-2",
    name: "East Mall Store",
    address: "456 East Ave, Lusaka",
    phone: "+260 97 234 5678",
    status: "active",
    businessId: "biz-001",
    createdAt: new Date().toISOString(),
  },
];

// Mock team members
const MOCK_TEAM: (StaffMember & { workingHours?: WorkingHours })[] = [
  {
    id: "staff-1",
    name: "Sarah Johnson",
    email: "sarah@printa.co.zm",
    phone: "+260 97 111 2222",
    role: "manager",
    permissions: ["manage_pos", "view_orders", "manage_orders", "accept_orders"],
    assignedStoreIds: ["store-1", "store-2"],
    businessId: "biz-001",
    memberSince: "2024-01-15",
    isActive: true,
    workingHours: {
      monday: { start: "08:00", end: "17:00", enabled: true },
      tuesday: { start: "08:00", end: "17:00", enabled: true },
      wednesday: { start: "08:00", end: "17:00", enabled: true },
      thursday: { start: "08:00", end: "17:00", enabled: true },
      friday: { start: "08:00", end: "17:00", enabled: true },
    },
  },
  {
    id: "staff-2",
    name: "Michael Banda",
    email: "michael@printa.co.zm",
    phone: "+260 97 333 4444",
    role: "staff",
    permissions: ["use_pos", "view_orders", "clock_in_out"],
    assignedStoreIds: ["store-1"],
    businessId: "biz-001",
    memberSince: "2024-02-10",
    isActive: true,
    workingHours: {
      monday: { start: "09:00", end: "18:00", enabled: true },
      wednesday: { start: "09:00", end: "18:00", enabled: true },
      friday: { start: "09:00", end: "18:00", enabled: true },
    },
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Team member",
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const Team: React.FC = () => {
  const { availableStores: stores } = useStore();
  const [team, setTeam] = useState(MOCK_TEAM);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [addType, setAddType] = useState<"direct" | "invite" | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff" as UserRole,
    assignedStoreIds: [] as string[],
    workingHours: {} as WorkingHours,
  });

  const handleOpenAdd = (type: "direct" | "invite") => {
    setAddType(type);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "staff",
      assignedStoreIds: [],
      workingHours: {},
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (member: StaffMember & { workingHours?: WorkingHours }) => {
    setEditingMember(member.id);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      assignedStoreIds: member.assignedStoreIds,
      workingHours: member.workingHours || {},
    });
    setIsAddOpen(true);
    setSelectedMember(null);
  };

  const handleClose = () => {
    setIsAddOpen(false);
    setEditingMember(null);
    setAddType(null);
  };

  const handleSubmit = () => {
    if (editingMember) {
      setTeam((prev) =>
        prev.map((m) =>
          m.id === editingMember
            ? {
                ...m,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                assignedStoreIds: formData.assignedStoreIds,
                workingHours: formData.workingHours,
              }
            : m
        )
      );
      toast.success("Team member updated");
    } else {
      const newMember: StaffMember & { workingHours?: WorkingHours } = {
        id: `staff-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        permissions: [],
        assignedStoreIds: formData.assignedStoreIds,
        businessId: "biz-001",
        memberSince: new Date().toISOString().split("T")[0],
        isActive: true,
        workingHours: formData.workingHours,
      };

      if (addType === "invite") {
        toast.success(`Invitation sent to ${formData.email}`);
      } else {
        toast.success("Team member added");
      }

      setTeam((prev) => [...prev, newMember]);
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
    toast.success("Team member removed");
    setSelectedMember(null);
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: prev.workingHours[day as keyof WorkingHours]?.enabled
          ? { ...prev.workingHours[day as keyof WorkingHours]!, enabled: false }
          : { start: "09:00", end: "17:00", enabled: true },
      },
    }));
  };

  const updateDayTime = (
    day: string,
    field: "start" | "end",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof WorkingHours]!,
          [field]: value,
        },
      },
    }));
  };

  const getStoreNames = (storeIds: string[]) => {
    const availableStores = stores.length > 0 ? stores : MOCK_STORES;
    const names = storeIds
      .map((id) => availableStores.find((s) => s.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "No stores";
  };

  return (
    <DashboardLayout pageTitle="Team">
      <div className="mb-5">
        <div className="flex items-start justify-between gap-2 md:gap-4">
          <div>
            <h1 className="dashboard-page-title">Team</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {team.length} {team.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle - Hidden on mobile */}
            <div className="hidden md:flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition ${
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
                title="Grid view"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition ${
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>

            {/* Mobile: Icon-only buttons */}
            <Button
              onClick={() => handleOpenAdd("invite")}
              variant="outline"
              className="gap-2"
              size="sm"
            >
              <Mail size={16} />
              <span className="hidden sm:inline">Invite</span>
            </Button>
            <Button
              onClick={() => handleOpenAdd("direct")}
              className="gap-2 bg-gray-900 hover:bg-gray-800"
              size="sm"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {team.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-24 h-24 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-2xl mb-3">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500 truncate w-full">{member.email}</p>
              </div>

              {/* Role Dropdown */}
              <div className="mb-4">
                <select
                  value={member.role}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    setTeam((prev) =>
                      prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
                    );
                    toast.success("Role updated");
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="owner">Team owner</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block  rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-3">Stores</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {team.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-12 gap-4 px- py-6 hover:bg-gray-50 transition items-center"
                >
                {/* Name */}
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="col-span-3">
                  <p className="text-sm text-gray-600 truncate">{member.email}</p>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {ROLE_LABELS[member.role]}
                  </span>
                </div>

                {/* Stores */}
                <div className="col-span-3">
                  <p className="text-sm text-gray-600 truncate">
                    {getStoreNames(member.assignedStoreIds)}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-2 relative">
                  <button
                    onClick={() =>
                      setSelectedMember(selectedMember === member.id ? null : member.id)
                    }
                    className="p-1.5 hover:bg-gray-100 rounded transition"
                  >
                    <MoreHorizontal size={16} className="text-gray-500" />
                  </button>

                  {selectedMember === member.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Empty State */}
            {team.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No team members yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {team.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSelectedMember(selectedMember === member.id ? null : member.id)
                  }
                  className="p-1.5 hover:bg-gray-100 rounded transition"
                >
                  <MoreHorizontal size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {ROLE_LABELS[member.role]}
                </span>
                <p className="text-xs text-gray-500 truncate ml-2">
                  {getStoreNames(member.assignedStoreIds)}
                </p>
              </div>

              {selectedMember === member.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              )}
            </motion.div>
          ))}

          {/* Empty State */}
          {team.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No team members yet</p>
            </div>
          )}
        </div>
      </>
      )}

      {/* Add/Edit Modal */}
      <ResponsiveModal
        open={isAddOpen}
        onOpenChange={(open) => !open && handleClose()}
        title={
          editingMember
            ? "Edit team member"
            : addType === "invite"
            ? "Invite team member"
            : "Add team member"
        }
      >
        <div className="space-y-4 p-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          {addType !== "invite" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+260 97 123 4567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>Role</Label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {(["owner", "manager", "staff"] as UserRole[]).map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          {/* Store Assignment */}
          <div className="space-y-2">
            <Label>Assigned stores</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(stores.length > 0 ? stores : MOCK_STORES).map((store) => {
                const isAssigned = formData.assignedStoreIds.includes(store.id);

                return (
                  <label
                    key={store.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            assignedStoreIds: [
                              ...prev.assignedStoreIds,
                              store.id,
                            ],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            assignedStoreIds: prev.assignedStoreIds.filter(
                              (id) => id !== store.id
                            ),
                          }));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {store.name}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email}
              className="flex-1 bg-gray-900 hover:bg-gray-800"
            >
              {addType === "invite" && <Send size={16} className="mr-2" />}
              {editingMember
                ? "Save"
                : addType === "invite"
                ? "Send invite"
                : "Add"}
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </DashboardLayout>
  );
};

export default Team;
