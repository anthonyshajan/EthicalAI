import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  checkAI: async (text) => {
    const response = await axios.post(`${API_URL}/check-ai`, { text });
    return response.data;
  },

  chat: async (message, conversationHistory = []) => {
    const response = await axios.post(`${API_URL}/chat`, {
      message,
      conversation_history: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });
    return response.data;
  },

  uploadAssignment: async (formData) => {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  analyze: async (data) => {
    const response = await axios.post(`${API_URL}/analyze`, data);
    return response.data;
  }
};
