import React, { useMemo, useState } from "react";
import { CheckCircle2, Circle, ShieldCheck, Store, User, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

type ServiceCategory = "Paper" | "Cards" | "Banners" | "Books" | "Apparel";

const allCategories: ServiceCategory[] = ["Paper", "Cards", "Banners", "Books", "Apparel"];

const VendorOnboarding: React.FC = () => {
  const [businessName, setBusinessName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [hours, setHours] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [branchInput, setBranchInput] = useState("");

  const [enabledCategories, setEnabledCategories] = useState<ServiceCategory[]>([]);
  const [priceRules, setPriceRules] = useState<string[]>([]);
  const [priceRuleInput, setPriceRuleInput] = useState("");

  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [pickupLocations, setPickupLocations] = useState<string[]>([]);
  const [pickupInput, setPickupInput] = useState("");

  const [employees, setEmployees] = useState<string[]>([]);
  const [employeeInput, setEmployeeInput] = useState("");
  const [hasPinAssigned, setHasPinAssigned] = useState(false);

  const addUnique = (value: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    const next = value.trim();
    if (!next) return;
    setList((prev) => (prev.includes(next) ? prev : [...prev, next]));
  };

  const readiness = useMemo(() => {
    const checks = [
      { label: "At least 1 location", done: pickupLocations.length > 0 || branches.length > 0 },
      { label: "At least 1 service category", done: enabledCategories.length > 0 },
      { label: "At least 1 price rule", done: priceRules.length > 0 },
      { label: "At least 1 employee PIN", done: hasPinAssigned && employees.length > 0 },
    ];
    return {
      checks,
      ready: checks.every((c) => c.done),
    };
  }, [branches.length, employees.length, enabledCategories.length, hasPinAssigned, pickupLocations.length, priceRules.length]);

  return (
    <DashboardLayout pageTitle="Vendor Onboarding">
      <div className="space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h1 className="text-xl font-semibold text-gray-900">Printing Vendor Onboarding</h1>
          <p className="text-sm text-gray-500 mt-1">Set up your store once, then your team can process orders faster.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-4">
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">1. Vendor Profile Setup</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business name" className="h-11 rounded-xl border border-gray-200 px-3 text-sm" />
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Contact phone" className="h-11 rounded-xl border border-gray-200 px-3 text-sm" />
                <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Operating hours" className="h-11 rounded-xl border border-gray-200 px-3 text-sm md:col-span-2" />
                <div className="md:col-span-2 flex gap-2">
                  <input value={branchInput} onChange={(e) => setBranchInput(e.target.value)} placeholder="Add branch" className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm" />
                  <button type="button" onClick={() => { addUnique(branchInput, setBranches); setBranchInput(""); }} className="h-11 px-4 rounded-xl bg-printa-red text-white text-sm font-medium">Add</button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">2. Services Setup</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {allCategories.map((cat) => {
                  const active = enabledCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEnabledCategories((prev) => active ? prev.filter((p) => p !== cat) : [...prev, cat])}
                      className={`px-3 py-2 rounded-xl text-sm border transition ${active ? "bg-printa-red text-white border-printa-red" : "bg-white text-gray-700 border-gray-200"}`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">3. Pricing Setup</h2>
              <div className="mt-3 flex gap-2">
                <input value={priceRuleInput} onChange={(e) => setPriceRuleInput(e.target.value)} placeholder="Example: A4 color > 100 qty = 10% discount" className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm" />
                <button type="button" onClick={() => { addUnique(priceRuleInput, setPriceRules); setPriceRuleInput(""); }} className="h-11 px-4 rounded-xl bg-printa-black text-white text-sm font-medium">Add</button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">4. Fulfillment Setup</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <input value={deliveryRadiusKm} onChange={(e) => setDeliveryRadiusKm(e.target.value)} placeholder="Delivery radius (km)" className="h-11 rounded-xl border border-gray-200 px-3 text-sm" />
                <input value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="Delivery fee" className="h-11 rounded-xl border border-gray-200 px-3 text-sm" />
                <div className="md:col-span-2 flex gap-2">
                  <input value={pickupInput} onChange={(e) => setPickupInput(e.target.value)} placeholder="Add pickup location" className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm" />
                  <button type="button" onClick={() => { addUnique(pickupInput, setPickupLocations); setPickupInput(""); }} className="h-11 px-4 rounded-xl bg-printa-red text-white text-sm font-medium">Add</button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">5. Team & Security</h2>
              <div className="mt-3 flex gap-2">
                <input value={employeeInput} onChange={(e) => setEmployeeInput(e.target.value)} placeholder="Employee name" className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm" />
                <button type="button" onClick={() => { addUnique(employeeInput, setEmployees); setEmployeeInput(""); }} className="h-11 px-4 rounded-xl bg-printa-black text-white text-sm font-medium">Add</button>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={hasPinAssigned} onChange={(e) => setHasPinAssigned(e.target.checked)} />
                At least one employee PIN has been assigned
              </label>
              <Link to="/dashboard/shift-management" className="mt-3 inline-flex text-sm text-printa-red hover:underline">
                Open Shift Management
              </Link>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">6. First Test Order Walkthrough</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/upload" className="px-3 py-2 rounded-xl bg-gray-100 text-sm text-gray-800">Upload</Link>
                <Link to="/customize" className="px-3 py-2 rounded-xl bg-gray-100 text-sm text-gray-800">Customize</Link>
                <Link to="/checkout" className="px-3 py-2 rounded-xl bg-gray-100 text-sm text-gray-800">Checkout</Link>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">7. Go-Live Checklist</h2>
              <div className="mt-3 space-y-2">
                {readiness.checks.map((c) => (
                  <div key={c.label} className="flex items-center gap-2 text-sm">
                    {c.done ? <CheckCircle2 size={16} className="text-green-600" /> : <Circle size={16} className="text-gray-400" />}
                    <span className={c.done ? "text-gray-900" : "text-gray-500"}>{c.label}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-4 rounded-xl px-3 py-2 text-sm font-medium ${readiness.ready ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                {readiness.ready ? "Ready to go live" : "Complete remaining checklist items"}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2"><Store size={16} className="text-printa-red" /> Vendor setup</div>
              <div className="flex items-center gap-2"><Wrench size={16} className="text-printa-red" /> Services & pricing</div>
              <div className="flex items-center gap-2"><User size={16} className="text-printa-red" /> Team & PIN</div>
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-printa-red" /> Security validated</div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorOnboarding;
