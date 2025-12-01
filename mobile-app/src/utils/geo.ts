// mobile-app/src/utils/geo.ts

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export const calculateMidpoint = (l1: Location, l2: Location) => {
  return {
    latitude: (l1.lat + l2.lat) / 2,
    longitude: (l1.lng + l2.lng) / 2
  };
};

export const getCenterPoint = (l1: Location | null, l2: Location | null, strategy: string) => {
  if (strategy === 'NEAR_ME' && l1) return { latitude: l1.lat, longitude: l1.lng };
  if (strategy === 'NEAR_THEM' && l2) return { latitude: l2.lat, longitude: l2.lng };
  if (l1 && l2) return calculateMidpoint(l1, l2);
  
  // דיפולט (תל אביב) אם טרם נבחרו מיקומים
  return { latitude: 32.0853, longitude: 34.7818 };
};