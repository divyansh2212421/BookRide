
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import SearchPanel from './components/SearchPanel';
import RideCard from './components/RideCard';
import ChatAssistant from './components/ChatAssistant';
import AuthModal from './components/AuthModal';
import HistoryPanel from './components/HistoryPanel';
import BookingModal from './components/BookingModal';
import ActiveRideStatus from './components/ActiveRideStatus';
import { Location, RideEstimate, AIInsight, RideCategory, User, RideHistoryItem, Booking } from './types';
import { fetchRideEstimates } from './services/rideEstimator';
import { getSmartInsights } from './services/geminiService';
import { getUserSession, saveRideToHistory, getRideHistory, clearSession } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState<RideEstimate[]>([]);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [activeTab, setActiveTab] = useState<RideCategory | 'All'>('All');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RideHistoryItem[]>([]);
  
  // Direct Booking States
  const [selectedRide, setSelectedRide] = useState<RideEstimate | null>(null);
  const [pickupData, setPickupData] = useState<Location | null>(null);
  const [dropData, setDropData] = useState<Location | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const { user: savedUser } = getUserSession();
    if (savedUser) setUser(savedUser);
    setHistory(getRideHistory());
  }, []);

  const handleSearch = useCallback(async (pickup: Location, drop: Location) => {
    setLoading(true);
    setError(null);
    setInsights(null);
    setPickupData(pickup);
    setDropData(drop);
    try {
      const results = await fetchRideEstimates(pickup, drop);
      setEstimates(results);
      
      const historyItem: RideHistoryItem = {
        id: `h-${Date.now()}`,
        timestamp: Date.now(),
        pickup,
        drop
      };
      saveRideToHistory(historyItem);
      setHistory(getRideHistory());

      getSmartInsights(results).then(setInsights).catch(console.error);
    } catch (err) {
      setError("Failed to fetch ride estimates. Market might be too busy.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredEstimates = useMemo(() => {
    let list = [...estimates];
    if (activeTab !== 'All') {
      list = list.filter(e => e.category === activeTab);
    }
    return list.sort((a, b) => a.price - b.price);
  }, [estimates, activeTab]);

  const stats = useMemo(() => {
    if (estimates.length === 0) return null;
    const sortedByPrice = [...estimates].sort((a, b) => a.price - b.price);
    const sortedByTime = [...estimates].sort((a, b) => (a.eta + a.travelTime) - (b.eta + b.travelTime));
    
    const avgPrice = estimates.reduce((acc, curr) => acc + curr.price, 0) / estimates.length;
    const avgTime = estimates.reduce((acc, curr) => acc + (curr.eta + curr.travelTime), 0) / estimates.length;
    
    const bestValue = [...estimates].sort((a, b) => {
      const valA = (a.price / avgPrice) + ((a.eta + a.travelTime) / avgTime);
      const valB = (b.price / avgPrice) + ((b.eta + b.travelTime) / avgTime);
      return valA - valB;
    })[0];

    return {
      cheapest: sortedByPrice[0],
      fastest: sortedByTime[0],
      bestValue
    };
  }, [estimates]);

  const handleRideSelect = (ride: RideEstimate) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setSelectedRide(ride);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-gray-900 pt-10 pb-16 px-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black">R</div>
              <h1 className="text-2xl font-black tracking-tighter">RideCompare</h1>
            </div>
            <p className="text-gray-400 text-[11px] font-medium uppercase tracking-widest">
              India's #1 Mobility Aggregator
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(true)}
              className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
            {user ? (
              <button 
                onClick={() => { clearSession(); setUser(null); }}
                className="flex items-center gap-2 p-1.5 pr-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-sm uppercase">
                  {user.name?.[0] || 'U'}
                </div>
                <span className="text-xs font-bold text-gray-300">Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#F9FAFB] to-transparent"></div>
      </header>

      {/* Main UI */}
      <SearchPanel onSearch={handleSearch} isLoading={loading} />

      <main className="px-5 mt-8 max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-3xl border border-red-100 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            </div>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* AI Insight Bar */}
        {insights && (
          <div className="bg-white rounded-3xl p-5 mb-8 border border-gray-100 shadow-sm relative group overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
             <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div className="space-y-1">
                   <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Market IQ</h4>
                   <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {insights.summary} <span className="text-indigo-600 font-bold">{insights.recommendation}</span>
                   </p>
                   <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-green-50 text-[10px] font-bold text-green-700 rounded-lg">Pro Tip: {insights.savingTip}</span>
                      <span className="px-2 py-1 bg-amber-50 text-[10px] font-bold text-amber-700 rounded-lg">Trend: {insights.surgePrediction}</span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {estimates.length > 0 && (
          <div className="sticky top-4 z-20 mb-6 py-1 bg-[#F9FAFB]/80 backdrop-blur-md">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {['All', RideCategory.BIKE, RideCategory.AUTO, RideCategory.CAB].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 rounded-2xl whitespace-nowrap text-xs font-black transition-all border-2 ${
                    activeTab === tab 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200' 
                    : 'bg-white text-gray-400 border-white hover:border-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredEstimates.map(ride => (
            <div key={ride.id} onClick={() => handleRideSelect(ride)}>
              <RideCard 
                ride={ride} 
                isCheapest={ride.id === stats?.cheapest.id}
                isFastest={ride.id === stats?.fastest.id}
                isBest={ride.id === stats?.bestValue.id}
              />
            </div>
          ))}

          {!loading && estimates.length === 0 && (
            <div className="text-center py-24">
               <div className="w-32 h-32 bg-white rounded-[40px] shadow-xl shadow-gray-100 border border-gray-50 flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               </div>
               <h3 className="text-xl font-black text-gray-900">Where are we going?</h3>
               <p className="text-gray-400 text-sm mt-2 max-w-[200px] mx-auto font-medium">Compare fares across Uber, Ola and Rapido instantly.</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Elements */}
      <ChatAssistant currentEstimates={estimates} />
      {showAuth && <AuthModal onSuccess={(u) => { setUser(u); setShowAuth(false); }} onClose={() => setShowAuth(false)} />}
      {showHistory && <HistoryPanel history={history} onSelect={(p, d) => { handleSearch(p, d); setShowHistory(false); }} onClose={() => setShowHistory(false)} />}
      
      {/* Booking Modal */}
      {selectedRide && pickupData && dropData && (
        <BookingModal 
          ride={selectedRide} 
          pickup={pickupData} 
          drop={dropData} 
          onSuccess={(b) => { setActiveBooking(b); setSelectedRide(null); }}
          onClose={() => setSelectedRide(null)}
        />
      )}

      {/* Active Ride Status View */}
      {activeBooking && (
        <ActiveRideStatus 
          booking={activeBooking} 
          onComplete={() => setActiveBooking(null)} 
        />
      )}

      <footer className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none flex justify-center">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 text-white/40 text-[9px] font-bold px-4 py-2.5 rounded-2xl pointer-events-auto tracking-widest uppercase shadow-2xl">
          Verified Pricing • 1.2s Latency • Secured Redirection
        </div>
      </footer>
    </div>
  );
};

export default App;
