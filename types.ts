
export enum RideCategory {
  BIKE = 'Bike',
  AUTO = 'Auto',
  CAB = 'Cab'
}

export enum RideProvider {
  UBER = 'Uber',
  OLA = 'Ola',
  RAPIDO = 'Rapido'
}

export enum RideStatus {
  UNSPECIFIED = 'unspecified',
  SEARCHING = 'searching',
  CONFIRMED = 'confirmed',
  ARRIVING = 'arriving',
  ON_TRIP = 'on_trip',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed'
}

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface Location {
  address: string;
  secondaryAddress?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface LocationSuggestion {
  primaryText: string;
  secondaryText: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

export interface RideEstimate {
  id: string;
  provider: RideProvider;
  category: RideCategory;
  name: string;
  price: number;
  eta: number; // in minutes
  travelTime: number; // in minutes
  surge: boolean;
  surgeMultiplier: number;
  deepLink: string;
  features?: string[];
}

export interface Booking {
  id: string;
  rideId: string;
  provider: RideProvider;
  rideName: string;
  price: number;
  status: RideStatus;
  pickup: Location;
  drop: Location;
  otp?: string;
  driverName?: string;
  driverRating?: number;
  vehicleNumber?: string;
  paymentStatus: PaymentStatus;
  timestamp: number;
}

export interface RideHistoryItem {
  id: string;
  timestamp: number;
  pickup: Location;
  drop: Location;
  selectedProvider?: RideProvider;
  selectedCategory?: RideCategory;
  price?: number;
}

export interface AIInsight {
  summary: string;
  recommendation: string;
  savingTip: string;
  surgePrediction?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
