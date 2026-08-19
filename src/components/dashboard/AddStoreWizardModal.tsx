import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Clock, MapPin, Search, Store } from "lucide-react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { toast } from "sonner";
import { getApiKey } from "../../../config/api-keys";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { inventoryService } from "@/services/inventory.service";
import { operatingHoursService } from "@/services/operating-hours.service";
import type { StoreDto } from "@/services/contracts";
import { clearOfflineDraft, loadOfflineDraft, offlineKeys, saveOfflineDraft } from "@/lib/offline-store";

const MAP_LIBRARIES: ("places")[] = ["places"];
const LUSAKA_CENTER = { lat: -15.3875, lng: 28.3228 };

const DAYS = [
  { key: "Mon", label: "Monday", dayOfWeek: 0 },
  { key: "Tue", label: "Tuesday", dayOfWeek: 1 },
  { key: "Wed", label: "Wednesday", dayOfWeek: 2 },
  { key: "Thu", label: "Thursday", dayOfWeek: 3 },
  { key: "Fri", label: "Friday", dayOfWeek: 4 },
  { key: "Sat", label: "Saturday", dayOfWeek: 5 },
  { key: "Sun", label: "Sunday", dayOfWeek: 6 },
] as const;

type DayKey = typeof DAYS[number]["key"];
type DayHours = { enabled: boolean; open: string; close: string };
type Hours = Record<DayKey, DayHours>;

type StoreDraft = {
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
};

const defaultDraft = (): StoreDraft => ({
  name: "",
  address: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  latitude: null,
  longitude: null,
});

type AddStoreSavedDraft = {
  step: number;
  draft: StoreDraft;
  hours: Hours;
  addressQuery: string;
};

const defaultHours = (): Hours => ({
  Mon: { enabled: true, open: "08:00", close: "17:00" },
  Tue: { enabled: true, open: "08:00", close: "17:00" },
  Wed: { enabled: true, open: "08:00", close: "17:00" },
  Thu: { enabled: true, open: "08:00", close: "17:00" },
  Fri: { enabled: true, open: "08:00", close: "17:00" },
  Sat: { enabled: false, open: "09:00", close: "13:00" },
  Sun: { enabled: false, open: "09:00", close: "13:00" },
});

const pinIcon = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="54" viewBox="0 0 50 64"><path d="M25 2C16.61 2 10 8.61 10 17.2c0 9.27 9.74 20.04 13.27 24.29a2 2 0 0 0 3.46 0C30.26 37.24 40 26.47 40 17.2 40 8.61 33.39 2 25 2z" fill="#e71a1a" stroke="#fff" stroke-width="2.5"/><circle cx="25" cy="17.2" r="7" fill="rgba(255,255,255,0.25)" stroke="#fff" stroke-width="2"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getLocationParts = (components?: google.maps.GeocoderAddressComponent[]) => {
  const find = (...types: string[]) => components?.find((component) =>
    types.some((type) => component.types.includes(type)),
  )?.long_name ?? "";

  return {
    city: find("locality", "postal_town", "administrative_area_level_2", "administrative_area_level_1"),
    country: find("country"),
  };
};

interface AddStoreWizardModalProps {
  open: boolean;
  vendorId: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (store: StoreDto) => Promise<void> | void;
}

/**
 * Authenticated additional-store flow. It intentionally uses the same location
 * and operating-hours interaction patterns as vendor onboarding while creating
 * only a new store for an already established vendor profile.
 */
export function AddStoreWizardModal({ open, vendorId, onOpenChange, onCreated }: AddStoreWizardModalProps) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<StoreDraft>(defaultDraft);
  const [hours, setHours] = useState<Hours>(defaultHours);
  const [addressQuery, setAddressQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesRef = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: getApiKey("GOOGLE_MAPS"),
    libraries: MAP_LIBRARIES,
  });

  const reset = useCallback(() => {
    setStep(1);
    setDraft(defaultDraft());
    setHours(defaultHours());
    setAddressQuery("");
    setPredictions([]);
    setIsSaving(false);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsDraftReady(false);
      return;
    }
    setIsDraftReady(false);
    let cancelled = false;
    void loadOfflineDraft<AddStoreSavedDraft>(offlineKeys.addStoreDraft(vendorId))
      .then((saved) => {
        if (cancelled) return;
        if (!saved?.value) {
          reset();
          setIsDraftReady(true);
          return;
        }
        setStep(saved.value.step);
        setDraft(saved.value.draft);
        setHours(saved.value.hours);
        setAddressQuery(saved.value.addressQuery);
        setPredictions([]);
        setIsSaving(false);
        setIsDraftReady(true);
      })
      .catch(() => {
        reset();
        setIsDraftReady(true);
      });
    return () => { cancelled = true; };
  }, [open, reset, vendorId]);

  useEffect(() => {
    if (!open || !isDraftReady || isSaving) return;
    void saveOfflineDraft<AddStoreSavedDraft>(offlineKeys.addStoreDraft(vendorId), { step, draft, hours, addressQuery }).catch(() => undefined);
  }, [open, isDraftReady, isSaving, step, draft, hours, addressQuery, vendorId]);

  useEffect(() => {
    if (isLoaded && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  const updateDraft = (patch: Partial<StoreDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const applyGeocodedLocation = useCallback((result?: google.maps.GeocoderResult | google.maps.places.PlaceResult) => {
    if (!result?.formatted_address) return;
    const location = getLocationParts(result.address_components);
    updateDraft({
      address: result.formatted_address,
      city: location.city || draft.city,
      country: location.country || draft.country,
    });
    setAddressQuery(result.formatted_address);
  }, [draft.city, draft.country]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    const latitude = event.latLng?.lat();
    const longitude = event.latLng?.lng();
    if (latitude === undefined || longitude === undefined) return;
    updateDraft({ latitude, longitude });
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === "OK" && results?.[0]) applyGeocodedLocation(results[0]);
    });
  }, [applyGeocodedLocation]);

  const handleAddressSearch = (query: string) => {
    setAddressQuery(query);
    if (!autocompleteRef.current || query.trim().length < 3) {
      setPredictions([]);
      return;
    }
    autocompleteRef.current.getPlacePredictions({ input: query, componentRestrictions: { country: "zm" } }, (results) => {
      setPredictions(results || []);
    });
  };

  const selectPrediction = (placeID: string, description: string) => {
    setPredictions([]);
    setAddressQuery(description);
    updateDraft({ address: description });
    if (!placesRef.current && mapRef.current) {
      placesRef.current = new google.maps.places.PlacesService(mapRef.current);
    }
    placesRef.current?.getDetails({ placeId: placeID, fields: ["geometry", "formatted_address", "address_components"] }, (place) => {
      applyGeocodedLocation(place);
      const location = place?.geometry?.location;
      if (!location) return;
      const latitude = location.lat();
      const longitude = location.lng();
      updateDraft({ latitude, longitude });
      mapRef.current?.panTo({ lat: latitude, lng: longitude });
      mapRef.current?.setZoom(17);
    });
  };

  const toggleDay = (day: DayKey) => {
    setHours((current) => ({ ...current, [day]: { ...current[day], enabled: !current[day].enabled } }));
  };

  const setDayTime = (day: DayKey, field: "open" | "close", value: string) => {
    setHours((current) => ({ ...current, [day]: { ...current[day], [field]: value } }));
  };

  const validLocation = draft.name.trim().length >= 2 && draft.address.trim().length >= 2 && draft.city.trim().length >= 2 && draft.country.trim().length >= 2;
  const hasHours = DAYS.some(({ key }) => hours[key].enabled);
  const mapCenter = draft.latitude !== null && draft.longitude !== null ? { lat: draft.latitude, lng: draft.longitude } : LUSAKA_CENTER;
  const reviewLocation = draft.address.includes(draft.city) && draft.address.includes(draft.country)
    ? draft.address
    : [draft.address, draft.city, draft.country].filter(Boolean).join(", ");

  const createStore = async () => {
    if (!validLocation) {
      toast.error("Store name, address, city, and country are required.");
      setStep(1);
      return;
    }
    if (!hasHours) {
      toast.error("Choose at least one day when this store is open.");
      setStep(2);
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast.error("You are offline. This store setup has been saved on this device and can be submitted when you reconnect.");
      return;
    }

    setIsSaving(true);
    try {
      const store = await inventoryService.createStore({
        vendor_id: vendorId,
        name: draft.name.trim(),
        address: draft.address.trim(),
        city: draft.city.trim(),
        country: draft.country.trim(),
        phone: draft.phone.trim() || undefined,
        email: draft.email.trim() || undefined,
        ...(draft.latitude !== null && draft.longitude !== null ? { latitude: draft.latitude, longitude: draft.longitude } : {}),
      });

      try {
        await operatingHoursService.replace(store.id, {
          hours: DAYS.map(({ key, dayOfWeek }) => ({
            day_of_week: dayOfWeek,
            is_open: hours[key].enabled,
            opens_at: hours[key].enabled ? hours[key].open : "",
            closes_at: hours[key].enabled ? hours[key].close : "",
          })),
        });
      } catch (error) {
        toast.error(error instanceof Error ? `Store created, but its operating hours could not be saved: ${error.message}` : "Store created, but its operating hours could not be saved.");
      }

      await onCreated(store);
      await clearOfflineDraft(offlineKeys.addStoreDraft(vendorId)).catch(() => undefined);
      toast.success(`${store.name} has been added.`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create the store.");
    } finally {
      setIsSaving(false);
    }
  };

  const close = (nextOpen: boolean) => {
    if (!nextOpen && !isSaving) onOpenChange(false);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={close}
      title="Add another store"
      description="Create a new physical storefront for your existing Printa business."
      className="max-h-[92vh] overflow-hidden p-0 sm:max-w-4xl"
    >
      <div className="flex min-h-[590px] max-h-[calc(92vh-6rem)] flex-col bg-gray-50">
        <div className="border-b border-gray-100 bg-white px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-printa-red"><Store size={18} /></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">New store setup</p>
                <p className="text-xs text-gray-400">Step {step} of 3</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              {["Location", "Hours", "Review"].map((label, index) => {
                const number = index + 1;
                const active = step === number;
                const complete = step > number;
                return <div key={label} className="flex items-center gap-2 text-xs font-medium text-gray-500"><span className={`flex h-6 w-6 items-center justify-center rounded-full ${active || complete ? "bg-printa-red text-white" : "bg-gray-100 text-gray-400"}`}>{complete ? <Check size={13} /> : number}</span><span className={active ? "text-gray-900" : ""}>{label}</span></div>;
              })}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-printa-red"><MapPin size={16} /></div><h2 className="text-xl font-bold text-gray-900">Where is this store?</h2></div>
                <p className="ml-11 mt-1 text-sm text-gray-400">Search for the address or tap the map to drop a pin.</p>
              </div>
              <input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} placeholder="Store name (e.g. Main Branch)" className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base focus:border-printa-red focus:outline-none focus:ring-2 focus:ring-printa-red/40" />
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={addressQuery} onChange={(event) => handleAddressSearch(event.target.value)} placeholder="Search address…" className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-base focus:border-printa-red focus:outline-none focus:ring-2 focus:ring-printa-red/40" />
                {predictions.length > 0 && <div className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">{predictions.map((prediction) => <button key={prediction.place_id} type="button" onClick={() => selectPrediction(prediction.place_id, prediction.description)} className="block w-full border-b border-gray-50 px-4 py-3 text-left last:border-0 hover:bg-gray-50"><p className="truncate text-sm font-medium text-gray-900">{prediction.structured_formatting.main_text}</p><p className="truncate text-xs text-gray-400">{prediction.structured_formatting.secondary_text}</p></button>)}</div>}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><input value={draft.city} onChange={(event) => updateDraft({ city: event.target.value })} placeholder="City or town" className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-base focus:border-printa-red focus:outline-none focus:ring-2 focus:ring-printa-red/40" /><input value={draft.country} onChange={(event) => updateDraft({ country: event.target.value })} placeholder="Country" className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-base focus:border-printa-red focus:outline-none focus:ring-2 focus:ring-printa-red/40" /></div>
              <div className="relative h-[250px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 sm:h-[310px]">
                {isLoaded ? <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={mapCenter} zoom={draft.latitude !== null ? 17 : 13} onClick={handleMapClick} onLoad={(map) => { mapRef.current = map; placesRef.current = new google.maps.places.PlacesService(map); }} options={{ disableDefaultUI: true, zoomControl: true, streetViewControl: false, clickableIcons: false }}>{draft.latitude !== null && draft.longitude !== null && <Marker position={{ lat: draft.latitude, lng: draft.longitude }} draggable onDragEnd={handleMapClick} icon={pinIcon()} />}</GoogleMap> : <div className="flex h-full items-center justify-center text-sm text-gray-400">Loading map…</div>}
                {draft.address && <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-xl border border-gray-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur"><MapPin size={14} className="shrink-0 text-printa-red" /><p className="truncate text-xs text-gray-700">{draft.address}</p></div>}
              </div>
            </div>
          )}

          {step === 2 && <div className="space-y-4"><div><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-printa-red"><Clock size={16} /></div><h2 className="text-xl font-bold text-gray-900">When is this store open?</h2></div><p className="ml-11 mt-1 text-sm text-gray-400">Set the days and hours customers can expect this branch to operate.</p></div><div className="space-y-2">{DAYS.map(({ key, label }) => { const day = hours[key]; return <div key={key} className={`rounded-xl border ${day.enabled ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"}`}><div className="flex items-center gap-3 px-4 py-3"><button type="button" aria-label={`Toggle ${label}`} onClick={() => toggleDay(key)} className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${day.enabled ? "bg-printa-red" : "bg-gray-200"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${day.enabled ? "translate-x-[18px]" : "translate-x-0.5"}`} /></button><div className="min-w-0 flex-1"><p className={`text-sm font-semibold ${day.enabled ? "text-gray-900" : "text-gray-400"}`}>{label}</p><p className="text-xs text-gray-400">{day.enabled ? "Open" : "Closed"}</p></div>{day.enabled && <div className="flex shrink-0 items-center gap-2"><input type="time" value={day.open} onChange={(event) => setDayTime(key, "open", event.target.value)} className="h-9 w-[100px] rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm" /><span className="text-xs text-gray-300">to</span><input type="time" value={day.close} onChange={(event) => setDayTime(key, "close", event.target.value)} className="h-9 w-[100px] rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm" /></div>}</div></div>; })}</div></div>}

          {step === 3 && <div className="space-y-5"><div><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-printa-red"><Check size={16} /></div><h2 className="text-xl font-bold text-gray-900">Review your new store</h2></div><p className="ml-11 mt-1 text-sm text-gray-400">Add optional contact details, then create this additional branch.</p></div><div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><p className="font-semibold text-gray-900">{draft.name || "New store"}</p><div className="mt-2 flex items-start gap-2 text-sm text-gray-500"><MapPin size={15} className="mt-0.5 shrink-0 text-printa-red" /><span>{reviewLocation || "Location details pending"}</span></div><p className="mt-3 text-xs text-gray-400">Open {DAYS.filter(({ key }) => hours[key].enabled).length} day{DAYS.filter(({ key }) => hours[key].enabled).length === 1 ? "" : "s"} a week</p></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><input value={draft.phone} onChange={(event) => updateDraft({ phone: event.target.value })} placeholder="Store phone (optional)" className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-base focus:border-printa-red focus:outline-none focus:ring-2 focus:ring-printa-red/40" /><input type="email" value={draft.email} onChange={(event) => updateDraft({ email: event.target.value })} placeholder="Store email (optional)" className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-base focus:border-printa-red focus:outline-none focus:ring-2 focus:ring-printa-red/40" /></div><div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">This creates an additional store under your existing Printa business. Your business profile and current stores will remain unchanged.</div></div>}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:px-7">
          <Button type="button" variant="outline" onClick={() => step === 1 ? close(false) : setStep((current) => current - 1)} disabled={isSaving} className="rounded-xl">{step === 1 ? "Cancel" : <><ArrowLeft size={16} className="mr-1" />Back</>}</Button>
          {step < 3 ? <Button type="button" onClick={() => { if (step === 1 && !validLocation) { toast.error("Store name, address, city, and country are required."); return; } if (step === 2 && !hasHours) { toast.error("Choose at least one open day."); return; } setStep((current) => current + 1); }} className="rounded-xl bg-printa-red text-white hover:bg-red-700">Continue</Button> : <Button type="button" onClick={() => void createStore()} disabled={isSaving} className="rounded-xl bg-printa-red text-white hover:bg-red-700">{isSaving ? "Creating store..." : "Create Store"}</Button>}
        </div>
      </div>
    </ResponsiveModal>
  );
}
