
import { Booking, RideEstimate, RideStatus, PaymentStatus, Location } from '../types';
import { processPayment } from './paymentService';

class ProviderAdapter {
  static async requestRide(ride: RideEstimate, pickup: Location, drop: Location): Promise<Partial<Booking>> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      driverName: ['Rajesh', 'Suresh', 'Amit', 'Vikram'][Math.floor(Math.random() * 4)],
      driverRating: 4.5 + Math.random() * 0.5,
      vehicleNumber: `KA 01 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }
}

export const createBooking = async (
  ride: RideEstimate, 
  pickup: Location, 
  drop: Location
): Promise<Booking> => {
  const payment = await processPayment(ride.price);
  if (!payment.success) {
    throw new Error('Payment failed. Please check your card or wallet.');
  }

  try {
    const providerDetails = await ProviderAdapter.requestRide(ride, pickup, drop);
    
    const booking: Booking = {
      id: `bk_${Math.random().toString(36).substr(2, 9)}`,
      rideId: ride.id,
      provider: ride.provider,
      rideName: ride.name,
      price: ride.price,
      status: RideStatus.CONFIRMED,
      pickup,
      drop,
      paymentStatus: PaymentStatus.CAPTURED,
      timestamp: Date.now(),
      ...providerDetails,
      currentLocation: {
        lat: pickup.lat - 0.01, // Start slightly away
        lng: pickup.lng - 0.01,
        bearing: 0
      }
    };

    return booking;
  } catch (error) {
    throw new Error('Could not book with provider. Payment has been refunded.');
  }
};

export const subscribeToRideStatus = (
  booking: Booking, 
  onStatusUpdate: (status: RideStatus) => void
) => {
  const steps = [
    { status: RideStatus.ARRIVING, delay: 5000 },
    { status: RideStatus.ON_TRIP, delay: 15000 },
    { status: RideStatus.COMPLETED, delay: 45000 },
  ];

  const timeouts = steps.map(step => 
    setTimeout(() => onStatusUpdate(step.status), step.delay)
  );

  return () => timeouts.forEach(t => clearTimeout(t));
};

/**
 * Simulates real-time tracking coordinates using interpolation.
 */
export const subscribeToLiveTracking = (
  booking: Booking,
  onLocationUpdate: (location: { lat: number; lng: number; bearing: number }) => void
) => {
  let progress = 0;
  const totalSteps = 100;
  const intervalTime = 1000; // Update every second

  const interval = setInterval(() => {
    progress += 1;
    if (progress > totalSteps) {
      clearInterval(interval);
      return;
    }

    // Simple linear interpolation between start (simulated slightly away) and drop
    // Step 0-30: Arriving at pickup
    // Step 30-100: On trip to drop
    const t = progress / totalSteps;
    let targetLat, targetLng, sourceLat, sourceLng, segmentT;

    if (t <= 0.3) {
      sourceLat = booking.pickup.lat - 0.01;
      sourceLng = booking.pickup.lng - 0.01;
      targetLat = booking.pickup.lat;
      targetLng = booking.pickup.lng;
      segmentT = t / 0.3;
    } else {
      sourceLat = booking.pickup.lat;
      sourceLng = booking.pickup.lng;
      targetLat = booking.drop.lat;
      targetLng = booking.drop.lng;
      segmentT = (t - 0.3) / 0.7;
    }

    const lat = sourceLat + (targetLat - sourceLat) * segmentT;
    const lng = sourceLng + (targetLng - sourceLng) * segmentT;
    
    // Calculate bearing (crude)
    const bearing = Math.atan2(targetLng - sourceLng, targetLat - sourceLat) * (180 / Math.PI);

    onLocationUpdate({ lat, lng, bearing });
  }, intervalTime);

  return () => clearInterval(interval);
};
