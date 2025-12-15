// Local replacements for Base44 entities using localStorage
const STORAGE_KEYS = {
  assignments: 'ethicalai_assignments',
  analyses: 'ethicalai_analyses',
  user: 'ethicalai_user'
};

// Simple in-memory store (could upgrade to Firestore later)
export const entities = {
  Assignment: {
    create: (data) => {
      const assignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.assignments) || '[]');
      const newAssignment = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString()
      };
      assignments.push(newAssignment);
      localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(assignments));
      return newAssignment;
    },
    
    findAll: () => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.assignments) || '[]');
    },
    
    findById: (id) => {
      const assignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.assignments) || '[]');
      return assignments.find(a => a.id === id);
    },
    
    update: (id, data) => {
      const assignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.assignments) || '[]');
      const index = assignments.findIndex(a => a.id === id);
      if (index !== -1) {
        assignments[index] = { ...assignments[index], ...data };
        localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(assignments));
        return assignments[index];
      }
      return null;
    },
    
    delete: (id) => {
      const assignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.assignments) || '[]');
      const filtered = assignments.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(filtered));
      return true;
    }
  },

  Analysis: {
    create: (data) => {
      const analyses = JSON.parse(localStorage.getItem(STORAGE_KEYS.analyses) || '[]');
      const newAnalysis = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString()
      };
      analyses.push(newAnalysis);
      localStorage.setItem(STORAGE_KEYS.analyses, JSON.stringify(analyses));
      return newAnalysis;
    },
    
    findAll: () => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.analyses) || '[]');
    },
    
    findById: (id) => {
      const analyses = JSON.parse(localStorage.getItem(STORAGE_KEYS.analyses) || '[]');
      return analyses.find(a => a.id === id);
    }
  }
};
