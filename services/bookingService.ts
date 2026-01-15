
import { Booking, RideEstimate, RideStatus, PaymentStatus, Location } from '../types';
import { processPayment } from './paymentService';

/**
 * ProviderAdapter simulates the interface to different Ride Providers.
 * In production, these methods would hit official REST/gRPC endpoints.
 */
class ProviderAdapter {
  static async requestRide(ride: RideEstimate, pickup: Location, drop: Location): Promise<Partial<Booking>> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate real-world response data from provider
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
  // 1. Authorize Payment
  const payment = await processPayment(ride.price);
  if (!payment.success) {
    throw new Error('Payment failed. Please check your card or wallet.');
  }

  // 2. Request Ride from Provider
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
      ...providerDetails
    };

    return booking;
  } catch (error) {
    // 3. Rollback payment if booking fails
    throw new Error('Could not book with provider. Payment has been refunded.');
  }
};

/**
 * Simulates a ride status lifecycle for demonstration purposes.
 * In production, this would be a WebSocket or Polling service.
 */
export const subscribeToRideStatus = (
  booking: Booking, 
  onStatusUpdate: (status: RideStatus) => void
) => {
  const steps = [
    { status: RideStatus.ARRIVING, delay: 5000 },
    { status: RideStatus.ON_TRIP, delay: 15000 },
    { status: RideStatus.COMPLETED, delay: 30000 },
  ];

  steps.forEach((step, index) => {
    setTimeout(() => {
      onStatusUpdate(step.status);
    }, step.delay);
  });
};
