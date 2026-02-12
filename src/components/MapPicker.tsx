import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';
import clsx from 'clsx';
import { getApiKey } from '../../config/api-keys';
import { Location } from '@/data/locations';

const mapLibraries = ['places'] as const;

const brandMapStyle = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#f6f4f0' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#fdf6f0' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#f4e9e4' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f0dede' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#333' }],
  },
];

const createPinIcon = (fill: string, stroke: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="64" viewBox="0 0 50 64">
    <path d="M25 2C16.61 2 10 8.61 10 17.2c0 9.27 9.74 20.04 13.27 24.29a2 2 0 0 0 3.46 0C30.26 37.24 40 26.47 40 17.2 40 8.61 33.39 2 25 2z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
    <circle cx="25" cy="17.2" r="7" fill="rgba(255,255,255,0.1)" stroke="#fff" stroke-width="2"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

type SimpleMapOptions = {
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  streetViewControl?: boolean;
  [key: string]: unknown;
};

interface MapPickerProps {
  locations: Location[];
  selectedLocationId?: string | null;
  onLocationSelect?: (locationId: string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  height?: string | number;
  options?: SimpleMapOptions;
  draggableMarkerId?: string | null;
  onMarkerDrag?: (info: { locationId: string; lat: number; lng: number }) => void;
  trail?: { lat: number; lng: number }[];
}

const defaultCenter = { lat: -15.3875, lng: 28.3228 };

const MapPicker: React.FC<MapPickerProps> = ({
  locations,
  selectedLocationId,
  onLocationSelect,
  center,
  zoom = 14,
  className,
  height = '100%',
  options,
  draggableMarkerId,
  onMarkerDrag,
  trail,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: getApiKey('GOOGLE_MAPS'),
    libraries: mapLibraries as any,
  });

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId),
    [locations, selectedLocationId]
  );

  const mapCenter = useMemo(() => {
    if (center) return center;
    if (selectedLocation) {
      return { lat: selectedLocation.lat, lng: selectedLocation.lng };
    }
    if (locations.length > 0) {
      return { lat: locations[0].lat, lng: locations[0].lng };
    }
    return defaultCenter;
  }, [center, selectedLocation, locations]);

  const markerList = locations.length > 0 ? locations : [];
  const mapRef = useRef<google.maps.Map | null>(null);
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.panTo(mapCenter);
    }
  }, [mapCenter]);

  const containerClass = clsx('w-full', 'relative', className);

  const defaultIcon = createPinIcon('#ffffff', '#e71a1a');
  const selectedIcon = createPinIcon('#e71a1a', '#ffffff');
  const baseMapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    styles: brandMapStyle,
  };

  const mergedOptions = { ...baseMapOptions, ...options };

  if (loadError) {
    return (
      <div className={containerClass} style={{ height }}>
        <div className="flex h-full items-center justify-center rounded-xl bg-red-50 text-sm text-red-600">
          Unable to load map
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={containerClass} style={{ height }}>
        <div className="flex h-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
          Loading map…
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass} style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={zoom}
        options={mergedOptions}
        onLoad={onLoad}
      >
        {markerList.map((location) => {
          const isSelected = location.id === selectedLocationId;
          const isDraggableMarker = draggableMarkerId === location.id;
          const icon = isDraggableMarker ? selectedIcon : isSelected ? selectedIcon : defaultIcon;
          return (
            <Marker
              key={location.id}
              position={{ lat: location.lat, lng: location.lng }}
              draggable={isDraggableMarker}
              onDragEnd={(event) => {
                const lat = event.latLng?.lat();
                const lng = event.latLng?.lng();
                if (lat != null && lng != null) {
                  onMarkerDrag?.({ locationId: location.id, lat, lng });
                }
              }}
              onClick={() => {
                onLocationSelect?.(location.id);
              }}
              icon={icon}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
};

export default MapPicker;
