
import { RideProvider, Location, RideEstimate } from '../types';

/**
 * Constructs official web booking URLs for providers.
 * Note: These are official web-app links that don't require the mobile app to be installed.
 */
export const getProviderWebUrl = (
  provider: RideProvider,
  ride: RideEstimate,
  pickup: Location,
  drop: Location
): string => {
  const pickupQuery = `pickup[latitude]=${pickup.lat}&pickup[longitude]=${pickup.lng}&pickup[nickname]=${encodeURIComponent(pickup.address)}`;
  const dropQuery = `dropoff[latitude]=${drop.lat}&dropoff[longitude]=${drop.lng}&dropoff[nickname]=${encodeURIComponent(drop.address)}`;

  switch (provider) {
    case RideProvider.UBER:
      // Uber Web Booking URL
      return `https://m.uber.com/ul/?action=setPickup&${pickupQuery}&${dropQuery}`;
    
    case RideProvider.OLA:
      // Ola Web Booking URL
      return `https://book.olacabs.com/?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${drop.lat}&drop_lng=${drop.lng}&utm_source=ridewise_aggregator`;
    
    case RideProvider.RAPIDO:
      // Rapido doesn't have a public web booking platform yet, redirect to their main site or app store
      return `https://www.rapido.bike/`;
      
    default:
      return '#';
  }
};
