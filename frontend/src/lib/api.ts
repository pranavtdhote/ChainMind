const isProd = process.env.NODE_ENV === "production";
const api_url = process.env.NEXT_PUBLIC_API_URL;

if (isProd && !api_url) {
  console.error("CRITICAL ERROR: NEXT_PUBLIC_API_URL environment variable is missing in production! Falling back to valiant-freedom-production-926f.up.railway.app");
}

export const API_URL = api_url || "https://valiant-freedom-production-926f.up.railway.app";
export const API_BASE_URL = API_URL;
