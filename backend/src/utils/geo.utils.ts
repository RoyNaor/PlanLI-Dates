export interface Coordinates {
  lat: number;
  lng: number;
}

export const calculateMidpoint = (p1: Coordinates, p2: Coordinates): Coordinates => {
  return {
    lat: (p1.lat + p2.lat) / 2,
    lng: (p1.lng + p2.lng) / 2,
  };
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const calculateDistanceKm = (p1: Coordinates, p2: Coordinates): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(p2.lat - p1.lat);
  const dLon = deg2rad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(p1.lat)) * Math.cos(deg2rad(p2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(2));
};
