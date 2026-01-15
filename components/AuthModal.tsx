
import React, { useState } from 'react';
import { User } from '../types';
import { saveUserSession } from '../services/storageService';

interface AuthModalProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      const mockUser: User = { id: 'u1', phoneNumber: phone, name: 'Power User' };
      saveUserSession(mockUser, 'mock-jwt-token');
      onSuccess(mockUser);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
          </div>
          <h2 className="text-2xl font-black mb-2">{step === 'phone' ? 'Welcome!' : 'Verify OTP'}</h2>
          <p className="text-gray-500 text-sm mb-8">
            {step === 'phone' ? 'Enter your phone number to compare & book rides.' : 'Enter the code sent to your mobile.'}
          </p>

          <div className="space-y-4">
            {step === 'phone' ? (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+91</span>
                <input 
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <input 
                type="text" 
                placeholder="0 0 0 0"
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-2xl font-bold tracking-[1em] text-center focus:ring-2 focus:ring-indigo-500"
              />
            )}

            <button 
              onClick={step === 'phone' ? handleSendOtp : handleVerify}
              disabled={loading || (step === 'phone' && phone.length < 10)}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {step === 'phone' ? 'Send OTP' : 'Login'}
            </button>
            
            <button onClick={onClose} className="text-gray-400 text-sm font-medium hover:text-gray-600">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
