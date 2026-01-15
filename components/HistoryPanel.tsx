
import React from 'react';
import { RideHistoryItem, Location } from '../types';

interface HistoryPanelProps {
  history: RideHistoryItem[];
  onSelect: (pickup: Location, drop: Location) => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right">
      <header className="p-6 border-b border-gray-100 flex items-center gap-4">
        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h2 className="text-xl font-black">Ride History</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No past rides found. <br/> Your searches will appear here.
          </div>
        ) : (
          history.map(item => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item.pickup, item.drop)}
              className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                {item.price && <span className="text-sm font-bold">₹{item.price}</span>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium text-gray-600 truncate">{item.pickup.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-red-500"></div>
                  <p className="text-sm font-bold text-gray-900 truncate">{item.drop.address}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  {item.selectedProvider && (
                    <span className="px-2 py-0.5 bg-gray-200 text-[10px] font-bold rounded uppercase">{item.selectedProvider}</span>
                  )}
                  {item.selectedCategory && (
                    <span className="px-2 py-0.5 bg-gray-200 text-[10px] font-bold rounded uppercase">{item.selectedCategory}</span>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
