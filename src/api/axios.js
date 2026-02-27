import axios from 'axios';

const api = axios.create({
  baseURL: "https://authentication-api-52878f3a16c3.herokuapp.com/api",
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  // Do NOT set a default Content-Type here — axios sets it correctly per request:
  //   JSON body   → application/json (automatic for plain objects)
  //   FormData    → multipart/form-data; boundary=... (automatic for FormData)
});

export default api;