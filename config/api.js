// config/api.js
// Single unified server configuration
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.9:3001'  // Development - local server
  : 'https://dreams-ksa-backend-production.up.railway.app'; // Production - Railway deployment

export { API_BASE_URL };
