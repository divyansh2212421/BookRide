
import React from 'react';
import { RideEstimate, RideProvider } from '../types';
import { PROVIDER_THEMES } from '../constants';

interface RideCardProps {
  ride: RideEstimate;
  isBest?: boolean;
  isFastest?: boolean;
  isCheapest?: boolean;
}

const RideCard: React.FC<RideCardProps> = ({ ride, isBest, isFastest, isCheapest }) => {
  const theme = PROVIDER_THEMES[ride.provider];

  return (
    <div className={`relative bg-white rounded-[32px] p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group ${isBest ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-transparent'}`}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border p-2 shadow-sm ${theme.border} group-hover:scale-110 transition-transform`}>
            <img src={theme.logo} alt={ride.provider} className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h3 className="font-black text-gray-900 text-lg leading-none">{ride.provider}</h3>
               <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-lg uppercase tracking-wider">{ride.name}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
               {ride.features?.map((f, i) => (
                 <span key={i} className="text-[10px] font-bold text-gray-400">• {f}</span>
               ))}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
             <span className="text-[12px] font-bold text-gray-400">₹</span>
             <p className="text-2xl font-black text-gray-900 tracking-tighter">{ride.price}</p>
          </div>
          {ride.surge && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-lg">
               <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l1.5 4.5h4.75l-3.75 3 1.5 4.5-3.75-3-3.75 3 1.5-4.5-3.75-3h4.75L10 2z"/></svg>
               <span className="text-[10px] font-black uppercase tracking-widest">{ride.surgeMultiplier}x Surge</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Arrival</p>
           <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-sm font-black text-gray-800">{ride.eta} min</span>
           </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trip Time</p>
           <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              <span className="text-sm font-black text-gray-800">{ride.travelTime} min</span>
           </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {isCheapest && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100">Best Price</span>}
        {isFastest && <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100">Quickest</span>}
        {isBest && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-100">Smart Choice</span>}
      </div>

      <button 
        onClick={() => window.open(ride.deepLink, '_blank')}
        className={`w-full py-4 rounded-[20px] font-black text-sm tracking-widest uppercase transition-all duration-300 shadow-lg active:scale-95 flex items-center justify-center gap-3 ${theme.color} ${theme.textColor} shadow-indigo-500/10 group-hover:shadow-indigo-500/30 group-hover:-translate-y-1`}
      >
        Book on {ride.provider}
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
      </button>
    </div>
  );
};

export default RideCard;
