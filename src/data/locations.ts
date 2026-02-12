export interface Location {
  id: string;
  name: string;
  address: string;
  distance: string;
  eta: string;
  lat: number;
  lng: number;
}

export const DEFAULT_LOCATIONS: Location[] = [
  {
    id: 'loc1',
    name: 'Levy Junction Print Hub',
    address: 'Levy Junction, Lusaka',
    distance: '1.2 km',
    eta: '7 min',
    lat: -15.4315,
    lng: 28.3550,
  },
  {
    id: 'loc2',
    name: 'East Park Printworks',
    address: 'East Park Mall, Lusaka',
    distance: '2.1 km',
    eta: '10 min',
    lat: -15.4210,
    lng: 28.3821,
  },
  {
    id: 'loc3',
    name: 'Arcades Print Studio',
    address: 'The Arcades Shopping Mall, Lusaka',
    distance: '3.4 km',
    eta: '14 min',
    lat: -15.4248,
    lng: 28.3305,
  },
  {
    id: 'loc4',
    name: 'Cairo Road Print Lab',
    address: 'Cairo Road, Lusaka Central',
    distance: '4.5 km',
    eta: '18 min',
    lat: -15.4205,
    lng: 28.2922,
  },
];
