import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject Clerk JWT Authorization header on the client-side
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const clerk = (window as any).Clerk;
      if (clerk?.session) {
        try {
          const token = await clerk.session.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (err) {
          console.error("Error retrieving Clerk session token:", err);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log API errors globally
    console.error("API Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
