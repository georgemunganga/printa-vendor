
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { OrderSummary } from '@/components/OrderSummary';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Truck, MapPin, Check, Navigation, Search, X, Clock, ChevronUp, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_LOCATIONS, Location } from '@/data/locations';
import { getApiKey } from '../../config/api-keys';
import { useLoadScript } from '@react-google-maps/api';
import { getVendorOnboardingState, patchVendorOnboardingState } from '@/lib/vendorOnboardingState';

const MapPicker = lazy(() => import('@/components/MapPicker'));

interface DeliverySuggestion {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

const Checkout = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [deliverySuggestions, setDeliverySuggestions] = useState<DeliverySuggestion[]>([]);
  const deliverySearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentLocationAddress, setCurrentLocationAddress] = useState<string>('');
  const [hasAutoLocated, setHasAutoLocated] = useState(false);
  const [onboardingSnapshot, setOnboardingSnapshot] = useState(getVendorOnboardingState());

  const locationOptions = DEFAULT_LOCATIONS;

  const filteredLocations = searchQuery
    ? locationOptions.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : locationOptions;

  const selectedLocation = locationOptions.find(loc => loc.id === selectedLocationId);
  const currentLocationLabel = isFetchingLocation ? 'Locating…' : currentLocationAddress || 'Current location';
  const deliveryMarkers: Location[] = currentCoords
    ? [
        {
          id: 'delivery-current',
          name: 'Your location',
          address: 'Current delivery position',
          distance: '',
          eta: '',
          lat: currentCoords.lat,
          lng: currentCoords.lng,
        },
      ]
    : [];
  const mapLocations = deliveryMethod === 'pickup' ? locationOptions : deliveryMarkers;
  const mapCenter = selectedLocation
    ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
    : currentCoords ?? undefined;

  const { isLoaded: isGoogleMapsScriptReady } = useLoadScript({
    googleMapsApiKey: getApiKey('GOOGLE_MAPS'),
    libraries: ['places'],
  });
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!isGoogleMapsScriptReady || typeof window === 'undefined') return;
    if (!autocompleteServiceRef.current && window.google?.maps?.places?.AutocompleteService) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
    if (!placesServiceRef.current && window.google?.maps?.places?.PlacesService) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement('div'));
    }
  }, [isGoogleMapsScriptReady]);

  const handleSelectLocation = useCallback(
    (
      locationId: string,
      options?: { clearSearch?: boolean }
    ) => {
      setSelectedLocationId(locationId);
      if (options?.clearSearch ?? true) {
        setSearchQuery('');
      }
    },
    []
  );

  const selectNearestPickup = useCallback(
    (coords: { lat: number; lng: number }) => {
      if (locationOptions.length === 0) return;
      let nearest = locationOptions[0];
      let minDist = Number.POSITIVE_INFINITY;
      locationOptions.forEach((loc) => {
        const dlat = loc.lat - coords.lat;
        const dlng = loc.lng - coords.lng;
        const dist = dlat * dlat + dlng * dlng;
        if (dist < minDist) {
          minDist = dist;
          nearest = loc;
        }
      });
      handleSelectLocation(nearest.id, { clearSearch: false });
    },
    [handleSelectLocation]
  );

  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setCurrentCoords(null);
      setCurrentLocationAddress('');
      setIsFetchingLocation(false);
      setSearchQuery('');
      setDeliverySuggestions([]);
    }
  }, [deliveryMethod]);

  useEffect(() => {
    return () => {
      if (deliverySearchTimer.current) {
        clearTimeout(deliverySearchTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!currentCoords) return;
    if (deliveryMethod === 'pickup') {
      selectNearestPickup(currentCoords);
    }
  }, [currentCoords, deliveryMethod, selectNearestPickup]);

  const mapFallback = (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-gray-500">
      Loading map…
    </div>
  );

  const reverseGeocode = useCallback(async (coords: { lat: number; lng: number }) => {
    const key = getApiKey('GOOGLE_MAPS');
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${key}`
      );
      if (!response.ok) throw new Error('Reverse geocode failed');
      const data = await response.json();
      return data?.results?.[0]?.formatted_address ?? '';
    } catch (error) {
      console.error('Reverse geocode error', error);
      return '';
    }
  }, []);

  const fetchAddressSuggestions = useCallback(async (query: string): Promise<DeliverySuggestion[]> => {
    const key = getApiKey('GOOGLE_MAPS');
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`
      );
      if (!response.ok) throw new Error('Address lookup failed');
      const data = await response.json();
      if (!Array.isArray(data?.results)) return [];
      const hits = data.results.filter((result: any) => result.geometry?.location);
      return hits.slice(0, 4).map((result: any) => ({
        id: result.place_id ?? `${result.geometry.location.lat}-${result.geometry.location.lng}`,
        address: result.formatted_address ?? query,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      }));
    } catch (error) {
      console.error('fetchAddressSuggestions error', error);
      return [];
    }
  }, []);

  const fetchPlaceDetails = useCallback((placeId: string) => {
    return new Promise<{ lat?: number; lng?: number; address?: string } | null>((resolve) => {
      if (!placesServiceRef.current || typeof window === 'undefined') {
        resolve(null);
        return;
      }

      placesServiceRef.current.getDetails(
        {
          placeId,
          fields: ['geometry', 'formatted_address'],
        },
        (place, status) => {
          if (
            !place ||
            !window.google?.maps?.places?.PlacesServiceStatus ||
            status !== window.google.maps.places.PlacesServiceStatus.OK ||
            !place.geometry?.location
          ) {
            resolve(null);
            return;
          }

          resolve({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address ?? place.name ?? undefined,
          });
        }
      );
    });
  }, []);

  const scheduleDeliverySearch = useCallback(
    (query: string) => {
      if (deliverySearchTimer.current) {
        clearTimeout(deliverySearchTimer.current);
      }

      const trimmed = query.trim();
      if (!trimmed || trimmed.length < 3) {
        setDeliverySuggestions([]);
        return;
      }

      deliverySearchTimer.current = window.setTimeout(async () => {
        if (autocompleteServiceRef.current && window.google?.maps?.places) {
          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: trimmed,
              componentRestrictions: { country: 'zm' },
            },
            (predictions, status) => {
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                predictions?.length
              ) {
                setDeliverySuggestions(
                  predictions.map((prediction) => ({
                    id: prediction.place_id,
                    address: prediction.description,
                    placeId: prediction.place_id,
                  }))
                );
                return;
              }
              setDeliverySuggestions([]);
            }
          );
          return;
        }

        try {
          const suggestions = await fetchAddressSuggestions(trimmed);
          setDeliverySuggestions(suggestions);
        } catch {
          setDeliverySuggestions([]);
        }
      }, 450);
    },
    [fetchAddressSuggestions]
  );

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (deliveryMethod === 'delivery') {
      scheduleDeliverySearch(value);
    }
  };

  const handleDeliverySuggestionSelect = (suggestion: DeliverySuggestion) => {
    setCurrentCoords({ lat: suggestion.lat, lng: suggestion.lng });
    setCurrentLocationAddress(suggestion.address);
    setDeliverySuggestions([]);
    setSearchQuery(suggestion.address);
    handleSelectLocation('delivery-current', { clearSearch: false });
  };

  // Mock files and options
  const mockFiles = [
    new File([""], "document1.pdf", { type: "application/pdf" }),
    new File([""], "document2.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
  ];

  const mockPrintOptions = {
    paperSize: 'a4',
    paperType: 'standard',
    printColor: 'color',
    printSides: 'double',
  };

  const navigate = useNavigate();

  const applyLocation = useCallback(
    async (
      coords: { lat: number; lng: number },
      options?: {
        clearSearch?: boolean;
        updateSearch?: boolean;
        showToast?: boolean;
      }
    ) => {
      const { clearSearch = false, updateSearch = true, showToast = false } = options ?? {};
      setCurrentCoords(coords);
      const formattedAddress = await reverseGeocode(coords);
      if (formattedAddress) {
        setCurrentLocationAddress(formattedAddress);
        if (updateSearch) {
          setSearchQuery(formattedAddress);
        }
      } else {
        setCurrentLocationAddress('');
        if (updateSearch) {
          setSearchQuery('');
        }
      }
      setDeliverySuggestions([]);
      handleSelectLocation('delivery-current', { clearSearch });
      if (showToast) {
        toast.success('Location captured. Drag the map if you need to fine-tune it.');
      }
    },
    [handleSelectLocation, reverseGeocode]
  );

  useEffect(() => {
    if (hasAutoLocated || currentCoords) return;
    if (!navigator?.geolocation) {
      setHasAutoLocated(true);
      return;
    }

    setIsFetchingLocation(true);
    setHasAutoLocated(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentCoords(coords);
        if (deliveryMethod === 'delivery') {
          await applyLocation(coords, { clearSearch: false, updateSearch: true });
        } else {
          selectNearestPickup(coords);
        }
        setIsFetchingLocation(false);
      },
      () => {
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [applyLocation, currentCoords, deliveryMethod, hasAutoLocated, selectNearestPickup]);

  const handleCheckout = () => {
    patchVendorOnboardingState({ testOrderCompleted: true });
    setOnboardingSnapshot(getVendorOnboardingState());
    toast.success("Onboarding test order completed. Opening dashboard...");
    setTimeout(() => navigate('/dashboard'), 1200);
  };

  useEffect(() => {
    if (selectedLocationId) {
      patchVendorOnboardingState({ fulfillmentDone: true });
      setOnboardingSnapshot(getVendorOnboardingState());
    }
  }, [selectedLocationId]);

  const handleUseCurrentLocation = () => {
    if (deliveryMethod === 'pickup') {
      handleSelectLocation(locationOptions[0].id);
      return;
    }

    if (!navigator?.geolocation) {
      toast.error('Geolocation is not available in your browser.');
      return;
    }

    setIsFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        await applyLocation(coords, { clearSearch: false, showToast: true });
        setIsFetchingLocation(false);
      },
      () => {
        setIsFetchingLocation(false);
        toast.error('Unable to read your location. Please allow location access or try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleDeliveryMarkerDrag = async ({
    locationId,
    lat,
    lng,
  }: {
    locationId: string;
    lat: number;
    lng: number;
  }) => {
    setIsFetchingLocation(true);
    await applyLocation({ lat, lng }, { clearSearch: false, updateSearch: true });
    setIsFetchingLocation(false);
  };

  return (
    <>
      {/* Mobile: Full immersive view without navbar */}
      <div className="md:hidden fixed inset-0 bg-gray-100 z-50">
        {/* Map Background */}
        <div className="absolute inset-0">
            <Suspense fallback={mapFallback}>
              <MapPicker
                locations={mapLocations}
                selectedLocationId={selectedLocationId}
                onLocationSelect={handleSelectLocation}
                center={mapCenter}
                className="h-full"
                height="100%"
                zoom={14}
                draggableMarkerId={deliveryMethod === 'delivery' ? 'delivery-current' : null}
                onMarkerDrag={deliveryMethod === 'delivery' ? handleDeliveryMarkerDrag : undefined}
              />
            </Suspense>
          </div>

        {/* Top Controls */}
        {!showOrderSummary && (
          <div className="absolute top-0 left-0 right-0 z-30 safe-area-top">
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <Link to="/customize" className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm">
                <ArrowLeft size={20} className="text-gray-700" />
              </Link>
              <h1 className="text-sm font-semibold text-gray-800 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                {deliveryMethod === 'pickup' ? 'Select Pickup Point' : 'Set Delivery Address'}
              </h1>
              {deliveryMethod === 'delivery' ? (
                <Button
                  
                  className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm h-auto"
                  variant="ghost"
                >
                 
                </Button>
              ) : (
                <div className="w-10" />
              )}
            </div>

            {/* Pickup/Delivery Toggle */}
            <div className="px-4 pb-3">
              <div className="bg-white/95 backdrop-blur rounded-full p-1 shadow-lg flex">
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'bg-printa-red text-white shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <MapPin size={16} />
                  Pickup
                </button>
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${
                    deliveryMethod === 'delivery'
                      ? 'bg-printa-red text-white shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <Truck size={16} />
                  Delivery
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-4">
              <div className={`relative transition-all ${deliveryMethod === 'delivery' ? 'bg-white/80 backdrop-blur' : 'bg-white'} rounded-xl shadow-lg`}>
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder={deliveryMethod === 'pickup' ? "Search pickup locations..." : "Enter delivery address..."}
                  className={`pl-11 pr-4 py-6 text-sm rounded-xl border-0 ${
                    deliveryMethod === 'delivery' ? 'bg-transparent placeholder:text-gray-500' : ''
                  }`}
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
              </div>

              {/* Search suggestions */}
              <AnimatePresence>
                {isSearchFocused && searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      {deliveryMethod === 'delivery' ? (
                        deliverySuggestions.length > 0 ? (
                          deliverySuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              onClick={() => handleDeliverySuggestionSelect(suggestion)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                            >
                              <div className="p-2 bg-red-50 text-printa-red rounded-full">
                                <MapPin size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{suggestion.address}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-gray-500">Type an address to preview it on the map.</div>
                        )
                      ) : (
                        filteredLocations.slice(0, 3).map((loc) => (
                          <button
                            key={loc.id}
                            onClick={() => handleSelectLocation(loc.id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                          >
                            <div className="p-2 bg-red-50 text-printa-red rounded-full">
                              <MapPin size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{loc.name}</p>
                              <p className="text-xs text-gray-500 truncate">{loc.address}</p>
                            </div>
                            <span className="text-xs text-gray-400">{loc.distance}</span>
                          </button>
                        ))
                      )}
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {showOrderSummary && (
          <div className="fixed top-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 shadow-lg shadow-black/10 backdrop-blur">
            <button
              onClick={() => setShowOrderSummary(false)}
              className="rounded-full bg-gray-100 p-2 text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-printa-red"
              aria-label="Back to location selection"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex z-20 items-center gap-1 text-sm font-semibold text-gray-700">
              <MapPin size={18} className="text-printa-red" />
              <span>Map</span>
            </div>
          </div>
        )}

        {/* Bottom Floating Card */}
        <div className="absolute bottom-0 left-0 right-0 z-30 safe-area-bottom">
          <AnimatePresence mode="wait">
            {showOrderSummary ? (
              <motion.div
                key="summary"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-white rounded-t-3xl shadow-2xl max-h-[83vh] overflow-y-auto"
              >
                <button
                  onClick={() => setShowOrderSummary(false)}
                  className="w-full py-3 flex items-center justify-center border-b border-gray-100"
                >
                  <ChevronUp size={20} className="text-gray-400 rotate-180" />
                </button>
                <div className="p-4">
                  <OrderSummary
                    files={mockFiles}
                    printOptions={mockPrintOptions}
                    locationId={selectedLocationId}
                    isDelivery={deliveryMethod === 'delivery'}
                    onCheckout={handleCheckout}
                  />
                </div>
              </motion.div>
            ) : selectedLocation ? (
              <motion.div
                key="selected"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="mx-4 mb-4"
              >
                <div className="bg-white rounded-2xl shadow-xl p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 bg-printa-black text-white rounded-xl">
                      <Check size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{selectedLocation.name}</p>
                      <p className="text-sm text-gray-500 truncate">{selectedLocation.address}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{selectedLocation.distance}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock size={10} /> {selectedLocation.eta}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLocationId(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <Button
                    onClick={() => setShowOrderSummary(true)}
                    className="w-full bg-printa-red hover:bg-printa-red/90 text-white rounded-xl py-3 font-medium"
                  >
                    Continue to Summary <ArrowRight size={18} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="mx-4 mb-4"
              >
                <div className="bg-white rounded-2xl shadow-xl overflow-visible">
                  {deliveryMethod === 'pickup' ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nearby Pickup Points</p>
                        <span className="text-xs text-gray-400">{locationOptions.length} locations</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredLocations.map((loc, index) => (
                          <button
                            key={loc.id}
                            onClick={() => handleSelectLocation(loc.id)}
                            onMouseEnter={() => setHoveredLocation(loc.id)}
                            onMouseLeave={() => setHoveredLocation(null)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              index === 0 ? 'bg-printa-red text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{loc.name}</p>
                              <p className="text-xs text-gray-500 truncate">{loc.address}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-gray-700">{loc.distance}</p>
                              <p className="text-xs text-gray-400">{loc.eta}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                    ) : (
                      <div className="p-4 relative pt-4">
                        <Button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={isFetchingLocation}
                          className="absolute -top-16 right-4 z-30 flex items-center gap-2 rounded-full bg-printa-red px-4 py-3 text-white shadow-md transition hover:bg-printa-black focus-visible:ring-2 focus-visible:ring-printa-red disabled:opacity-60 disabled:cursor-not-allowed"
                          aria-label={isFetchingLocation ? 'Finding your location' : 'Use my current location'}
                        >
                          <Navigation size={22} className={isFetchingLocation ? 'animate-spin' : undefined} />
                          <span className="text-sm font-semibold">{currentLocationLabel}</span>
                        </Button>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2.5 bg-printa-red/10 text-printa-red rounded-xl">
                            <Truck size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Delivery Address</p>
                            <p className="text-sm text-gray-500">Move the map to set your location</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedLocationId('delivery-address');
                            setShowOrderSummary(true);
                          }}
                          className="w-full bg-printa-red hover:bg-printa-red/90 text-white rounded-xl py-3 font-medium"
                        >
                          Confirm Location <Check size={18} className="ml-2" />
                        </Button>
                      </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop View - with Layout/Navbar */}
      <Layout hideNavbarOnMobile={!showOrderSummary}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block min-h-screen bg-gray-50"
        >
          <div className="container mx-auto px-4 py-8 pt-24">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Step 3: Complete Test Checkout</h1>
                  <p className="text-gray-500 text-sm">Finalize fulfillment to finish onboarding and enter dashboard</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-printa-red text-white flex items-center justify-center mr-2">
                      <Check size={14} />
                    </span>
                    Upload
                  </span>
                  <ArrowRight size={16} className="mx-2 text-gray-300" />
                  <span className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-printa-red text-white flex items-center justify-center mr-2">
                      <Check size={14} />
                    </span>
                    Customize
                  </span>
                  <ArrowRight size={16} className="mx-2 text-gray-300" />
                  <span className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-printa-red text-white flex items-center justify-center mr-2">3</span>
                    Checkout
                  </span>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[11px] uppercase tracking-wide text-printa-red font-semibold mb-2">Go-Live Readiness</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                  <p className={onboardingSnapshot.businessProfileDone ? "text-green-700" : "text-gray-500"}>
                    {onboardingSnapshot.businessProfileDone ? "Done" : "Pending"}: Profile
                  </p>
                  <p className={onboardingSnapshot.servicesDone ? "text-green-700" : "text-gray-500"}>
                    {onboardingSnapshot.servicesDone ? "Done" : "Pending"}: Services
                  </p>
                  <p className={onboardingSnapshot.pricingDone ? "text-green-700" : "text-gray-500"}>
                    {onboardingSnapshot.pricingDone ? "Done" : "Pending"}: Pricing
                  </p>
                  <p className={onboardingSnapshot.teamSecurityDone ? "text-green-700" : "text-gray-500"}>
                    {onboardingSnapshot.teamSecurityDone ? "Done" : "Pending"}: Team PIN
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-6">
                {/* Map Section - Takes 3 columns */}
                <div className="col-span-3">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[600px] relative">
                    {/* Map */}
                    <div className="absolute inset-0">
                      <Suspense fallback={mapFallback}>
                        <MapPicker
                          locations={mapLocations}
                          selectedLocationId={selectedLocationId}
                          onLocationSelect={handleSelectLocation}
                          center={mapCenter}
                          className="h-full"
                          height="100%"
                          zoom={12}
                          draggableMarkerId={deliveryMethod === 'delivery' ? 'delivery-current' : null}
                          onMarkerDrag={deliveryMethod === 'delivery' ? handleDeliveryMarkerDrag : undefined}
                        />
                      </Suspense>
                    </div>

                    {/* Floating controls on map */}
                    <div className="absolute top-4 left-4 right-4 z-20">
                      {/* Toggle */}
                      <div className="bg-white rounded-full p-1 shadow-lg flex w-fit mx-auto mb-4 gap-2">
                        <button
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-medium transition-all ${
                            deliveryMethod === 'pickup' ? 'bg-printa-red text-white' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <MapPin size={16} /> Pickup
                        </button>
                        <button
                          onClick={() => setDeliveryMethod('delivery')}
                          className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-medium transition-all ${
                            deliveryMethod === 'delivery' ? 'bg-printa-red text-white' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Truck size={16} /> Delivery
                        </button>
                      </div>

                      {/* Search */}
                      <div className={`relative ${deliveryMethod === 'delivery' ? 'bg-white/80 backdrop-blur' : 'bg-white'} rounded-xl shadow-lg`}>
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder={deliveryMethod === 'pickup' ? "Search pickup locations..." : "Enter delivery address..."}
                          className="pl-11 pr-12 py-6 rounded-xl border-0"
                          value={searchQuery}
                          onChange={(e) => handleSearchInput(e.target.value)}
                        />
                        <Button
                          onClick={handleUseCurrentLocation}
                          disabled={isFetchingLocation}
                          variant="ghost"
                          className="absolute bg-printa-black right-2 top-1/2 -translate-y-1/2 p-2 h-auto hover:bg-printa-red rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                          aria-label={isFetchingLocation ? 'Finding your location' : 'Use my current location'}
                        >
                          <Navigation size={18} className="text-white" />
                        </Button>
                      </div>
                    </div>

                    {deliveryMethod === 'delivery' && (
                      <Button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={isFetchingLocation}
                        className="absolute bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-printa-red px-4 py-3 text-white shadow-2xl shadow-black/30 text-sm font-semibold hover:bg-printa-black transition focus-visible:ring-2 focus-visible:ring-printa-red disabled:opacity-60 disabled:cursor-not-allowed"
                        aria-label={isFetchingLocation ? 'Finding your location' : 'Use my current location'}
                      >
                        <Navigation size={20} className={isFetchingLocation ? 'animate-spin' : undefined} />
                        <span>{currentLocationLabel}</span>
                      </Button>
                    )}

                    {/* Selected location card */}
                    <AnimatePresence>
                      {selectedLocation && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          className="absolute bottom-4 left-4 right-4 z-20"
                        >
                          <div className="bg-white rounded-xl shadow-xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-printa-black text-white rounded-xl">
                              <Check size={22} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{selectedLocation.name}</p>
                              <p className="text-sm text-gray-500">{selectedLocation.address}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{selectedLocation.distance}</span>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{selectedLocation.eta}</span>
                              </div>
                            </div>
                            <button onClick={() => setSelectedLocationId(null)} className="p-2 hover:bg-gray-100 rounded-full">
                              <X size={18} className="text-gray-400" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Location list for pickup */}
                    {!selectedLocation && deliveryMethod === 'pickup' && (
                      <div className="absolute bottom-4 left-4 right-4 z-20">
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Nearby</span>
                            <span className="text-xs text-gray-400">{locationOptions.length} found</span>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {filteredLocations.slice(0, 3).map((loc, i) => (
                              <button
                                key={loc.id}
                                onClick={() => handleSelectLocation(loc.id)}
                                onMouseEnter={() => setHoveredLocation(loc.id)}
                                onMouseLeave={() => setHoveredLocation(null)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                              >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  i === 0 ? 'bg-printa-red text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{loc.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{loc.address}</p>
                                </div>
                                <span className="text-xs text-gray-400">{loc.distance}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary - Takes 2 columns */}
                <div className="col-span-2">
                  <OrderSummary
                    files={mockFiles}
                    printOptions={mockPrintOptions}
                    locationId={selectedLocationId}
                    isDelivery={deliveryMethod === 'delivery'}
                    onCheckout={handleCheckout}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <Link to="/customize" className="flex items-center text-gray-500 hover:text-printa-red transition-colors">
                  <ArrowLeft size={18} className="mr-2" /> Back to Customize
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </Layout>
    </>
  );
};

export default Checkout;


