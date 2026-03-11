import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const baseURL = rawBaseUrl.trim().replace(/\/+$/, "");

const API = axios.create({
  baseURL,
});

export default API;