import { useMemo } from "react";
import { useAuth } from "../auth/firebase/AuthContext";
import { createHttpClient } from "./httpClient";

export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "https://backend-veridia-health.onrender.com/api";

export function useApi() {
  const { getToken } = useAuth();
  return useMemo(() => createHttpClient({
    baseURL: API_BASE,
    tokenProvider: getToken,
    timeoutMs: 15000
  }), [getToken]);
}
