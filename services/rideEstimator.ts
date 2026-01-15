
import { RideEstimate, RideProvider, RideCategory, Location } from '../types';
import { BASE_RATES, RIDE_SUBCATEGORIES } from '../constants';

export const fetchRideEstimates = async (
  pickup: Location,
  drop: Location
): Promise<RideEstimate[]> => {
  await new Promise(resolve => setTimeout(resolve, 1200));

  const distanceKm = Math.sqrt(
    Math.pow(drop.lat - pickup.lat, 2) + Math.pow(drop.lng - pickup.lng, 2)
  ) * 111;

  const estimates: RideEstimate[] = [];
  const providers = [RideProvider.UBER, RideProvider.OLA, RideProvider.RAPIDO];
  
  providers.forEach(provider => {
    Object.keys(RIDE_SUBCATEGORIES).forEach((catKey) => {
      const category = catKey as RideCategory;
      if (provider === RideProvider.RAPIDO && category === RideCategory.CAB) return;
      
      const subcats = RIDE_SUBCATEGORIES[category];
      const rates = BASE_RATES[category];
      const hour = new Date().getHours();
      
      let surgeMultiplier = 1.0;
      if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21)) {
        surgeMultiplier = 1.2 + Math.random() * 0.4;
      }

      subcats.forEach(sub => {
        const providerFactor = provider === RideProvider.UBER ? 1.08 : provider === RideProvider.OLA ? 1.0 : 0.92;
        const basePrice = (rates.base + (distanceKm * rates.perKm) + (distanceKm * 2 * rates.perMin)) * sub.multiplier;
        const finalPrice = Math.round(basePrice * surgeMultiplier * providerFactor);
        const eta = Math.round(2 + Math.random() * 10);
        const travelTime = Math.round(distanceKm * 4);

        estimates.push({
          id: `${provider}-${category}-${sub.name}-${Math.random()}`,
          provider,
          category,
          name: sub.name,
          price: finalPrice,
          eta,
          travelTime,
          surge: surgeMultiplier > 1.2,
          surgeMultiplier: parseFloat(surgeMultiplier.toFixed(1)),
          deepLink: `${provider.toLowerCase()}://book?pickup=${pickup.lat},${pickup.lng}&drop=${drop.lat},${drop.lng}`,
          features: sub.features
        });
      });
    });
  });

  return estimates;
};
