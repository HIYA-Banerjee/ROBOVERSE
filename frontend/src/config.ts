export const API_BASE_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
  : "http://localhost:8000";

export const WS_BASE_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000")
  : "ws://localhost:8000";
