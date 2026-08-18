import { useMemo, useState, type ReactNode } from "react";
import { Bell, Lock, Shield, DollarSign, Smartphone, Check, Clock, LogOut, Store, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useCurrencyContext } from "@/context/currency-context";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { operatingHoursService } from "@/services/operating-hours.service";
import type { OperatingHourDto } from "@/services/contracts";

interface SettingCard {
  title: string;
  description: string;
  icon: ReactNode;
  variant?: "app";
  action?: () => void;
}

type ModalType = "security" | "notifications" | "privacy" | "currency" | "hours" | "download" | null;

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const createEmptyOperatingHours = (): OperatingHourDto[] =>
  WEEKDAYS.map((_, day) => ({ day_of_week: day, is_open: false }));

const SettingsPage = () => {
  const { selectedCurrency, availableCurrencies } = useCurrencyContext();
  const { logout } = useAuth();
  const { activeStore, setActiveStore } = useStore();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [operatingHours, setOperatingHours] = useState<OperatingHourDto[]>(createEmptyOperatingHours);
  const [isLoadingOperatingHours, setIsLoadingOperatingHours] = useState(false);
  const [isSavingOperatingHours, setIsSavingOperatingHours] = useState(false);

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

  const saveOperatingHours = async () => {
    if (!activeStore) return;
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
          <p className="dashboard-page-subtitle">Control your privacy, notifications, and security.</p>
        </div>

        <div className="space-y-4">
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

          <div
              
              className={`flex flex-col rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between bg-printa-red text-white border-0"
                 
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-2xl p-3 bg-white/30 text-printa-white"
                  }`}
                >
                  <Smartphone size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Download</p>
                  <p className="text-sm text-white">Download app on the playstore on the apple store</p>
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
          <div className="py-8 text-center text-sm text-gray-500">Loading operating hours...</div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-xs text-gray-500">Closed days are saved without opening or closing times. Overnight hours are not supported by this first contract.</p>
            {operatingHours.map((hour) => (
              <div key={hour.day_of_week} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-28 items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-800">{WEEKDAYS[hour.day_of_week]}</span>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${hour.is_open ? "bg-red-50 text-printa-red" : "bg-gray-100 text-gray-500"}`}
                    onClick={() => updateOperatingHour(hour.day_of_week, { is_open: !hour.is_open })}
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
                    />
                    <span className="text-xs text-gray-400">to</span>
                    <input
                      aria-label={`${WEEKDAYS[hour.day_of_week]} closing time`}
                      type="time"
                      value={hour.closes_at || ""}
                      onChange={(event) => updateOperatingHour(hour.day_of_week, { closes_at: event.target.value })}
                      className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No customer availability is published for this day.</span>
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setActiveModal(null)} disabled={isSavingOperatingHours}>Cancel</Button>
              <Button className="bg-printa-red hover:bg-printa-red/90" onClick={() => void saveOperatingHours()} disabled={isSavingOperatingHours}>
                {isSavingOperatingHours ? "Saving..." : "Save Hours"}
              </Button>
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
            Save Changes
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
        description="Notification preferences are not yet configured for vendor accounts."
      >
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notif" className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs text-gray-500">Receive updates via email</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Not configured</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notif" className="text-sm font-medium">SMS Notifications</Label>
              <p className="text-xs text-gray-500">Receive updates via text message</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Not configured</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order-updates" className="text-sm font-medium">Order Updates</Label>
              <p className="text-xs text-gray-500">Get notified about order status changes</p>
            </div>
            <span className="text-xs font-medium text-gray-400">Not configured</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="promotions" className="text-sm font-medium">Promotions & Offers</Label>
              <p className="text-xs text-gray-500">Receive special deals and discounts</p>
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
              toast.error("Notification preferences are not configured for vendor accounts yet.");
              setActiveModal(null);
            }}
          >
            Save Changes
          </Button>
        </div>
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
            Save Changes
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
        description="Currency preferences are not yet stored on vendor accounts."
      >
        <div className="space-y-2 py-4">
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
                toast.error("Currency preferences are not configured. Invoices and product prices use their recorded currency.");
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
            Download Printa App
          </span>
        }
        description="Get the full mobile experience"
      >
        <div className="space-y-3 py-4">
          <button
            type="button"
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            onClick={() => {
              window.open("https://play.google.com/store", "_blank");
              toast.success("Opening Google Play Store...");
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
              toast.success("Opening App Store...");
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
