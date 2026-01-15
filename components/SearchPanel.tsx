
import React, { useState, useEffect, useRef } from 'react';
import { Location, LocationSuggestion } from '../types';
import { getLocationSuggestions, reverseGeocode } from '../services/locationService';

interface SearchPanelProps {
  onSearch: (pickup: Location, drop: Location) => void;
  isLoading: boolean;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, isLoading }) => {
  const [pickup, setPickup] = useState('Indiranagar, Bangalore');
  const [pickupData, setPickupData] = useState<Location | null>({ address: 'Indiranagar, Bangalore', lat: 12.9716, lng: 77.5946 });
  const [drop, setDrop] = useState('');
  const [dropData, setDropData] = useState<Location | null>(null);

  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<LocationSuggestion[]>([]);
  
  const [isPickupLoading, setIsPickupLoading] = useState(false);
  const [isDropLoading, setIsDropLoading] = useState(false);
  
  const [activeInput, setActiveInput] = useState<'pickup' | 'drop' | null>(null);
  
  const debounceTimer = useRef<number | null>(null);

  const handleInputChange = (val: string, type: 'pickup' | 'drop') => {
    if (type === 'pickup') {
      setPickup(val);
      setIsPickupLoading(true);
    } else {
      setDrop(val);
      setIsDropLoading(true);
    }
    setActiveInput(type);

    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    
    if (val.length < 3) {
      if (type === 'pickup') {
        setPickupSuggestions([]);
        setIsPickupLoading(false);
      } else {
        setDropSuggestions([]);
        setIsDropLoading(false);
      }
      return;
    }

    debounceTimer.current = window.setTimeout(async () => {
      const results = await getLocationSuggestions(val);
      if (type === 'pickup') {
        setPickupSuggestions(results);
        setIsPickupLoading(false);
      } else {
        setDropSuggestions(results);
        setIsDropLoading(false);
      }
    }, 500);
  };

  const selectSuggestion = (s: LocationSuggestion, type: 'pickup' | 'drop') => {
    const loc: Location = {
      address: s.primaryText,
      secondaryAddress: s.secondaryText,
      lat: s.lat,
      lng: s.lng
    };

    if (type === 'pickup') {
      setPickup(s.primaryText);
      setPickupData(loc);
      setPickupSuggestions([]);
    } else {
      setDrop(s.primaryText);
      setDropData(loc);
      setDropSuggestions([]);
    }
    setActiveInput(null);
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsPickupLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const loc = await reverseGeocode(latitude, longitude);
        setPickup(loc.address);
        setPickupData(loc);
        setPickupSuggestions([]);
        setIsPickupLoading(false);
        setActiveInput(null);
      }, (error) => {
        setIsPickupLoading(false);
        alert("Location access denied or unavailable.");
      });
    }
  };

  const handleSearch = () => {
    if (pickupData && dropData) {
      onSearch(pickupData, dropData);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] p-8 shadow-2xl shadow-gray-200/50 -mt-10 mx-5 relative z-40 border border-white/50 max-w-2xl sm:mx-auto">
      <div className="space-y-6">
        {/* Pickup Input Group */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-green-500 bg-white z-10"></div>
          <div className="absolute left-[21px] top-1/2 w-[2px] h-14 bg-gray-100 group-focus-within:bg-indigo-200 transition-colors"></div>
          <input 
            type="text" 
            value={pickup}
            onChange={(e) => handleInputChange(e.target.value, 'pickup')}
            onFocus={() => setActiveInput('pickup')}
            placeholder="Search Pickup Point"
            className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border-2 border-transparent rounded-[24px] focus:outline-none focus:border-indigo-500/20 focus:bg-white transition-all text-sm font-bold text-gray-800"
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPickupLoading && (
              <span className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
            )}
            <button 
              onClick={useCurrentLocation}
              className="p-2 hover:bg-white rounded-xl transition-colors text-indigo-500"
              title="Use Current Location"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
          </div>

          {activeInput === 'pickup' && pickupSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              {pickupSuggestions.map((s, i) => (
                <button 
                  key={i} 
                  onMouseDown={() => selectSuggestion(s, 'pickup')}
                  className="w-full px-6 py-4 hover:bg-gray-50 text-left flex items-start gap-3 border-b border-gray-50 last:border-none group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate">{s.primaryText}</p>
                    <p className="text-[11px] text-gray-400 truncate">{s.secondaryText}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Drop Input Group */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-sm border-2 border-red-500 bg-white z-10"></div>
          <input 
            type="text" 
            value={drop}
            onChange={(e) => handleInputChange(e.target.value, 'drop')}
            onFocus={() => setActiveInput('drop')}
            placeholder="Search Destination"
            className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border-2 border-transparent rounded-[24px] focus:outline-none focus:border-indigo-500/20 focus:bg-white transition-all text-sm font-bold text-gray-800"
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isDropLoading && (
              <span className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
            )}
          </div>

          {activeInput === 'drop' && dropSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              {dropSuggestions.map((s, i) => (
                <button 
                  key={i} 
                  onMouseDown={() => selectSuggestion(s, 'drop')}
                  className="w-full px-6 py-4 hover:bg-gray-50 text-left flex items-start gap-3 border-b border-gray-50 last:border-none group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate">{s.primaryText}</p>
                    <p className="text-[11px] text-gray-400 truncate">{s.secondaryText}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleSearch}
          disabled={isLoading || !dropData || !pickupData}
          className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black tracking-[0.2em] uppercase text-xs shadow-xl shadow-gray-900/10 hover:bg-black hover:shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex gap-1.5 items-center">
               <span className="w-2 h-2 bg-white/20 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-150"></span>
            </div>
          ) : (
            <>
              Compare Prices
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchPanel;
