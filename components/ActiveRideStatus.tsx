
import React, { useEffect, useState, useMemo } from 'react';
import { Booking, RideStatus } from '../types';
import { subscribeToRideStatus, subscribeToLiveTracking } from '../services/bookingService';
import { PROVIDER_THEMES } from '../constants';

interface ActiveRideStatusProps {
  booking: Booking;
  onComplete: () => void;
}

const ActiveRideStatus: React.FC<ActiveRideStatusProps> = ({ booking, onComplete }) => {
  const [status, setStatus] = useState<RideStatus>(booking.status);
  const [location, setLocation] = useState(booking.currentLocation || { lat: 0, lng: 0, bearing: 0 });
  const theme = PROVIDER_THEMES[booking.provider];

  useEffect(() => {
    const unsubStatus = subscribeToRideStatus(booking, (newStatus) => {
      setStatus(newStatus);
      if (newStatus === RideStatus.COMPLETED) {
        setTimeout(onComplete, 4000);
      }
    });

    const unsubTracking = subscribeToLiveTracking(booking, (newLoc) => {
      setLocation(newLoc);
    });

    return () => {
      unsubStatus();
      unsubTracking();
    };
  }, [booking, onComplete]);

  const getStatusLabel = (s: RideStatus) => {
    switch (s) {
      case RideStatus.CONFIRMED: return 'Ride Confirmed';
      case RideStatus.ARRIVING: return 'Driver Arriving';
      case RideStatus.ON_TRIP: return 'Trip in Progress';
      case RideStatus.COMPLETED: return 'Trip Completed';
      default: return 'Processing';
    }
  };

  // Helper to calculate relative position on the SVG map
  // Maps lat/lng to a 0-100 coordinate system based on pickup and drop bounds
  const mapCoords = useMemo(() => {
    const minLat = Math.min(booking.pickup.lat, booking.drop.lat, location.lat) - 0.005;
    const maxLat = Math.max(booking.pickup.lat, booking.drop.lat, location.lat) + 0.005;
    const minLng = Math.min(booking.pickup.lng, booking.drop.lng, location.lng) - 0.005;
    const maxLng = Math.max(booking.pickup.lng, booking.drop.lng, location.lng) + 0.005;

    const getX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
    const getY = (lat: number) => 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

    return {
      pickup: { x: getX(booking.pickup.lng), y: getY(booking.pickup.lat) },
      drop: { x: getX(booking.drop.lng), y: getY(booking.drop.lat) },
      car: { x: getX(location.lng), y: getY(location.lat) }
    };
  }, [booking, location]);

  return (
    <div className="fixed inset-0 bg-[#F9FAFB] z-[120] flex flex-col animate-in slide-in-from-right duration-500">
      <header className="bg-gray-900 pt-12 pb-24 px-8 text-white relative">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Live Tracking</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{getStatusLabel(status)}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">ETA</p>
             <p className="text-xl font-black text-white">{status === RideStatus.ON_TRIP ? '12 min' : '3 min'}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 -mt-16 px-6 pb-6 overflow-y-auto no-scrollbar">
        {/* Dynamic Map Visualization */}
        <div className="bg-slate-50 w-full aspect-square sm:aspect-video rounded-[48px] mb-8 relative overflow-hidden shadow-2xl shadow-gray-200/50 border-4 border-white">
           {/* Abstract Map Grid */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
           
           <svg className="absolute inset-0 w-full h-full p-12" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Path line */}
              <line 
                x1={mapCoords.pickup.x} y1={mapCoords.pickup.y} 
                x2={mapCoords.drop.x} y2={mapCoords.drop.y} 
                stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" 
              />
              
              {/* Pickup Marker */}
              <circle cx={mapCoords.pickup.x} cy={mapCoords.pickup.y} r="3" fill="#22C55E" className="animate-pulse" />
              <text x={mapCoords.pickup.x} y={mapCoords.pickup.y - 6} fontSize="4" fontWeight="900" textAnchor="middle" fill="#22C55E">PICKUP</text>
              
              {/* Drop Marker */}
              <rect x={mapCoords.drop.x - 2.5} y={mapCoords.drop.y - 2.5} width="5" height="5" fill="#EF4444" />
              <text x={mapCoords.drop.x} y={mapCoords.drop.y - 6} fontSize="4" fontWeight="900" textAnchor="middle" fill="#EF4444">DROP</text>

              {/* Live Car/Bike Marker */}
              <g transform={`translate(${mapCoords.car.x}, ${mapCoords.car.y}) rotate(${location.bearing})`}>
                <rect x="-4" y="-2" width="8" height="4" rx="1" fill={theme.color === 'bg-black' ? '#000' : '#FACC15'} className="shadow-lg" />
                <rect x="2" y="-1.5" width="1.5" height="3" fill="#FFF" opacity="0.5" />
              </g>
              <circle cx={mapCoords.car.x} cy={mapCoords.car.y} r="8" fill="indigo" opacity="0.1" className="animate-ping" />
           </svg>

           <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Connected to provider GPS</span>
              </div>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">Live</span>
           </div>
        </div>

        {/* Driver Details Card */}
        <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 mb-6">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                 <div className="relative">
                    <div className="w-20 h-20 bg-gray-100 rounded-[32px] overflow-hidden border-4 border-white shadow-md">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.driverName}`} alt="Driver" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-lg border-2 border-white shadow-sm">
                       ★ {booking.driverRating?.toFixed(1)}
                    </div>
                 </div>
                 <div>
                    <h4 className="font-black text-xl text-gray-900 mb-1">{booking.driverName}</h4>
                    {/* Fixed: changed rideProvider to provider to match Booking interface */}
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{booking.provider} Partner</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Share OTP</p>
                 <div className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-2xl font-black tracking-[0.2em] shadow-lg shadow-indigo-100">{booking.otp}</div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-[28px] border border-gray-100">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle</p>
                 <p className="text-sm font-black text-gray-900 leading-none">{booking.vehicleNumber}</p>
                 <p className="text-[10px] font-bold text-gray-400 mt-1">{booking.rideName}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-[28px] border border-gray-100 flex items-center justify-center">
                 <img src={theme.logo} alt={booking.provider} className="h-8 w-auto object-contain opacity-80" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <button className="py-5 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-gray-900/10">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                 Call Driver
              </button>
              <button className="py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                 Chat
              </button>
           </div>
        </div>

        {/* Safety Banner */}
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex items-center gap-4">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
           </div>
           <div>
              <p className="text-[11px] font-black text-indigo-900 uppercase tracking-widest mb-0.5">Safety Shield Active</p>
              <p className="text-xs font-bold text-indigo-700/70">Your ride is being monitored for safety.</p>
           </div>
        </div>

        {status === RideStatus.CONFIRMED || status === RideStatus.ARRIVING ? (
          <button 
            onClick={onComplete}
            className="w-full mt-8 py-5 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-red-500 hover:bg-red-50 rounded-3xl transition-all"
          >
            Cancel Ride
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ActiveRideStatus;
