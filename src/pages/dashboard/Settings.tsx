import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bell, Lock, Shield, DollarSign, Smartphone, Check, Clock, LogOut, Store, Package, Building2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useCurrencyContext } from "@/context/currency-context";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { operatingHoursService } from "@/services/operating-hours.service";
import { inventoryService } from "@/services/inventory.service";
import { defaultNotificationPreferences, notificationPreferencesService, type NotificationPreferencesDto } from "@/services/notification-preferences.service";
import type { OperatingHourDto, StoreDto } from "@/services/contracts";

interface SettingCard {
  title: string;
  description: string;
  icon: ReactNode;
  variant?: "app";
  action?: () => void;
}

type ModalType = "store" | "security" | "notifications" | "privacy" | "currency" | "hours" | "download" | null;

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const createEmptyOperatingHours = (): OperatingHourDto[] =>
  WEEKDAYS.map((_, day) => ({ day_of_week: day, is_open: false }));

interface StoreSettingsForm {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
}

const emptyStoreForm: StoreSettingsForm = {
  name: "",
  description: "",
  address: "",
  city: "",
  country: "Zambia",
  phone: "",
  email: "",
};

const toStoreForm = (store: StoreDto): StoreSettingsForm => ({
  name: store.name ?? "",
  description: store.description ?? "",
  address: store.address ?? "",
  city: store.city ?? "",
  country: store.country ?? "Zambia",
  phone: store.phone ?? "",
  email: store.email ?? "",
});

const SettingsPage = () => {
  const { selectedCurrency, availableCurrencies, setSelectedCurrency } = useCurrencyContext();
  const { logout, can, isOwner, user } = useAuth();
  const userId = user?.id;
  const { activeStore, setActiveStore, refreshStores } = useStore();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [storeForm, setStoreForm] = useState<StoreSettingsForm>(emptyStoreForm);
  const [storeDetails, setStoreDetails] = useState<StoreDto | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(false);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [operatingHours, setOperatingHours] = useState<OperatingHourDto[]>(createEmptyOperatingHours);
  const [isLoadingOperatingHours, setIsLoadingOperatingHours] = useState(false);
  const [isSavingOperatingHours, setIsSavingOperatingHours] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferencesDto>(defaultNotificationPreferences);
  const [isLoadingNotificationPreferences, setIsLoadingNotificationPreferences] = useState(false);
  const [isSavingNotificationPreferences, setIsSavingNotificationPreferences] = useState(false);
  const canEditStoreSettings = isOwner() || can("edit_store_settings");
  const canManageNotificationPreferences = isOwner() || can("manage_notifications") || can("manage_settings");

  useEffect(() => {
    if (!activeStore?.id) {
      setStoreDetails(null);
      setStoreForm(emptyStoreForm);
      return;
    }

    let cancelled = false;
    setIsLoadingStore(true);
    void inventoryService.getStore(activeStore.id)
      .then((store) => {
        if (cancelled) return;
        setStoreDetails(store);
        setStoreForm(toStoreForm(store));
      })
      .catch(() => {
        if (cancelled) return;
        setStoreDetails(null);
        setStoreForm({
          ...emptyStoreForm,
          name: activeStore.name,
          address: activeStore.address,
          phone: activeStore.phone,
          email: activeStore.email ?? "",
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingStore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeStore?.id, activeStore?.name, activeStore?.address, activeStore?.phone, activeStore?.email]);

  useEffect(() => {
    if (activeModal !== "notifications" || !activeStore?.id || !userId) return;

    let cancelled = false;
    setIsLoadingNotificationPreferences(true);
    void notificationPreferencesService.get(userId, activeStore.id)
      .then((preferences) => {
        if (!cancelled) setNotificationPreferences(preferences);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingNotificationPreferences(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeModal, activeStore?.id, userId]);

  const openStoreSettings = () => {
    if (!activeStore) {
      toast.error("Select a store before managing store profile.");
      return;
    }
    setActiveModal("store");
  };

  const updateStoreForm = (field: keyof StoreSettingsForm, value: string) => {
    setStoreForm((current) => ({ ...current, [field]: value }));
  };

  const saveStoreProfile = async () => {
    if (!activeStore || !canEditStoreSettings) return;
    if (!storeForm.name.trim() || !storeForm.address.trim() || !storeForm.city.trim() || !storeForm.country.trim()) {
      toast.error("Store name, address, city, and country are required.");
      return;
    }

    setIsSavingStore(true);
    try {
      const updated = await inventoryService.updateStore(activeStore.id, {
        name: storeForm.name.trim(),
        description: storeForm.description.trim(),
        address: storeForm.address.trim(),
        city: storeForm.city.trim(),
        country: storeForm.country.trim(),
        phone: storeForm.phone.trim(),
        email: storeForm.email.trim(),
      });
      setStoreDetails(updated);
      setStoreForm(toStoreForm(updated));
      await refreshStores();
      toast.success("Store profile saved.");
      setActiveModal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save store profile.");
    } finally {
      setIsSavingStore(false);
    }
  };

  const updateNotificationPreference = (field: keyof NotificationPreferencesDto, value: boolean) => {
    setNotificationPreferences((current) => ({ ...current, [field]: value }));
  };

  const saveNotificationPreferences = async () => {
    if (!activeStore?.id || !userId || !canManageNotificationPreferences) return;
    setIsSavingNotificationPreferences(true);
    try {
      const saved = await notificationPreferencesService.save(userId, activeStore.id, notificationPreferences);
      setNotificationPreferences(saved);
      toast.success("Notification preferences saved.");
      setActiveModal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save notification preferences.");
    } finally {
      setIsSavingNotificationPreferences(false);
    }
  };

  const coreSettings = useMemo<SettingCard[]>(
    () => [
      {
        title: "Security",
        description: "Use OTP-based sign-in and review future session controls.",
        icon: <Lock size={18} className="text-printa-red" />,
        action: () => setActiveModal("security"),
      },
      {
        title: "Notifications",
        description: "Choose what updates and reminders you receive via email or SMS.",
        icon: <Bell size={18} className="text-printa-red" />,
        action: () => setActiveModal("notifications"),
      },
      {
        title: "Privacy",
        description: "Adjust what information is shared with partners and analytics providers.",
        icon: <Shield size={18} className="text-printa-red" />,
        action: () => setActiveModal("privacy"),
      },
    ],
    [setActiveModal]
  );

  const openOperatingHours = async () => {
    if (!activeStore) {
      toast.error("Select a store before managing operating hours.");
      return;
    }

    setActiveModal("hours");
    setIsLoadingOperatingHours(true);
    try {
      const persistedHours = await operatingHoursService.list(activeStore.id);
      const byDay = new Map(persistedHours.map((hour) => [hour.day_of_week, hour]));
      setOperatingHours(WEEKDAYS.map((_, day) => byDay.get(day) || { day_of_week: day, is_open: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load operating hours.";
      toast.error(message);
      setActiveModal(null);
    } finally {
      setIsLoadingOperatingHours(false);
    }
  };

  const updateOperatingHour = (day: number, patch: Partial<OperatingHourDto>) => {
    setOperatingHours((previous) => previous.map((hour) => {
      if (hour.day_of_week !== day) return hour;
      const next = { ...hour, ...patch };
      if (!next.is_open) {
        delete next.opens_at;
        delete next.closes_at;
      }
      return next;
    }));
  };

  const applyOperatingHoursPreset = (preset: "weekdays" | "all" | "clear") => {
    setOperatingHours(WEEKDAYS.map((_, day) => {
      if (preset === "clear") return { day_of_week: day, is_open: false };
      const isOpen = preset === "all" || day < 5;
      return isOpen
        ? { day_of_week: day, is_open: true, opens_at: "08:00", closes_at: "17:00" }
        : { day_of_week: day, is_open: false };
    }));
  };

  const getOperatingHoursError = () => {
    const invalid = operatingHours.find((hour) => hour.is_open && (!hour.opens_at || !hour.closes_at));
    if (invalid) return `${WEEKDAYS[invalid.day_of_week]} needs both opening and closing times.`;

    const sameTime = operatingHours.find((hour) => hour.is_open && hour.opens_at === hour.closes_at);
    if (sameTime) return `${WEEKDAYS[sameTime.day_of_week]} opening and closing times cannot be the same.`;

    return null;
  };

  const saveOperatingHours = async () => {
    if (!activeStore || !canEditStoreSettings) return;
    const validationError = getOperatingHoursError();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setIsSavingOperatingHours(true);
    try {
      await operatingHoursService.replace(activeStore.id, { hours: operatingHours });
      toast.success("Operating hours saved.");
      setActiveModal(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save operating hours.";
      toast.error(message);
    } finally {
      setIsSavingOperatingHours(false);
    }
  };

  const settings = useMemo<SettingCard[]>(() => {
    const currencySetting = {
      title: "Currency",
      description: `${selectedCurrency.code} · ${selectedCurrency.name}`,
      icon: <DollarSign size={18} className="text-printa-red" />,
      action: () => setActiveModal("currency"),
    };

    return [...coreSettings, currencySetting];
  }, [selectedCurrency, coreSettings]);

  return (
    <DashboardLayout pageTitle="Store Settings">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          {/* <p className="text-sm font-semibold text-printa-red">Settings</p> */}
          <h1 className="dashboard-page-title">Store Settings</h1>
          <p className="dashboard-page-subtitle">Manage this store’s public profile, hours, inventory, notifications, and security.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-printa-red/10 p-3 text-printa-red">
                  <Building2 size={18} className="text-printa-red" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Store Profile</p>
                  <p className="text-sm text-gray-500">Set the store details used on POS, receipts, orders, and customer-facing pages.</p>
                  <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                    <span className="font-semibold text-gray-800">{storeDetails?.name ?? activeStore?.name ?? "No store selected"}</span>
                    <span>{storeDetails?.phone || activeStore?.phone || "No phone set"}</span>
                    <span className="sm:col-span-2 flex items-start gap-1.5"><MapPin size={13} className="mt-0.5 shrink-0 text-gray-400" />{storeDetails ? [storeDetails.address, storeDetails.city, storeDetails.country].filter(Boolean).join(", ") || "No address set" : activeStore?.address ?? "No address set"}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="text-sm font-semibold text-printa-red" onClick={openStoreSettings} disabled={!activeStore}>
                {canEditStoreSettings ? "Manage" : "View"}
              </Button>
            </div>
            {!canEditStoreSettings && activeStore && (
              <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">Only the store owner or an authorized manager can change this profile.</p>
            )}
          </div>

          {settings.map((setting) => (
            <div
              key={setting.title}
              className={`flex flex-col rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
                setting.variant === "app"
                  ? "bg-printa-red text-white border-0"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-2xl p-3 ${
                    setting.variant === "app" ? "bg-white/20" : "bg-printa-red/10 text-printa-red"
                  }`}
                >
                  {setting.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{setting.title}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className={`text-sm font-semibold ${
                  setting.variant === "app" ? "text-white/80" : "text-printa-red"
                }`}
                onClick={setting.action}
              >
                Manage
              </Button>
            </div>
          ))}

          <div
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-2xl p-3 bg-printa-red/10 text-printa-red">
                <Clock size={18} className="text-printa-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Operating Hours</p>
                <p className="text-sm text-gray-500">
                  {activeStore ? `Set the published hours for ${activeStore.name}.` : "Select a store to manage published hours."}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-sm font-semibold text-printa-red"
              onClick={() => void openOperatingHours()}
              disabled={!activeStore}
            >
              Manage
            </Button>
          </div>

          {/* Inventory link */}
          <div
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:border-gray-300 transition-colors"
            onClick={() => navigate("/dashboard/inventory")}
          >
            <div className="flex items-center gap-4">
              <div className="rounded-2xl p-3 bg-printa-red/10 text-printa-red">
                <Package size={18} className="text-printa-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Inventory</p>
                <p className="text-sm text-gray-500">Manage your stock, paper, ink, and supplies.</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-sm font-semibold text-printa-red"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/dashboard/inventory");
              }}
            >
              Manage
            </Button>
          </div>

          <div className="flex flex-col rounded-2xl border-0 bg-printa-red p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/30 p-3 text-white">
                  <Smartphone size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Download</p>
                  <p className="text-sm text-white">Download the Printa app from Google Play or the App Store.</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className={`text-sm font-semibold bg-white  text-printa-red`}
                onClick={() => setActiveModal("download")}
              >
                Download Now
              </Button>
            </div>
        </div>

        {/* Sign Out / Logout – mobile only */}
        <div className="space-y-3 pt-4 md:hidden">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl border-gray-200 px-5 py-6 text-sm font-semibold text-gray-700"
            onClick={() => {
              setActiveStore(null);
              navigate("/dashboard/stores", { replace: true });
              toast.success("Signed out of store");
            }}
          >
            <Store size={18} className="text-gray-500" />
            Sign Out of Store
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl border-red-200 bg-red-50 px-5 py-6 text-sm font-semibold text-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={() => {
              logout();
              toast.success("Logged out successfully");
              navigate("/login", { replace: true });
            }}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>

      <ResponsiveModal
        open={activeModal === "store"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <Building2 size={20} className="text-printa-red" />
            Store Profile
          </span>
        }
        description={activeStore ? `Public store details for ${activeStore.name}.` : "Select a store to manage its profile."}
      >
        {isLoadingStore ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading store profile…</div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="store-name">Store name *</Label>
                <Input id="store-name" value={storeForm.name} onChange={(event) => updateStoreForm("name", event.target.value)} disabled={!canEditStoreSettings || isSavingStore} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="store-description">Store description</Label>
                <Textarea id="store-description" value={storeForm.description} onChange={(event) => updateStoreForm("description", event.target.value)} disabled={!canEditStoreSettings || isSavingStore} placeholder="A short description customers and staff can recognize." className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="store-address">Street address *</Label>
                <Input id="store-address" value={storeForm.address} onChange={(event) => updateStoreForm("address", event.target.value)} disabled={!canEditStoreSettings || isSavingStore} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="store-city">City *</Label>
                <Input id="store-city" value={storeForm.city} onChange={(event) => updateStoreForm("city", event.target.value)} disabled={!canEditStoreSettings || isSavingStore} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="store-country">Country *</Label>
                <Input id="store-country" value={storeForm.country} onChange={(event) => updateStoreForm("country", event.target.value)} disabled={!canEditStoreSettings || isSavingStore} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="store-phone">Phone</Label>
                <Input id="store-phone" value={storeForm.phone} onChange={(event) => updateStoreForm("phone", event.target.value)} disabled={!canEditStoreSettings || isSavingStore} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="store-email">Email</Label>
                <Input id="store-email" type="email" value={storeForm.email} onChange={(event) => updateStoreForm("email", event.target.value)} disabled={!canEditStoreSettings || isSavingStore} className="mt-1" />
              </div>
            </div>
            {!canEditStoreSettings && (
              <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">You can view this profile, but only the owner or an authorized manager can save changes.</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setActiveModal(null)} disabled={isSavingStore}>Close</Button>
              {canEditStoreSettings && (
                <Button className="bg-printa-red hover:bg-printa-red/90" onClick={() => void saveStoreProfile()} disabled={isSavingStore || !activeStore}>
                  {isSavingStore ? "Saving…" : "Save profile"}
                </Button>
              )}
            </div>
          </div>
        )}
      </ResponsiveModal>

      <ResponsiveModal
        open={activeModal === "hours"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <Clock size={20} className="text-printa-red" />
            Operating Hours
          </span>
        }
        description={activeStore ? `Published availability for ${activeStore.name}.` : "Select a store to manage operating hours."}
      >
        {isLoadingOperatingHours ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading operating hours…</div>
        ) : (
          <div className="space-y-3 py-2">
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-gray-500">Set the hours customers and staff see for this store. Closed days are saved without times.</p>
              {canEditStoreSettings && (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => applyOperatingHoursPreset("weekdays")} disabled={isSavingOperatingHours}>Weekdays 08:00–17:00</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => applyOperatingHoursPreset("all")} disabled={isSavingOperatingHours}>Open all days</Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => applyOperatingHoursPreset("clear")} disabled={isSavingOperatingHours}>Clear</Button>
                </div>
              )}
            </div>
            {operatingHours.map((hour) => (
              <div key={hour.day_of_week} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 lg:flex-row lg:items-center">
                <div className="flex min-w-28 items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-800">{WEEKDAYS[hour.day_of_week]}</span>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${hour.is_open ? "bg-red-50 text-printa-red" : "bg-gray-100 text-gray-500"}`}
                    onClick={() => updateOperatingHour(hour.day_of_week, { is_open: !hour.is_open, opens_at: hour.opens_at || "08:00", closes_at: hour.closes_at || "17:00" })}
                    disabled={!canEditStoreSettings || isSavingOperatingHours}
                  >
                    {hour.is_open ? "Open" : "Closed"}
                  </button>
                </div>
                {hour.is_open ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      aria-label={`${WEEKDAYS[hour.day_of_week]} opening time`}
                      type="time"
                      value={hour.opens_at || ""}
                      onChange={(event) => updateOperatingHour(hour.day_of_week, { opens_at: event.target.value })}
                      className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm"
                      disabled={!canEditStoreSettings || isSavingOperatingHours}
                    />
                    <span className="text-xs text-gray-400">to</span>
                    <input
                      aria-label={`${WEEKDAYS[hour.day_of_week]} closing time`}
                      type="time"
                      value={hour.closes_at || ""}
                      onChange={(event) => updateOperatingHour(hour.day_of_week, { closes_at: event.target.value })}
                      className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm"
                      disabled={!canEditStoreSettings || isSavingOperatingHours}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No customer availability is published for this day.</span>
                )}
              </div>
            ))}
            {!canEditStoreSettings && (
              <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">You can view operating hours, but only the owner or an authorized manager can save changes.</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setActiveModal(null)} disabled={isSavingOperatingHours}>Close</Button>
              {canEditStoreSettings && (
                <Button className="bg-printa-red hover:bg-printa-red/90" onClick={() => void saveOperatingHours()} disabled={isSavingOperatingHours}>
                  {isSavingOperatingHours ? "Saving…" : "Save hours"}
                </Button>
              )}
            </div>
          </div>
        )}
      </ResponsiveModal>

      {/* Security Settings Modal */}
      <ResponsiveModal
        open={activeModal === "security"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <Lock size={20} className="text-printa-red" />
            Security Settings
          </span>
        }
        description="OTP sign-in is active. Account security preferences are not yet configured."
      >
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor" className="text-sm font-medium">Two-Factor Authentication</Label>
              <p className="text-xs text-gray-500">Add an extra layer of security</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Not configured</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="session" className="text-sm font-medium">Auto Session Timeout</Label>
              <p className="text-xs text-gray-500">Log out after 30 minutes of inactivity</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Not configured</span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setActiveModal(null)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            className="bg-printa-red hover:bg-printa-red/90 rounded-xl"
            onClick={() => {
              toast.error("Security preferences are not configured for vendor accounts yet.");
              setActiveModal(null);
            }}
          >
            Save changes
          </Button>
        </div>
      </ResponsiveModal>

      {/* Notifications Settings Modal */}
      <ResponsiveModal
        open={activeModal === "notifications"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <Bell size={20} className="text-printa-red" />
            Notification Preferences
          </span>
        }
        description={activeStore ? `Notification preferences for ${activeStore.name}.` : "Select a store to manage notification preferences."}
      >
        {isLoadingNotificationPreferences ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading notification preferences…</div>
        ) : (
          <div className="space-y-4 py-2">
            {[
              { key: "email_notifications" as const, title: "Email notifications", body: "Send important store updates by email." },
              { key: "sms_notifications" as const, title: "SMS notifications", body: "Send urgent updates by text message when SMS is available." },
              { key: "order_updates" as const, title: "Order updates", body: "Notify this store about new orders and order status changes." },
              { key: "payment_updates" as const, title: "Payment updates", body: "Notify this store about paid, failed, or refunded payments." },
              { key: "stock_alerts" as const, title: "Stock alerts", body: "Notify this store when inventory needs attention." },
              { key: "promotions" as const, title: "Promotions", body: "Receive product updates, offers, and growth tips from Printa." },
            ].map((preference) => (
              <div key={preference.key} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="min-w-0">
                  <Label htmlFor={preference.key} className="text-sm font-semibold text-gray-900">{preference.title}</Label>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{preference.body}</p>
                </div>
                <Switch
                  id={preference.key}
                  checked={notificationPreferences[preference.key]}
                  onCheckedChange={(checked) => updateNotificationPreference(preference.key, checked)}
                  disabled={!canManageNotificationPreferences || isSavingNotificationPreferences}
                  className="data-[state=checked]:bg-printa-red"
                />
              </div>
            ))}
            {!canManageNotificationPreferences && (
              <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">You can view notification preferences, but only the owner or an authorized manager can save changes.</p>
            )}
            <p className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">These preferences are saved for this user and store. They will sync with the API when server-side preference storage is available.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setActiveModal(null)} className="rounded-xl" disabled={isSavingNotificationPreferences}>
                Close
              </Button>
              {canManageNotificationPreferences && (
                <Button
                  className="bg-printa-red hover:bg-printa-red/90 rounded-xl"
                  onClick={() => void saveNotificationPreferences()}
                  disabled={isSavingNotificationPreferences || !activeStore}
                >
                  {isSavingNotificationPreferences ? "Saving…" : "Save preferences"}
                </Button>
              )}
            </div>
          </div>
        )}
      </ResponsiveModal>

      {/* Privacy Settings Modal */}
      <ResponsiveModal
        open={activeModal === "privacy"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <Shield size={20} className="text-printa-red" />
            Privacy Settings
          </span>
        }
        description="Privacy preferences are not yet configured for vendor accounts."
      >
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics" className="text-sm font-medium">Usage Analytics</Label>
              <p className="text-xs text-gray-500">Help us improve by sharing usage data</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Not configured</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="partners" className="text-sm font-medium">Share with Partners</Label>
              <p className="text-xs text-gray-500">Allow data sharing with print partners</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Not configured</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="location-track" className="text-sm font-medium">Location Services</Label>
              <p className="text-xs text-gray-500">Allow location access for nearby printers</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Not configured</span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setActiveModal(null)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            className="bg-printa-red hover:bg-printa-red/90 rounded-xl"
            onClick={() => {
              toast.error("Privacy preferences are not configured for vendor accounts yet.");
              setActiveModal(null);
            }}
          >
            Save changes
          </Button>
        </div>
      </ResponsiveModal>

      {/* Currency Modal */}
      <ResponsiveModal
        open={activeModal === "currency"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <DollarSign size={20} className="text-printa-red" />
            Select Currency
          </span>
        }
        description="Choose the default currency shown when a record does not already include one."
      >
        <div className="space-y-2 py-4">
          <p className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">Existing orders, invoices, products, and payments keep their recorded currency. This setting controls the fallback display currency.</p>
          {availableCurrencies.map((currency) => (
            <button
              key={currency.code}
              type="button"
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                selectedCurrency.code === currency.code
                  ? "border-printa-red bg-printa-red/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => {
                setSelectedCurrency(currency);
                toast.success(`Default currency set to ${currency.code}.`);
                setActiveModal(null);
              }}
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{currency.code}</p>
                <p className="text-xs text-gray-500">{currency.name}</p>
              </div>
              {selectedCurrency.code === currency.code && (
                <Check size={18} className="text-printa-red" />
              )}
            </button>
          ))}
        </div>
      </ResponsiveModal>

      {/* Download App Modal */}
      <ResponsiveModal
        open={activeModal === "download"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        title={
          <span className="flex items-center gap-2">
            <Smartphone size={20} className="text-printa-red" />
            Download Printa app
          </span>
        }
        description="Get the mobile app when it is available."
      >
        <div className="space-y-3 py-4">
          <button
            type="button"
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            onClick={() => {
              window.open("https://play.google.com/store", "_blank");
              toast.success("Opening Google Play…");
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">GET IT ON</p>
              <p className="text-sm font-semibold text-gray-900">Google Play</p>
            </div>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            onClick={() => {
              window.open("https://apps.apple.com", "_blank");
              toast.success("Opening the App Store…");
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Download on the</p>
              <p className="text-sm font-semibold text-gray-900">App Store</p>
            </div>
          </button>
        </div>
      </ResponsiveModal>
    </DashboardLayout>
  );
};

export default SettingsPage;
