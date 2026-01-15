
import React, { useState } from 'react';
import { RideEstimate, Location, Booking, RideProvider } from '../types';
import { createBooking } from '../services/bookingService';
import { PROVIDER_THEMES } from '../constants';

interface BookingModalProps {
  ride: RideEstimate;
  pickup: Location;
  drop: Location;
  onSuccess: (booking: Booking) => void;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ ride, pickup, drop, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = PROVIDER_THEMES[ride.provider];

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const booking = await createBooking(ride, pickup, drop);
      onSuccess(booking);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border p-2 ${theme.border}`}>
                 <img src={theme.logo} alt={ride.provider} className="w-full h-full object-contain" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-gray-900">{ride.provider} {ride.name}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{ride.category}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
               <div className="flex items-start gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Pickup</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{pickup.address}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-sm bg-red-500 mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Destination</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{drop.address}</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between px-2">
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Estimated Fare</p>
                  <p className="text-3xl font-black text-gray-900">₹{ride.price}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase">Arrival</p>
                  <p className="text-xl font-black text-indigo-600">{ride.eta} mins</p>
               </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                     <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V12h16v6zm0-10H4V6h16v2z"/></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Personal Card **** 4242</span>
               </div>
               <button className="text-indigo-600 text-xs font-black uppercase tracking-widest">Change</button>
            </div>

            <button 
              onClick={handleConfirm}
              disabled={loading}
              className={`w-full py-5 rounded-[24px] font-black text-sm tracking-[0.2em] uppercase transition-all shadow-xl flex items-center justify-center gap-3 ${theme.color} ${theme.textColor} shadow-indigo-500/20 active:scale-95 disabled:opacity-50`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>Confirm Booking</>
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center font-bold px-4">
              By confirming, you agree to RideCompare's Terms of Service and Provider's Booking Policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
