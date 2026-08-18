import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Building2,
  Smartphone,
  MapPin,
  Clock,
  Printer,
  Wallet,
  Sun,
  Moon,
  Search,
  Plus,
  X,
} from "lucide-react";

import { toast } from "sonner";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { getApiKey } from "../../../config/api-keys";
import {
  getOnboardingState,
  saveOnboardingState,
  type VendorOnboardingState,
  type DayHours,
  type WeekSchedule,
} from "@/lib/vendorOnboardingState";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TOTAL_STEPS = 5;
const LUSAKA_CENTER = { lat: -15.3875, lng: 28.3228 };
const MAP_LIBRARIES: ("places")[] = ["places"];

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const SUGGESTIONS = [
  "Documents & Copies",
  "Business Cards",
  "Banners & Posters",
  "Books & Binding",
  "T-Shirts & Merch",
  "Stickers & Labels",
  "Flyers & Brochures",
  "Certificates",
  "Invitations",
  "Envelopes & Letterheads",
  "Canvas Prints",
  "Mugs & Gifts",
  "ID Cards & Badges",
  "Calendars",
  "Packaging & Boxes",
  "Vehicle Wraps",
  "Signage",
  "Stamps & Seals",
];

const MAP_STYLES = [
  { featureType: "all", elementType: "geometry", stylers: [{ color: "#f6f4f0" }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#fdf6f0" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#f4e9e4" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f0dede" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#333" }] },
];

const createPinSvg = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="64" viewBox="0 0 50 64">
    <path d="M25 2C16.61 2 10 8.61 10 17.2c0 9.27 9.74 20.04 13.27 24.29a2 2 0 0 0 3.46 0C30.26 37.24 40 26.47 40 17.2 40 8.61 33.39 2 25 2z" fill="#e71a1a" stroke="#fff" stroke-width="2.5"/>
    <circle cx="25" cy="17.2" r="7" fill="rgba(255,255,255,0.25)" stroke="#fff" stroke-width="2"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

/* ──────────────────────────────────────────────────────────────────── */
/*  Helper: format time to 12h                                         */
/* ──────────────────────────────────────────────────────────────────── */
const to12h = (time24: string) => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

/* ──────────────────────────────────────────────────────────────────── */
/*  Component                                                          */
/* ──────────────────────────────────────────────────────────────────── */
const VendorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<VendorOnboardingState>(getOnboardingState);
  const [dir, setDir] = useState(1);
  const [addressQuery, setAddressQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesRef = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const step = data.step;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: getApiKey("GOOGLE_MAPS"),
    libraries: MAP_LIBRARIES,
  });

  useEffect(() => {
    saveOnboardingState(data);
  }, [data]);

  useEffect(() => {
    if (isLoaded && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  const set = useCallback((patch: Partial<VendorOnboardingState>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const canContinue = (): boolean => {
    switch (step) {
      case 0: return true;
      case 1: return data.businessName.trim().length >= 2;
      case 2: return data.storeName.trim().length >= 2 && data.storeAddress.trim().length >= 2;
      case 3: return Object.values(data.storeHours).some((h) => h.enabled);
      case 4: return data.products.length > 0;
      case 5:
        return data.paymentMethod !== "" &&
          data.paymentDetail.trim().length >= 4 &&
          data.dataConsentAccepted &&
          data.platformTermsAccepted;
      default: return false;
    }
  };

  const next = () => {
    if (!canContinue()) return;
    if (step >= TOTAL_STEPS) {
      toast.info("Continue to account creation. This onboarding draft has not been saved to a Printa vendor profile.");
      navigate("/signup");
      return;
    }
    setDir(1);
    set({ step: step + 1 });
  };

  const back = () => {
    if (step > 0) {
      setDir(-1);
      set({ step: step - 1 });
    }
  };

  const toggleDay = (day: string) => {
    const current = data.storeHours[day];
    set({
      storeHours: {
        ...data.storeHours,
        [day]: { ...current, enabled: !current.enabled },
      },
    });
  };

  const setDayTime = (day: string, field: "open" | "close", value: string) => {
    const current = data.storeHours[day];
    set({
      storeHours: {
        ...data.storeHours,
        [day]: { ...current, [field]: value },
      },
    });
  };

  const applyToAllDays = (source: DayHours) => {
    const updated: WeekSchedule = { ...data.storeHours };
    for (const day of ALL_DAYS) {
      if (updated[day].enabled) {
        updated[day] = { ...updated[day], open: source.open, close: source.close };
      }
    }
    set({ storeHours: updated });
  };

  const addProduct = (label: string) => {
    const normalized = label.trim();
    if (!normalized) return;
    if (data.products.some((p) => p.toLowerCase() === normalized.toLowerCase())) return;
    set({ products: [...data.products, normalized] });
    setProductSearch("");
  };

  const removeProduct = (label: string) => {
    set({ products: data.products.filter((p) => p !== label) });
  };

  /* ── Map helpers ── */
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat != null && lng != null) {
        set({ storeLat: lat, storeLng: lng });
        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            set({ storeAddress: results[0].formatted_address });
            setAddressQuery(results[0].formatted_address);
          }
        });
      }
    },
    [set],
  );

  const handleMarkerDrag = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat != null && lng != null) {
        set({ storeLat: lat, storeLng: lng });
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            set({ storeAddress: results[0].formatted_address });
            setAddressQuery(results[0].formatted_address);
          }
        });
      }
    },
    [set],
  );

  const handleAddressSearch = useCallback(
    (query: string) => {
      setAddressQuery(query);
      if (!autocompleteRef.current || query.length < 3) {
        setPredictions([]);
        return;
      }
      autocompleteRef.current.getPlacePredictions(
        { input: query, componentRestrictions: { country: "zm" } },
        (results) => {
          setPredictions(results || []);
        },
      );
    },
    [],
  );

  const selectPrediction = useCallback(
    (placeId: string, description: string) => {
      setPredictions([]);
      setAddressQuery(description);
      set({ storeAddress: description });

      if (!placesRef.current && mapRef.current) {
        placesRef.current = new google.maps.places.PlacesService(mapRef.current);
      }
      placesRef.current?.getDetails({ placeId, fields: ["geometry"] }, (place) => {
        const loc = place?.geometry?.location;
        if (loc) {
          set({ storeLat: loc.lat(), storeLng: loc.lng() });
          mapRef.current?.panTo({ lat: loc.lat(), lng: loc.lng() });
          mapRef.current?.setZoom(17);
        }
      });
    },
    [set],
  );

  const mapCenter = data.storeLat && data.storeLng
    ? { lat: data.storeLat, lng: data.storeLng }
    : LUSAKA_CENTER;

  /* ── Step meta for the subtle step indicator on desktop ── */
  const stepMeta = [
    { icon: <Printer size={16} />, label: "Welcome" },
    { icon: <Building2 size={16} />, label: "Business" },
    { icon: <MapPin size={16} />, label: "Location" },
    { icon: <Clock size={16} />, label: "Hours" },
    { icon: <Printer size={16} />, label: "Products" },
    { icon: <Wallet size={16} />, label: "Payment" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* ═══════ Desktop left brand panel ═══════ */}
      <div className="hidden lg:flex lg:w-[380px] xl:w-[440px] bg-printa-red flex-col justify-between p-10 text-white shrink-0">
        <div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-8">
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight">
            Set up your printing business on Printa
          </h2>
          <p className="mt-3 text-white/70 text-sm leading-relaxed">
            Join hundreds of print vendors across Zambia. Get discovered by customers, manage orders, and grow your business.
          </p>
        </div>

        {/* Desktop step list */}
        <div className="space-y-3 mt-8">
          {stepMeta.slice(1).map((s, i) => {
            const stepNum = i + 1;
            const done = step > stepNum;
            const active = step === stepNum;
            return (
              <div
                key={s.label}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all ${
                  active
                    ? "bg-white/20"
                    : done
                      ? "bg-white/10"
                      : "opacity-40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    done
                      ? "bg-white text-printa-red"
                      : active
                        ? "bg-white text-printa-red"
                        : "border border-white/40 text-white"
                  }`}
                >
                  {done ? <Check size={14} /> : stepNum}
                </div>
                <span className={`text-sm font-medium ${active || done ? "text-white" : "text-white"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-white/40 mt-auto pt-6">
          Printa &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* ═══════ Main content area ═══════ */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Top bar (mobile progress + back) */}
        <div className="flex items-center px-4 pt-4 pb-2 lg:px-8 lg:pt-6">
          {step > 0 ? (
            <Button
              type="button"
              onClick={back}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
            </Button>
          ) : (
            <div className="w-9" />
          )}
          <div className="flex-1 mx-3 lg:max-w-md">
            {step > 0 && (
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-printa-red rounded-full"
                  initial={false}
                  animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400 w-9 text-right">
            {step > 0 && `${step}/${TOTAL_STEPS}`}
          </span>
        </div>

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col px-5 pt-4 pb-6 lg:px-8 lg:pt-6 lg:pb-8 max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              {/* ─────────── Step 0: Welcome ─────────── */}
              {step === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                  {/* Animated logo */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="mb-6"
                  >
                    <Link
                      to="/"
                      className="inline-flex items-center justify-center"
                    >
                      <img
                        src="/printa-logo-red.webp"
                        alt="Printa"
                        className="h-11 w-auto object-contain drop-shadow-[0_8px_20px_rgba(239,68,68,0.25)] transition-opacity duration-200 ease-in-out sm:h-14 lg:h-20"
                      />
                    </Link>
                  </motion.div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                    Increase your Sales Revenue with{" "}
                    <span className="text-printa-red">Printa</span>
                  </h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-gray-500 mt-3 max-w-sm lg:text-lg"
                  >
                    Let's set up your printing business in just a few steps.
                  </motion.p>

                  {/* Feature highlights */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 grid grid-cols-3 gap-4 max-w-sm w-full"
                  >
                    {[
                      { icon: <MapPin size={18} />, text: "Add your store" },
                      { icon: <Printer size={18} />, text: "List services" },
                      { icon: <Wallet size={18} />, text: "Get paid" },
                    ].map((f) => (
                      <div key={f.text} className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-printa-red flex items-center justify-center">
                          {f.icon}
                        </div>
                        <span className="text-xs text-gray-500 text-center">{f.text}</span>
                      </div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* ─────────── Step 1: Business Name ─────────── */}
              {step === 1 && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-printa-red flex items-center justify-center">
                      <Building2 size={16} />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                      What's your business called?
                    </h1>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 ml-11">
                    This is how customers will find you on Printa.
                  </p>

                  <input
                    autoFocus
                    value={data.businessName}
                    onChange={(e) => set({ businessName: e.target.value })}
                    placeholder="e.g. FastPrint Lusaka"
                    className="mt-8 h-14 rounded-xl border border-gray-200 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-printa-red/40 focus:border-printa-red bg-white"
                    onKeyDown={(e) => e.key === "Enter" && next()}
                  />

                  {/* Live preview */}
                  {data.businessName.trim().length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
                    >
                      <p className="text-xs text-gray-400 mb-2">Preview — how customers see you</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-printa-red text-white flex items-center justify-center font-bold text-sm">
                          {data.businessName.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{data.businessName.trim()}</p>
                          <p className="text-xs text-gray-400">Printing Services</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ─────────── Step 2: Store Location (Map) ─────────── */}
              {step === 2 && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-printa-red flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Where's your store?
                    </h1>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 ml-11">
                    Search for your address or tap the map to drop a pin.
                  </p>

                  {/* Store name */}
                  <input
                    autoFocus
                    value={data.storeName}
                    onChange={(e) => set({ storeName: e.target.value })}
                    placeholder="Store name (e.g. Main Branch)"
                    className="mt-5 h-12 rounded-xl border border-gray-200 px-4 text-base focus:outline-none focus:ring-2 focus:ring-printa-red/40 focus:border-printa-red bg-white"
                  />

                  {/* Address search */}
                  <div className="relative mt-3">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    <input
                      value={addressQuery}
                      onChange={(e) => handleAddressSearch(e.target.value)}
                      placeholder="Search address…"
                      className="w-full h-12 rounded-xl border border-gray-200 pl-10 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-printa-red/40 focus:border-printa-red bg-white"
                    />
                    {predictions.length > 0 && (
                      <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                        {predictions.map((p) => (
                          <button
                            key={p.place_id}
                            type="button"
                            onClick={() => selectPrediction(p.place_id, p.description)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                          >
                            <p className="text-sm text-gray-900 truncate">{p.structured_formatting.main_text}</p>
                            <p className="text-xs text-gray-400 truncate">{p.structured_formatting.secondary_text}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Map */}
                  <div className="mt-4 flex-1 min-h-[240px] lg:min-h-[320px] rounded-xl overflow-hidden border border-gray-200 relative">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={mapCenter}
                        zoom={data.storeLat ? 17 : 13}
                        options={{
                          disableDefaultUI: true,
                          zoomControl: true,
                          streetViewControl: false,
                          styles: MAP_STYLES,
                          clickableIcons: false,
                        }}
                        onClick={handleMapClick}
                        onLoad={(map) => {
                          mapRef.current = map;
                          if (!placesRef.current) {
                            placesRef.current = new google.maps.places.PlacesService(map);
                          }
                        }}
                      >
                        {data.storeLat && data.storeLng && (
                          <Marker
                            position={{ lat: data.storeLat, lng: data.storeLng }}
                            draggable
                            onDragEnd={handleMarkerDrag}
                            icon={createPinSvg()}
                            animation={google.maps.Animation.DROP}
                          />
                        )}
                      </GoogleMap>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                        Loading map…
                      </div>
                    )}

                    {/* Floating address badge */}
                    {data.storeAddress && (
                      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-printa-red shrink-0" />
                          <p className="text-xs text-gray-700 truncate">{data.storeAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─────────── Step 3: Store Hours ─────────── */}
              {step === 3 && (() => {
                const enabledCount = ALL_DAYS.filter((d) => data.storeHours[d]?.enabled).length;
                const firstEnabled = ALL_DAYS.find((d) => data.storeHours[d]?.enabled);

                return (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-printa-red flex items-center justify-center">
                        <Clock size={16} />
                      </div>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        When are you open?
                      </h1>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 ml-11">
                      Toggle days on/off and set hours for each day.
                    </p>

                    {/* Day schedule list */}
                    <div className="mt-5 space-y-2 overflow-y-auto flex-1">
                      {ALL_DAYS.map((day) => {
                        const hours = data.storeHours[day];
                        if (!hours) return null;
                        const active = hours.enabled;

                        return (
                          <div
                            key={day}
                            className={`rounded-xl border transition-all ${
                              active
                                ? "border-gray-200 bg-white shadow-sm"
                                : "border-gray-100 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center px-4 py-3 gap-3">
                              {/* Toggle */}
                              <button
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                                  active ? "bg-printa-red" : "bg-gray-200"
                                }`}
                              >
                                <motion.div
                                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                                  animate={{ left: active ? 18 : 2 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </button>

                              {/* Day name */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${active ? "text-gray-900" : "text-gray-400"}`}>
                                  {DAY_LABELS[day]}
                                </p>
                                {!active && (
                                  <p className="text-xs text-gray-300">Closed</p>
                                )}
                              </div>

                              {/* Time pickers (only when enabled) */}
                              {active && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <input
                                    type="time"
                                    value={hours.open}
                                    onChange={(e) => setDayTime(day, "open", e.target.value)}
                                    className="h-9 w-[110px] rounded-xl border border-gray-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-printa-red/40 focus:border-printa-red bg-gray-50"
                                  />
                                  <span className="text-gray-300 text-xs">to</span>
                                  <input
                                    type="time"
                                    value={hours.close}
                                    onChange={(e) => setDayTime(day, "close", e.target.value)}
                                    className="h-9 w-[110px] rounded-xl border border-gray-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-printa-red/40 focus:border-printa-red bg-gray-50"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Apply to all + summary */}
                    <div className="mt-4 flex items-center justify-between">
                      {firstEnabled && enabledCount > 1 && (
                        <button
                          type="button"
                          onClick={() => applyToAllDays(data.storeHours[firstEnabled])}
                          className="text-xs text-printa-red font-medium hover:underline"
                        >
                          Apply {DAY_LABELS[firstEnabled]}'s hours to all open days
                        </button>
                      )}
                      {enabledCount > 0 && (
                        <p className="text-xs text-gray-400 ml-auto">
                          Open {enabledCount} day{enabledCount > 1 ? "s" : ""} a week
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ─────────── Step 4: Products ─────────── */}
              {step === 4 && (() => {
                const query = productSearch.toLowerCase().trim();
                const filtered = SUGGESTIONS.filter(
                  (s) =>
                    s.toLowerCase().includes(query) &&
                    !data.products.some((p) => p.toLowerCase() === s.toLowerCase()),
                );
                const showCustomAdd =
                  query.length >= 2 &&
                  !SUGGESTIONS.some((s) => s.toLowerCase() === query) &&
                  !data.products.some((p) => p.toLowerCase() === query);

                return (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-printa-red flex items-center justify-center">
                        <Printer size={16} />
                      </div>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        What do you print?
                      </h1>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 ml-11">
                      Search and add your services. You can also type a custom one.
                    </p>

                    {/* Search input */}
                    <div className="relative mt-5">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <input
                        autoFocus
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && showCustomAdd) {
                            addProduct(productSearch.trim());
                          }
                        }}
                        placeholder="Search or type a service…"
                        className="w-full h-12 rounded-xl border border-gray-200 pl-10 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-printa-red/40 focus:border-printa-red bg-white"
                      />
                    </div>

                    {/* Added products as chips */}
                    {data.products.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {data.products.map((p) => (
                          <motion.div
                            key={p}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex items-center gap-1.5 bg-red-50 border border-printa-red/20 text-printa-red rounded-full pl-3 pr-1.5 py-1.5"
                          >
                            <span className="text-sm font-medium">{p}</span>
                            <button
                              type="button"
                              onClick={() => removeProduct(p)}
                              className="w-5 h-5 rounded-full bg-printa-red/10 hover:bg-printa-red/20 flex items-center justify-center transition"
                            >
                              <X size={12} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Suggestion list */}
                    <div className="mt-4 flex-1 overflow-y-auto space-y-1">
                      {/* Custom add option */}
                      {showCustomAdd && (
                        <button
                          type="button"
                          onClick={() => addProduct(productSearch.trim())}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-printa-red/20 hover:bg-red-100 transition text-left"
                        >
                          <div className="w-8 h-8 rounded-xl bg-printa-red text-white flex items-center justify-center shrink-0">
                            <Plus size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Add "{productSearch.trim()}"
                            </p>
                            <p className="text-xs text-gray-400">Custom service</p>
                          </div>
                        </button>
                      )}

                      {/* Filtered suggestions */}
                      {filtered.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addProduct(s)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition text-left"
                        >
                          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                            <Plus size={16} />
                          </div>
                          <p className="text-sm font-medium text-gray-700">{s}</p>
                        </button>
                      ))}

                      {filtered.length === 0 && !showCustomAdd && query.length > 0 && (
                        <p className="text-center text-sm text-gray-400 py-6">
                          All matching services already added
                        </p>
                      )}
                    </div>

                    {data.products.length > 0 && (
                      <p className="mt-3 text-xs text-gray-400 text-center">
                        {data.products.length} service{data.products.length > 1 ? "s" : ""} added
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* ─────────── Step 5: Payment ─────────── */}
              {step === 5 && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-printa-red flex items-center justify-center">
                      <Wallet size={16} />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                      How do you get paid?
                    </h1>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 ml-11">
                    Choose how you'll receive customer payments.
                  </p>

                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={() =>
                        set({
                          paymentMethod: "mobile_money",
                          paymentDetail: data.paymentMethod === "mobile_money" ? data.paymentDetail : "",
                        })
                      }
                      className={`w-full flex items-center gap-4 rounded-2xl border-2 p-5 transition-all ${
                        data.paymentMethod === "mobile_money"
                          ? "border-printa-red bg-red-50 shadow-sm shadow-red-100"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          data.paymentMethod === "mobile_money"
                            ? "bg-printa-red text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Smartphone size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-gray-900">Mobile Money</p>
                        <p className="text-xs text-gray-400">MTN, Airtel, Zamtel</p>
                      </div>
                      {data.paymentMethod === "mobile_money" && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-printa-red text-white flex items-center justify-center">
                          <Check size={12} />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        set({
                          paymentMethod: "bank",
                          paymentDetail: data.paymentMethod === "bank" ? data.paymentDetail : "",
                        })
                      }
                      className={`w-full flex items-center gap-4 rounded-2xl border-2 p-5 transition-all ${
                        data.paymentMethod === "bank"
                          ? "border-printa-red bg-red-50 shadow-sm shadow-red-100"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          data.paymentMethod === "bank"
                            ? "bg-printa-red text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Building2 size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-gray-900">Bank Account</p>
                        <p className="text-xs text-gray-400">Direct bank transfer</p>
                      </div>
                      {data.paymentMethod === "bank" && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-printa-red text-white flex items-center justify-center">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  </div>

                  {data.paymentMethod && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <input
                        autoFocus
                        value={data.paymentDetail}
                        onChange={(e) => set({ paymentDetail: e.target.value })}
                        placeholder={
                          data.paymentMethod === "mobile_money"
                            ? "Mobile money number (e.g. 097...)"
                            : "Bank account number"
                        }
                        className="mt-4 w-full h-14 rounded-xl border border-gray-200 px-4 text-base focus:outline-none focus:ring-2 focus:ring-printa-red/40 focus:border-printa-red bg-white"
                        onKeyDown={(e) => e.key === "Enter" && next()}
                      />
                    </motion.div>
                  )}

                  <div className="mt-5 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={data.dataConsentAccepted}
                        onChange={(e) => set({ dataConsentAccepted: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-printa-red focus:ring-printa-red"
                      />
                      <span className="text-sm text-gray-600">
                        I consent to Printa collecting and processing my business, store, contact, payment, and operational data to create my vendor account, verify my store, route jobs, process payments, and provide platform support.
                      </span>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={data.platformTermsAccepted}
                        onChange={(e) => set({ platformTermsAccepted: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-printa-red focus:ring-printa-red"
                      />
                      <span className="text-sm text-gray-600">
                        I confirm the information provided is accurate and agree to Printa's vendor onboarding, payment, and service quality requirements.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom button */}
          <Button
            type="button"
            onClick={next}
            disabled={!canContinue()}
            // whileTap={canContinue() ? { scale: 0.98 } : undefined}
            className={`mt-6 w-full h-14 rounded-xl text-base font-semibold transition-all ${
              canContinue()
                ? "bg-printa-red text-white shadow-lg shadow-red-200/50 hover:shadow-red-300/50"
                : "bg-gray-100 text-gray-300"
            }`}
          >
            {step === 0
              ? "Get Started"
              : step === TOTAL_STEPS
                ? "Complete Setup"
                : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorOnboarding;
