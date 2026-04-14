import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json"
  }
});


// Attach JWT token automatically
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});


// Handle expired / invalid token
api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response && error.response.status === 401) {

      console.log("Token expired. Redirecting to login...");

      localStorage.removeItem("token");

      window.location.href = "/login";

    }

    return Promise.reject(error);

  }

);

export default api;