
import { RideProvider, RideCategory } from './types';

export const PROVIDER_THEMES = {
  [RideProvider.UBER]: {
    color: 'bg-black',
    textColor: 'text-white',
    border: 'border-gray-900',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/2560px-Uber_logo_2018.svg.png'
  },
  [RideProvider.OLA]: {
    color: 'bg-yellow-400',
    textColor: 'text-black',
    border: 'border-yellow-500',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/Ola_Cabs_logo.svg/1200px-Ola_Cabs_logo.svg.png'
  },
  [RideProvider.RAPIDO]: {
    color: 'bg-yellow-500',
    textColor: 'text-black',
    border: 'border-yellow-600',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Rapido_logo.svg/1200px-Rapido_logo.svg.png'
  }
};

export const BASE_RATES = {
  [RideCategory.BIKE]: { base: 20, perKm: 6, perMin: 1 },
  [RideCategory.AUTO]: { base: 25, perKm: 12, perMin: 1.5 },
  [RideCategory.CAB]: { base: 50, perKm: 16, perMin: 2 }
};

export const RIDE_SUBCATEGORIES = {
  [RideCategory.CAB]: [
    { name: 'Mini', multiplier: 1.0, features: ['Compact', 'AC'] },
    { name: 'Sedan', multiplier: 1.2, features: ['Comfort', 'AC', 'Top Rated'] },
    { name: 'SUV', multiplier: 1.6, features: ['6 Seater', 'AC', 'More Luggage'] }
  ],
  [RideCategory.AUTO]: [
    { name: 'Auto', multiplier: 1.0, features: ['Economical', 'Open Air'] }
  ],
  [RideCategory.BIKE]: [
    { name: 'Bike', multiplier: 1.0, features: ['Fastest', 'Solo Trip'] }
  ]
};
