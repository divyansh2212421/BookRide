
import { PaymentStatus } from '../types';

export const processPayment = async (amount: number): Promise<{ success: boolean; transactionId: string }> => {
  // Simulate network delay for payment gateway (e.g., Razorpay/Stripe)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 95% success rate simulation
  const success = Math.random() > 0.05;
  return {
    success,
    transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`
  };
};
