import axios from "axios";

interface ClerkSession {
	getToken(): Promise<string | null>;
}

interface ClerkGlobal {
	session: ClerkSession;
}

declare global {
	interface Window {
		Clerk?: ClerkGlobal;
	}
}

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

const getAuthToken = async (): Promise<string | null> => {
	try {
		if (typeof window !== 'undefined' && window.Clerk?.session) {
			const token = await window.Clerk.session.getToken();
			return token;
		}
		return null;
	} catch (error) {
		console.warn("Failed to get auth token:", error);
		return null;
	}
};

api.interceptors.request.use(
	async (config) => {
		try {
			// Only wait if Clerk is not yet available
			if (typeof window !== 'undefined' && !window.Clerk?.session) {
				// Wait a bit for Clerk to initialize, but don't wait too long
				await new Promise(resolve => setTimeout(resolve, 500));
			}
			
			const token = await getAuthToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		} catch (error) {
			// Don't throw - just log and continue without token
			// The server will handle authentication errors
			console.warn("Error setting auth token:", error);
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Handle network errors (CORS, connection refused, etc.)
		if (!error.response) {
			const message = error.message || "Network error";
			console.error("Network error:", message);
			return Promise.reject(new Error(message));
		}

		// Handle HTTP errors
		const status = error.response.status;
		const data = error.response.data;

		if (status === 401) {
			return Promise.reject(new Error(data?.message || "Authentication required"));
		}

		if (status === 403) {
			return Promise.reject(new Error(data?.message || "Access forbidden"));
		}

		if (status === 404) {
			return Promise.reject(new Error(data?.message || "Resource not found"));
		}

		if (status === 503) {
			return Promise.reject(new Error(data?.message || "Service temporarily unavailable"));
		}

		// For other errors, use the error message from the server or a generic message
		const message = data?.message || data?.error || `Request failed with status ${status}`;
		return Promise.reject(new Error(message));
	}
);

export default api;