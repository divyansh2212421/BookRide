
import { RideHistoryItem, User } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'ride_compare_history',
  USER: 'ride_compare_user',
  TOKEN: 'ride_compare_token'
};

export const saveRideToHistory = (item: RideHistoryItem) => {
  const history = getRideHistory();
  const updated = [item, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
};

export const getRideHistory = (): RideHistoryItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const saveUserSession = (user: User, token: string) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

export const getUserSession = (): { user: User | null; token: string | null } => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    user: user ? JSON.parse(user) : null,
    token
  };
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};
