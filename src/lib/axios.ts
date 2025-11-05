import axios from "axios";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  withXSRFToken: true,
});

export default api;