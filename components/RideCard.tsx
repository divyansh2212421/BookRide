
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
    <div className={`relative bg-white rounded-[40px] p-8 shadow-sm border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 group ${isBest ? 'border-indigo-500 ring-8 ring-indigo-500/5' : 'border-transparent'}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center overflow-hidden border-2 p-3 shadow-lg ${theme.border} group-hover:scale-110 transition-transform bg-white`}>
            <img src={theme.logo} alt={ride.provider} className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-3">
               <h3 className="font-black text-gray-900 text-xl leading-none">{ride.provider}</h3>
               <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-500 rounded-xl uppercase tracking-widest">{ride.name}</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
               {ride.features?.map((f, i) => (
                 <span key={i} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100/50">{f}</span>
               ))}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1.5">
             <span className="text-sm font-black text-indigo-400">₹</span>
             <p className="text-3xl font-black text-gray-900 tracking-tighter">{ride.price}</p>
          </div>
          {ride.surge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 mt-2">
               <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l1.5 4.5h4.75l-3.75 3 1.5 4.5-3.75-3-3.75 3 1.5-4.5-3.75-3h4.75L10 2z"/></svg>
               <span className="text-[10px] font-black uppercase tracking-[0.1em]">{ride.surgeMultiplier}x Surge</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <div className="bg-gray-50/80 p-4 rounded-3xl border border-gray-100/50 flex items-center gap-4">
           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           </div>
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">ETA</p>
              <span className="text-sm font-black text-gray-800">{ride.eta} mins</span>
           </div>
        </div>
        <div className="bg-gray-50/80 p-4 rounded-3xl border border-gray-100/50 flex items-center gap-4">
           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
           </div>
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Duration</p>
              <span className="text-sm font-black text-gray-800">{ride.travelTime} mins</span>
           </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {isCheapest && <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100">Lowest Fare</span>}
        {isFastest && <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100">Fastest Pick</span>}
        {isBest && <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-100">Smart Choice</span>}
      </div>

      <button 
        className={`w-full py-5 rounded-[24px] font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${theme.color} ${theme.textColor} shadow-indigo-500/10 group-hover:shadow-indigo-500/30 group-hover:-translate-y-1`}
      >
        Select {ride.provider}
        <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
      </button>
    </div>
  );
};

export default RideCard;
