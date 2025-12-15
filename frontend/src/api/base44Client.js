import { auth } from './firebase';
import { entities } from './entities';

export const base44 = {
  auth: {
    onAuthStateChanged: (callback) => {
      return auth.onAuthStateChanged(callback);
    },
    
    currentUser: () => auth.currentUser,
    
    requireAuth: () => !!auth.currentUser,
    
    // Add the missing 'me' method
    me: async () => {
      const user = auth.currentUser;
      if (!user) return null;
      
      return {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL,
      };
    }
  },

  // Add entities with list methods
  entities: {
    Assignment: {
      list: async () => {
        return await entities.Assignment.findAll();
      },
      get: async (id) => {
        return await entities.Assignment.findById(id);
      },
      create: async (data) => {
        return await entities.Assignment.create(data);
      },
      update: async (id, data) => {
        return await entities.Assignment.update(id, data);
      },
      delete: async (id) => {
        return await entities.Assignment.delete(id);
      }
    },
    
    Analysis: {
      list: async () => {
        return await entities.Analysis.findAll();
      },
      get: async (id) => {
        return await entities.Analysis.findById(id);
      },
      create: async (data) => {
        return await entities.Analysis.create(data);
      }
    }
  },

  integrations: {}
};
