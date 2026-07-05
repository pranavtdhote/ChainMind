const isProd = process.env.NODE_ENV === "production";
const api_url = process.env.NEXT_PUBLIC_API_URL;

if (isProd && !api_url) {
  throw new Error("CRITICAL: NEXT_PUBLIC_API_URL environment variable is missing in production!");
}

export const API_URL = api_url || "http://localhost:5000";
export const API_BASE_URL = API_URL; // Keep compatibility if needed
