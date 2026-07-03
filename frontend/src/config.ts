const getHostname = () => {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return "localhost";
};

const hostname = getHostname();

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `http://${hostname}:8000`;
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || `ws://${hostname}:8000`;
