import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5005/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export function errorMessage(error) {
  return error?.response?.data?.message || "Something went wrong. Please try again.";
}

export default api;