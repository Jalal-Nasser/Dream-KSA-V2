// config/api.js
// Single unified server configuration
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.9:3001'  // Development - main backend server
  : 'https://your-server-deployment.railway.app'; // Production - deployed server

export { API_BASE_URL };
