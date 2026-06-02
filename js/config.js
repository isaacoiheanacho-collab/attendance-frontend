const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE = isLocal 
  ? 'http://localhost:4000/api/v1'
  : 'https://attendance-app-backend-degc.onrender.com/api/v1';