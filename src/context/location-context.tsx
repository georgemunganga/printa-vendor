import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_LOCATIONS, type Location } from "@/data/locations";

interface LocationContextValue {
  selectedLocation: Location;
  availableLocations: Location[];
  setSelectedLocation: (location: Location) => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedLocation, setSelectedLocation] = useState<Location>(DEFAULT_LOCATIONS[0]);

  const value = useMemo(
    () => ({
      selectedLocation,
      availableLocations: DEFAULT_LOCATIONS,
      setSelectedLocation,
    }),
    [selectedLocation]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
};
