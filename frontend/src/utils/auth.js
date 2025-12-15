import { auth } from '@/api/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Mimic Base44's auth API
export const base44Auth = {
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  },
  
  getCurrentUser: () => {
    return auth.currentUser;
  },
  
  requireAuth: () => {
    if (!auth.currentUser) {
      // Redirect to login or show login modal
      console.warn('User not authenticated');
      return false;
    }
    return true;
  }
};
