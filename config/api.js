// config/api.js
// Single unified server configuration
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.9:3001'  // Development - local server
  : 'https://your-app-name.railway.app'; // Production - Railway deployment (UPDATE THIS URL)

export { API_BASE_URL };
