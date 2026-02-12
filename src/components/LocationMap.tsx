
import React, { lazy, Suspense, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, X, Map, Clock, Check, ChevronRight, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
const MapPicker = lazy(() => import('@/components/MapPicker'));
import { DEFAULT_LOCATIONS, Location } from '@/data/locations';

interface LocationMapProps {
  onLocationSelected: (locationId: string) => void;
  isDelivery?: boolean;
  isMobileFullscreen?: boolean;
  locations?: Location[];
}

export const LocationMap: React.FC<LocationMapProps> = ({
  onLocationSelected,
  isDelivery = false,
  isMobileFullscreen = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const availableLocations = locations ?? DEFAULT_LOCATIONS;

  const pickupLocations = availableLocations;
  const filteredPickupLocations = searchQuery
    ? pickupLocations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pickupLocations;

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setSearchQuery('');
    setIsSearchFocused(false);
    onLocationSelected(location.id);
  };

  const handleSelectLocationById = (locationId: string) => {
    const found = availableLocations.find((loc) => loc.id === locationId) ?? availableLocations[0];
    handleSelectLocation(found);
  };

  const handleUseCurrentLocation = () => {
    // Simulate getting current location and finding nearest
    const nearestLocation = availableLocations[0];
    handleSelectLocation(nearestLocation);
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const showSuggestions = !isDelivery && (isSearchFocused || searchQuery.length > 0);
  const mapFallback = (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-gray-500">
      Loading map…
    </div>
  );

  // Mobile fullscreen view with interactive map background
  if (isMobileFullscreen) {
    return (
      <div className="h-full relative">
        <div className="absolute inset-0">
          <Suspense fallback={mapFallback}>
            <MapPicker
              locations={availableLocations}
              selectedLocationId={selectedLocation?.id ?? null}
              onLocationSelect={handleSelectLocationById}
              center={
                selectedLocation
                  ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
                  : undefined
              }
              className="h-full"
              height="100%"
              zoom={14}
            />
          </Suspense>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={isDelivery ? "Enter delivery address..." : "Search pickup location..."}
              className="pl-11 pr-12 py-3 text-sm rounded-xl bg-white shadow-lg border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            <Button
              onClick={handleUseCurrentLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-auto bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl"
            >
              <Navigation size={16} />
            </Button>
          </div>

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {!isDelivery && showSuggestions && !selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={handleUseCurrentLocation}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                >
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                    <Navigation size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Use current location</p>
                    <p className="text-xs text-gray-500">Find nearest point</p>
                  </div>
                </button>
                <div className="max-h-48 overflow-y-auto">
                  {filteredPickupLocations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleSelectLocation(location)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <div className="p-2 bg-red-50 text-printa-red rounded-full">
                        <MapPin size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{location.name}</p>
                        <p className="text-xs text-gray-500 truncate">{location.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-600">{location.distance}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Bottom Card */}
        <div className="absolute bottom-20 left-4 right-4 z-20">
          <AnimatePresence mode="wait">
            {selectedLocation ? (
              <motion.div
                key="selected"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-printa-red text-white rounded-xl">
                    <Check size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{selectedLocation.name}</p>
                    <p className="text-sm text-gray-500 truncate">{selectedLocation.address}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <MapPin size={10} /> {selectedLocation.distance}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock size={10} /> {selectedLocation.eta}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleClearSelection}
                    className="p-2 h-auto text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </motion.div>
            ) : isDelivery ? (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-printa-red/10 text-printa-red rounded-xl">
                    <Home size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Delivery Address</p>
                    <p className="text-sm text-gray-500">Enter your address above</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  We'll deliver your prints right to your doorstep within 24-48 hours.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="nearby"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nearby Locations</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {availableLocations.slice(0, 3).map((location, index) => (
                    <button
                      key={location.id}
                      onClick={() => handleSelectLocation(location)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-printa-red text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{location.name}</p>
                        <p className="text-xs text-gray-500 truncate">{location.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-600">{location.distance}</p>
                        <p className="text-xs text-gray-400">{location.eta}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Desktop/tablet card view
  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-medium">{isDelivery ? 'Delivery Address' : 'Pickup Location'}</h2>
            {!showMapView && !isDelivery && (
              <Button
                variant="ghost"
                onClick={() => setShowMapView(true)}
                className="text-xs sm:text-sm text-printa-red hover:bg-red-50 flex items-center gap-1 px-2 py-1 h-auto"
              >
                <Map size={14} />
                <span className="hidden sm:inline">View Map</span>
              </Button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            {isDelivery ? 'Where should we deliver your prints?' : 'Where should we send your prints?'}
          </p>
        </div>

        {/* Map View */}
        <AnimatePresence>
          {showMapView && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <div className="h-48 sm:h-64 relative">
                  <Suspense fallback={mapFallback}>
                    <MapPicker
                      locations={availableLocations}
                      selectedLocationId={selectedLocation?.id ?? null}
                      onLocationSelect={handleSelectLocationById}
                      className="absolute inset-0 rounded-xl"
                      height="100%"
                      zoom={13}
                    />
                  </Suspense>
                  <Button
                    onClick={handleUseCurrentLocation}
                    className="absolute bottom-3 right-3 bg-white text-gray-700 hover:bg-gray-50 shadow-lg rounded-full p-2 h-auto"
                  >
                    <Navigation size={18} />
                  </Button>
                </div>

                {/* Close map button */}
                <Button
                  variant="ghost"
                  onClick={() => setShowMapView(false)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 h-auto shadow-sm"
                >
                  <X size={16} />
                </Button>

                {/* Floating search on map */}
                <div className="absolute top-2 left-2 right-12">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search location..."
                      className="pl-9 pr-4 py-2 text-sm rounded-full bg-white shadow-md border-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="p-4 sm:p-5">
          {/* Selected Location Display */}
          {selectedLocation && !showMapView ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="p-2 bg-printa-red text-white rounded-full shrink-0">
                  <Check size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-green-800">{selectedLocation.name}</p>
                  <p className="text-xs text-green-600 truncate">{selectedLocation.address}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <MapPin size={10} /> {selectedLocation.distance}
                    </span>
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Clock size={10} /> {selectedLocation.eta}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleClearSelection}
                  className="text-green-600 hover:text-green-800 hover:bg-green-100 p-1 h-auto rounded-full"
                >
                  <X size={16} />
                </Button>
              </div>
            </motion.div>
          ) : null}

          {/* Search Input (when no selection or map not showing) */}
          {(!selectedLocation || showMapView) && !showMapView && (
            <div className="relative">
              <div className="flex gap-2">
                 <div className="relative flex-1">
                   <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <Input
                     ref={searchInputRef}
                     type="text"
                     placeholder={isDelivery ? 'Enter delivery address...' : 'Search for pickup location...'}
                     className="pl-10 pr-4 py-3 text-sm rounded-xl border-gray-200 focus:border-printa-red focus:ring-printa-red"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     onFocus={() => setIsSearchFocused(true)}
                     onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                   />
                 </div>
                {/* Current Location Button */}
                <Button
                  onClick={handleUseCurrentLocation}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl p-3 h-auto shrink-0"
                  title="Use current location"
                >
                  <Navigation size={18} />
                </Button>
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && !selectedLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* Quick Actions */}
                    <div className="p-2 border-b border-gray-50">
                      <button
                        onClick={handleUseCurrentLocation}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
                      >
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                          <Navigation size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Use current location</p>
                          <p className="text-xs text-gray-500">Find nearest pickup point</p>
                        </div>
                      </button>
                    </div>

                    {/* Location Results */}
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredPickupLocations.length > 0 ? (
                        filteredPickupLocations.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => handleSelectLocation(location)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                          >
                            <div className="p-2 bg-red-50 text-printa-red rounded-full shrink-0">
                              <MapPin size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{location.name}</p>
                              <p className="text-xs text-gray-500 truncate">{location.address}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-medium text-gray-600">{location.distance}</p>
                              <p className="text-xs text-gray-400">{location.eta}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No locations found
                        </div>
                      )}
                    </div>

                    {/* View on Map */}
                    <div className="p-2 border-t border-gray-50">
                      <button
                        onClick={() => {
                          setShowMapView(true);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center justify-between gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 text-gray-600 rounded-full">
                            <Map size={14} />
                          </div>
                          <p className="text-sm font-medium text-gray-700">Select on map</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Nearby Locations (when nothing selected and not searching) */}
          {!selectedLocation && !isDelivery && !showSuggestions && !showMapView && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Nearby</p>
              <div className="space-y-1">
                {availableLocations.slice(0, 3).map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleSelectLocation(location)}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                  >
                    <div className="p-1.5 bg-gray-100 text-gray-500 rounded-full group-hover:bg-red-50 group-hover:text-printa-red transition-colors">
                      <MapPin size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{location.name}</p>
                      <p className="text-xs text-gray-500 truncate">{location.address}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">{location.distance}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
