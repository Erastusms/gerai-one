import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 Unauthorized and not already on /login page, clear session if needed
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)
