
import React from 'react';
import { RideEstimate, Location, RideProvider } from '../types';
import { PROVIDER_THEMES } from '../constants';
import { getProviderWebUrl } from '../services/redirectionService';

interface BookingRedirectModalProps {
  ride: RideEstimate;
  pickup: Location;
  drop: Location;
  onClose: () => void;
}

const BookingRedirectModal: React.FC<BookingRedirectModalProps> = ({ ride, pickup, drop, onClose }) => {
  const theme = PROVIDER_THEMES[ride.provider];
  const webUrl = getProviderWebUrl(ride.provider, ride, pickup, drop);

  const handleRedirect = () => {
    // Log the redirection event for analytics
    console.log(`Redirecting user to ${ride.provider} for ${ride.name}`);
    window.open(webUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl mx-auto -mt-16 mb-6 ${theme.color}`}>
              <img src={theme.logo} alt={ride.provider} className="w-12 h-12 object-contain" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Redirecting to {ride.provider}</h3>
            <p className="text-sm text-gray-500 font-medium px-4 leading-relaxed">
              We are moving you to the official {ride.provider} website to complete your booking securely.
            </p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-5 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Ride</span>
              <span className="text-sm font-black text-gray-900">{ride.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimated Fare</span>
              <span className="text-xl font-black text-indigo-600">₹{ride.price}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleRedirect}
              className={`w-full py-5 rounded-[24px] font-black text-sm tracking-[0.2em] uppercase transition-all shadow-xl flex items-center justify-center gap-3 ${theme.color} ${theme.textColor} shadow-indigo-500/20 active:scale-95`}
            >
              Continue to {ride.provider}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3 px-6 py-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
             <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
             <p className="text-[10px] text-blue-700 font-bold leading-tight">
               Your location details are pre-filled on the provider's site for a faster checkout.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRedirectModal;
