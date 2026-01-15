
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import SearchPanel from './components/SearchPanel';
import RideCard from './components/RideCard';
import ChatAssistant from './components/ChatAssistant';
import AuthModal from './components/AuthModal';
import HistoryPanel from './components/HistoryPanel';
import BookingRedirectModal from './components/BookingRedirectModal';
import { Location, RideEstimate, AIInsight, RideCategory, User, RideHistoryItem } from './types';
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
  
  // Search state
  const [pickupData, setPickupData] = useState<Location | null>(null);
  const [dropData, setDropData] = useState<Location | null>(null);

  // Redirection state
  const [redirectRide, setRedirectRide] = useState<RideEstimate | null>(null);

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
    setRedirectRide(ride);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-gray-900 pt-10 pb-16 px-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black shadow-xl shadow-indigo-500/20">R</div>
             <div>
                <h1 className="text-2xl font-black tracking-tighter">RideWise</h1>
                <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">Verified Marketplace</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHistory(true)}
              className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
            {user ? (
              <button 
                onClick={() => { clearSession(); setUser(null); }}
                className="flex items-center gap-2 p-1.5 pr-4 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-sm uppercase">
                  {user.name?.[0] || 'U'}
                </div>
                <span className="text-xs font-bold text-gray-300">Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                className="px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F9FAFB] to-transparent"></div>
      </header>

      {/* Main UI */}
      <SearchPanel onSearch={handleSearch} isLoading={loading} />

      <main className="px-5 mt-12 max-w-3xl mx-auto">
        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-[32px] border border-red-100 mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            </div>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* AI Insight Bar */}
        {insights && (
          <div className="bg-white rounded-[40px] p-6 mb-10 border border-gray-100 shadow-xl shadow-gray-200/20 relative group overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50 transition-opacity group-hover:opacity-100"></div>
             <div className="flex items-start gap-5 relative z-10">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-indigo-100">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div className="space-y-2">
                   <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.3em]">Smart Analysis</h4>
                   <p className="text-base text-gray-700 leading-relaxed font-bold">
                      {insights.summary} <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">{insights.recommendation}</span>
                   </p>
                   <div className="flex flex-wrap gap-3 mt-3">
                      <div className="px-3 py-1.5 bg-green-50 text-[10px] font-black text-green-700 rounded-xl border border-green-100/50 uppercase tracking-wider flex items-center gap-1.5">
                         <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                         Saving Tip: {insights.savingTip}
                      </div>
                      <div className="px-3 py-1.5 bg-amber-50 text-[10px] font-black text-amber-700 rounded-xl border border-amber-100/50 uppercase tracking-wider flex items-center gap-1.5">
                         <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                         Surge Trend: {insights.surgePrediction}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {estimates.length > 0 && (
          <div className="sticky top-6 z-20 mb-8 py-2 bg-[#F9FAFB]/90 backdrop-blur-2xl">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {['All', RideCategory.BIKE, RideCategory.AUTO, RideCategory.CAB].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-8 py-3.5 rounded-2xl whitespace-nowrap text-xs font-black transition-all border-2 uppercase tracking-widest ${
                    activeTab === tab 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-2xl shadow-gray-400/20' 
                    : 'bg-white text-gray-400 border-white hover:border-gray-100 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {filteredEstimates.map(ride => (
            <div key={ride.id} onClick={() => handleRideSelect(ride)} className="cursor-pointer">
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
               <div className="w-40 h-40 bg-white rounded-[56px] shadow-2xl shadow-gray-200/50 border border-gray-50 flex items-center justify-center mx-auto mb-10 group relative">
                  <div className="absolute inset-4 rounded-[40px] border-2 border-dashed border-gray-100 animate-[spin_10s_linear_infinite]"></div>
                  <svg className="w-16 h-16 text-gray-200 group-hover:text-indigo-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               </div>
               <h3 className="text-2xl font-black text-gray-900">Compare in seconds.</h3>
               <p className="text-gray-400 text-sm mt-3 max-w-[280px] mx-auto font-bold leading-relaxed">Enter your route above to find the best deals from India's top providers.</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Elements */}
      <ChatAssistant currentEstimates={estimates} />
      {showAuth && <AuthModal onSuccess={(u) => { setUser(u); setShowAuth(false); }} onClose={() => setShowAuth(false)} />}
      {showHistory && <HistoryPanel history={history} onSelect={(p, d) => { handleSearch(p, d); setShowHistory(false); }} onClose={() => setShowHistory(false)} />}
      
      {/* Redirection Modal */}
      {redirectRide && pickupData && dropData && (
        <BookingRedirectModal 
          ride={redirectRide}
          pickup={pickupData}
          drop={dropData}
          onClose={() => setRedirectRide(null)}
        />
      )}

      <footer className="mt-20 py-12 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-4">
           <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white">R</div>
              <span className="text-sm font-black text-gray-900 tracking-tighter">RideWise</span>
           </div>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
             © 2025 RideWise Mobility Engine. Pricing data is estimated based on public tariffs. 
             Final fare may vary on the provider's platform. We do not provide rides directly.
           </p>
           <div className="flex items-center justify-center gap-6 pt-4">
              <a href="#" className="text-[9px] font-black text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Privacy</a>
              <a href="#" className="text-[9px] font-black text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Terms</a>
              <a href="#" className="text-[9px] font-black text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Support</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
