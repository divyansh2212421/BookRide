
import React, { useEffect, useState } from 'react';
import { Booking, RideStatus } from '../types';
import { subscribeToRideStatus } from '../services/bookingService';
import { PROVIDER_THEMES } from '../constants';

interface ActiveRideStatusProps {
  booking: Booking;
  onComplete: () => void;
}

const ActiveRideStatus: React.FC<ActiveRideStatusProps> = ({ booking, onComplete }) => {
  const [status, setStatus] = useState<RideStatus>(booking.status);
  const theme = PROVIDER_THEMES[booking.provider];

  useEffect(() => {
    subscribeToRideStatus(booking, (newStatus) => {
      setStatus(newStatus);
      if (newStatus === RideStatus.COMPLETED) {
        setTimeout(onComplete, 3000);
      }
    });
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

  return (
    <div className="fixed inset-0 bg-[#F9FAFB] z-[120] flex flex-col animate-in slide-in-from-right">
      <header className="bg-gray-900 pt-12 pb-24 px-8 text-white relative">
        <h2 className="text-3xl font-black tracking-tight mb-2">Tracking Ride</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{getStatusLabel(status)}</p>
        </div>
      </header>

      <div className="flex-1 -mt-12 px-6">
        {/* Map Placeholder */}
        <div className="bg-gray-200 w-full h-48 rounded-[40px] mb-6 flex items-center justify-center relative overflow-hidden shadow-inner border-4 border-white">
           <div className="absolute inset-0 opacity-40 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i14!2i9408!3i6039!2m3!1e0!2sm!3i407105151!3m17!2sen!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m3!1e35!2m1!1s1e10!4e0!5m1!5f2!23i1301875')] bg-cover"></div>
           <div className="relative z-10 text-gray-500 font-black uppercase text-xs tracking-tighter bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm">Live Tracking Enabled</div>
        </div>

        {/* Driver Card */}
        <div className="bg-white rounded-[40px] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 mb-6">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-gray-100 rounded-3xl overflow-hidden border-2 border-white shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.driverName}`} alt="Driver" />
                 </div>
                 <div>
                    <h4 className="font-black text-lg text-gray-900">{booking.driverName}</h4>
                    <div className="flex items-center gap-1">
                       <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                       <span className="text-xs font-bold text-gray-500">{booking.driverRating?.toFixed(1)}</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">OTP</p>
                 <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl text-lg font-black tracking-widest border border-indigo-100">{booking.otp}</div>
              </div>
           </div>

           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl mb-6">
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicle</p>
                 <p className="text-sm font-black text-gray-900">{booking.vehicleNumber}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${theme.border} bg-white shadow-sm`}>
                 <img src={theme.logo} alt={booking.provider} className="w-6 h-6 object-contain" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <button className="py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                 Call
              </button>
              <button className="py-4 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                 Chat
              </button>
           </div>
        </div>

        {/* Cancel Button */}
        {status === RideStatus.CONFIRMED || status === RideStatus.ARRIVING ? (
          <button 
            onClick={onComplete}
            className="w-full py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
          >
            Cancel Ride
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ActiveRideStatus;
