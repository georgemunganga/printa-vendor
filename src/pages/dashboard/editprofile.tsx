import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/auth-context";
import { mockOrders } from "@/data/mockOrders";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, MapPin, CheckCircle, ShoppingBag } from "lucide-react";

const initialFormValues = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
};

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormValues);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      dateOfBirth: "",
      address: "",
    });
  }, [user]);

  const handleSave = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please provide a valid email");
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error("Please provide a valid phone number");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setIsEditing(false);
      setIsSaving(false);
      toast.success("Profile updated");
    }, 600);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      dateOfBirth: "",
      address: "",
    });
    setIsEditing(false);
  };

  const formFields = [
    { key: "name", label: "Full Name", icon: User, type: "text", placeholder: "Enter your full name" },
    { key: "email", label: "Email", icon: Mail, type: "email", placeholder: "Enter your email" },
    { key: "phone", label: "Phone", icon: Phone, type: "tel", placeholder: "Enter phone number" },
    { key: "dateOfBirth", label: "Birthday", icon: Calendar, type: "text", placeholder: "DD/MM/YYYY" },
    { key: "address", label: "Address", icon: MapPin, type: "text", placeholder: "Enter your address" },
  ];

  return (
    <DashboardLayout pageTitle="Edit Profile">
      <div className="space-y-4 md:max-w-3xl md:mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="dashboard-page-heading">
            <h1 className="dashboard-page-title">Personal Info</h1>
            <p className="dashboard-page-subtitle">
              Update your profile details
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 text-xs md:text-sm font-semibold text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`px-3 py-2 md:px-4 text-xs md:text-sm font-semibold rounded-xl transition-all active:scale-95 ${
                isEditing
                  ? "bg-printa-red text-white"
                  : "bg-printa-red/10 text-printa-red border border-printa-red/20"
              }`}
            >
              {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {formFields.map((field, index) => {
            const Icon = field.icon;
            return (
              <div
                key={field.key}
                className={`p-4 ${index !== formFields.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <label className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-100">
                    <Icon size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                      {field.label}
                    </span>
                    <Input
                      type={field.type}
                      value={formData[field.key as keyof typeof formData]}
                      disabled={!isEditing}
                      onChange={(event) => setFormData({ ...formData, [field.key]: event.target.value })}
                      placeholder={field.placeholder}
                      className={`border-0 p-0 h-auto text-sm font-medium focus-visible:ring-0 ${
                        isEditing ? "text-gray-900" : "text-gray-600"
                      }`}
                    />
                  </div>
                </label>
              </div>
            );
          })}
        </motion.div>

        {/* Account Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
        >
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span className="text-sm text-gray-600">Status</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                Verified
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">Member since</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{user?.memberSince ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">Total orders</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{mockOrders.length}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default EditProfilePage;
