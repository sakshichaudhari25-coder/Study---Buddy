import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = (configuredApiUrl || "/api").replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.config?.requiresAuth &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("studybuddy:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallbackMessage) {
  if (error.code === "ERR_CANCELED") {
    return "";
  }

  if (!error.response) {
    return "Could not connect to StudyBuddy. Check that the backend is running and VITE_API_URL is correct.";
  }

  if (error.response.status === 429) {
    return error.response.data?.message || "Too many attempts. Please wait and try again.";
  }

  if (error.response.status >= 500) {
    return "The server could not complete your request. Please try again later.";
  }

  const responseMessage = error.response.data?.message;
  return typeof responseMessage === "string" ? responseMessage : fallbackMessage;
}

export default apiClient;
