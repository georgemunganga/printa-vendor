import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, MoreHorizontal, Edit2, Trash2, Send, Grid3X3, List, Users } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { toast } from "sonner";
import { useStore } from "@/context/store-context";
import { inventoryService } from "@/services/inventory.service";
import type { StoreStaffDto } from "@/services/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TeamRole = "manager" | "staff" | "cashier";

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  assignedStoreIds: string[];
  active: boolean;
}

const ROLE_LABELS: Record<TeamRole, string> = {
  manager: "Manager",
  staff: "Team member",
  cashier: "Cashier",
};

const toRole = (role: string): TeamRole => {
  switch (role.toUpperCase()) {
    case "MANAGER": return "manager";
    case "CASHIER": return "cashier";
    default: return "staff";
  }
};

const nameForStaff = (staff: StoreStaffDto) => {
  const fullName = `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim();
  return fullName || staff.email || "Unnamed team member";
};

const Team = () => {
  const { availableStores: stores } = useStore();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<"assign" | "invite">("assign");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ email: "", role: "staff" as TeamRole, assignedStoreIds: [] as string[] });

  const refreshTeam = useCallback(async () => {
    if (stores.length === 0) {
      setTeam([]);
      setLoadError(null);
      return;
    }
    setIsLoading(true);
    try {
      const results = await Promise.all(stores.map(async (store) => ({ store, staff: await inventoryService.listStaff(store.id) })));
      const byUserId = new Map<string, TeamMember>();
      for (const { store, staff } of results) {
        for (const member of staff) {
          const existing = byUserId.get(member.user_id);
          if (existing) {
            existing.assignedStoreIds.push(store.id);
          } else {
            byUserId.set(member.user_id, {
              userId: member.user_id,
              name: nameForStaff(member),
              email: member.email ?? "",
              role: toRole(member.role),
              assignedStoreIds: [store.id],
              active: member.is_active,
            });
          }
        }
      }
      setTeam([...byUserId.values()].sort((left, right) => left.name.localeCompare(right.name)));
      setLoadError(null);
    } catch (error) {
      setTeam([]);
      setLoadError(error instanceof Error ? error.message : "Unable to load team members.");
    } finally {
      setIsLoading(false);
    }
  }, [stores]);

  useEffect(() => {
    void refreshTeam();
  }, [refreshTeam, reloadKey]);

  const getStoreNames = (storeIds: string[]) => {
    const names = storeIds.map((id) => stores.find((store) => store.id === id)?.name).filter(Boolean);
    return names.length ? names.join(", ") : "No stores";
  };

  const openAssign = (mode: "assign" | "invite") => {
    setAssignmentMode(mode);
    setEditingMember(null);
    setFormData({ email: "", role: "staff", assignedStoreIds: stores.length === 1 ? [stores[0].id] : [] });
    setIsMemberModalOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditingMember(member);
    setAssignmentMode("assign");
    setFormData({ email: member.email, role: member.role, assignedStoreIds: member.assignedStoreIds });
    setSelectedMember(null);
    setIsMemberModalOpen(true);
  };

  const closeModal = (open: boolean) => {
    if (!open && !isSaving) {
      setIsMemberModalOpen(false);
      setEditingMember(null);
    }
  };

  const toggleStore = (storeId: string) => {
    setFormData((current) => ({
      ...current,
      assignedStoreIds: current.assignedStoreIds.includes(storeId)
        ? current.assignedStoreIds.filter((id) => id !== storeId)
        : [...current.assignedStoreIds, storeId],
    }));
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    const email = formData.email.trim().toLowerCase();
    if (!email || formData.assignedStoreIds.length === 0) {
      toast.error("Enter a registered team member email and select at least one store.");
      return;
    }

    setIsSaving(true);
    try {
      const backendRole = formData.role.toUpperCase() as "STAFF" | "MANAGER" | "CASHIER";
      if (editingMember) {
        const previousStoreIds = new Set(editingMember.assignedStoreIds);
        const nextStoreIds = new Set(formData.assignedStoreIds);
        await Promise.all([...previousStoreIds].filter((storeId) => !nextStoreIds.has(storeId)).map((storeId) => inventoryService.removeStaff(storeId, editingMember.userId)));
        await Promise.all([...nextStoreIds].filter((storeId) => !previousStoreIds.has(storeId)).map((storeId) => inventoryService.addStaffByEmail(storeId, { email, role: backendRole })));
        if (editingMember.role !== formData.role) {
          await Promise.all([...nextStoreIds].filter((storeId) => previousStoreIds.has(storeId)).map((storeId) => inventoryService.updateStaffRole(storeId, editingMember.userId, backendRole)));
        }
        toast.success("Team member assignments updated.");
      } else {
        await Promise.all(formData.assignedStoreIds.map((storeId) => inventoryService.addStaffByEmail(storeId, { email, role: backendRole })));
        toast.success(assignmentMode === "invite" ? "Registered team member assigned to selected stores." : "Team member assigned to selected stores.");
      }
      await refreshTeam();
      setIsMemberModalOpen(false);
      setEditingMember(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update team assignments.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (member: TeamMember) => {
    try {
      await Promise.all(member.assignedStoreIds.map((storeId) => inventoryService.removeStaff(storeId, member.userId)));
      await refreshTeam();
      toast.success("Team member removed from assigned stores.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove team member.");
    } finally {
      setSelectedMember(null);
    }
  };

  return (
    <DashboardLayout pageTitle="Team">
      <div className="mb-5"><div className="flex items-start justify-between gap-2 md:gap-4"><div><h1 className="dashboard-page-title">Team</h1><p className="text-xs text-gray-400 mt-0.5">{team.length} {team.length === 1 ? "member" : "members"}</p></div><div className="flex items-center gap-2"><div className="hidden md:flex items-center border border-gray-200 rounded-xl overflow-hidden"><button type="button" onClick={() => setViewMode("grid")} className={`p-2 transition ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-400 hover:text-gray-600"}`} title="Grid view"><Grid3X3 size={18} /></button><button type="button" onClick={() => setViewMode("list")} className={`p-2 transition ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-400 hover:text-gray-600"}`} title="List view"><List size={18} /></button></div><Button onClick={() => openAssign("invite")} variant="outline" className="gap-2" size="sm"><Mail size={16} /><span className="hidden sm:inline">Invite</span></Button><Button onClick={() => openAssign("assign")} className="gap-2 bg-gray-900 hover:bg-gray-800" size="sm"><UserPlus size={16} /><span className="hidden sm:inline">Add</span></Button></div></div></div>

      {isLoading ? <div className="rounded-xl bg-white border border-gray-200 p-12 text-center text-sm text-gray-500">Loading live team assignments...</div> : loadError ? <div className="rounded-xl bg-white border border-gray-200 p-12 text-center"><p className="text-sm font-semibold text-gray-900">Unable to load team members</p><p className="mt-1 text-xs text-gray-500">{loadError}</p><button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-3 text-xs font-semibold text-printa-red hover:underline">Try again</button></div> : team.length === 0 ? <div className="rounded-xl bg-white border border-gray-200 p-12 text-center"><Users size={28} className="mx-auto text-gray-300 mb-3" /><p className="text-sm font-semibold text-gray-900">No team members yet</p><p className="mt-1 text-xs text-gray-500">Assign a registered Printa user to one or more stores to get started.</p></div> : viewMode === "grid" ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{team.map((member) => <motion.div key={member.userId} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"><div className="flex flex-col items-center text-center mb-4"><div className="w-24 h-24 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-2xl mb-3">{member.name.split(" ").map((name) => name[0]).join("")}</div><h3 className="font-semibold text-gray-900">{member.name}</h3><p className="text-sm text-gray-500 truncate w-full">{member.email}</p></div><div className="mb-4 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700">{ROLE_LABELS[member.role]}</div><p className="text-xs text-gray-500 min-h-10">{getStoreNames(member.assignedStoreIds)}</p><div className="flex items-center gap-2 mt-4"><button type="button" onClick={() => openEdit(member)} className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition">Edit</button><button type="button" onClick={() => void handleRemove(member)} className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"><Trash2 size={16} /></button></div></motion.div>)}</div> : <><div className="hidden md:block rounded-xl overflow-hidden"><div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider"><div className="col-span-3">Name</div><div className="col-span-3">Email</div><div className="col-span-2">Role</div><div className="col-span-3">Stores</div><div className="col-span-1 text-right">Actions</div></div><div className="divide-y divide-gray-100">{team.map((member) => <motion.div key={member.userId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition items-center"><div className="col-span-3 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">{member.name.split(" ").map((name) => name[0]).join("")}</div><p className="font-medium text-gray-900 truncate">{member.name}</p></div><p className="col-span-3 text-sm text-gray-600 truncate">{member.email}</p><div className="col-span-2"><span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{ROLE_LABELS[member.role]}</span></div><p className="col-span-3 text-sm text-gray-600 truncate">{getStoreNames(member.assignedStoreIds)}</p><div className="col-span-1 flex justify-end relative"><button type="button" onClick={() => setSelectedMember(selectedMember === member.userId ? null : member.userId)} className="p-1.5 hover:bg-gray-100 rounded transition"><MoreHorizontal size={16} className="text-gray-500" /></button>{selectedMember === member.userId && <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10"><button type="button" onClick={() => openEdit(member)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"><Edit2 size={14} /> Edit</button><button type="button" onClick={() => void handleRemove(member)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"><Trash2 size={14} /> Remove</button></div>}</div></motion.div>)}</div></div><div className="md:hidden space-y-3">{team.map((member) => <motion.div key={member.userId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-xl p-4"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">{member.name.split(" ").map((name) => name[0]).join("")}</div><div><p className="font-medium text-gray-900">{member.name}</p><p className="text-xs text-gray-500">{member.email}</p></div></div><button type="button" onClick={() => setSelectedMember(selectedMember === member.userId ? null : member.userId)} className="p-1.5 hover:bg-gray-100 rounded transition"><MoreHorizontal size={18} className="text-gray-500" /></button></div><div className="flex items-center justify-between text-sm"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{ROLE_LABELS[member.role]}</span><p className="text-xs text-gray-500 truncate ml-2">{getStoreNames(member.assignedStoreIds)}</p></div>{selectedMember === member.userId && <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2"><button type="button" onClick={() => openEdit(member)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"><Edit2 size={14} /> Edit</button><button type="button" onClick={() => void handleRemove(member)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"><Trash2 size={14} /> Remove</button></div>}</motion.div>)}</div></>}

      <ResponsiveModal open={isMemberModalOpen} onOpenChange={closeModal} title={editingMember ? "Edit team member assignments" : assignmentMode === "invite" ? "Invite team member" : "Add team member"}><div className="space-y-4 p-4"><p className="text-sm text-gray-500">{editingMember ? "Update this member’s store assignments. Identity and existing assignment roles are managed by the account and store permission policy." : "The team member must already have a verified Printa account. Their selected store assignment will be saved immediately."}</p><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} readOnly={Boolean(editingMember)} required /></div><div className="space-y-2"><Label>Role for new store assignments</Label><select value={formData.role} onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value as TeamRole }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"><option value="manager">Manager</option><option value="staff">Team member</option><option value="cashier">Cashier</option></select></div><div className="space-y-2"><Label>Assigned stores</Label><div className="space-y-2 max-h-40 overflow-y-auto">{stores.map((store) => { const assigned = formData.assignedStoreIds.includes(store.id); return <label key={store.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"><input type="checkbox" checked={assigned} onChange={() => toggleStore(store.id)} className="w-4 h-4 rounded border-gray-300" /><div className="flex-1"><p className="text-sm font-medium text-gray-900">{store.name}</p></div></label>; })}</div></div><div className="flex gap-2 pt-4"><Button onClick={() => closeModal(false)} variant="outline" className="flex-1" disabled={isSaving}>Cancel</Button><Button onClick={() => void handleSubmit()} disabled={isSaving || !formData.email || formData.assignedStoreIds.length === 0} className="flex-1 bg-gray-900 hover:bg-gray-800">{assignmentMode === "invite" && !editingMember && <Send size={16} className="mr-2" />}{isSaving ? "Saving..." : editingMember ? "Save" : assignmentMode === "invite" ? "Assign" : "Add"}</Button></div></div></ResponsiveModal>
    </DashboardLayout>
  );
};

export default Team;
