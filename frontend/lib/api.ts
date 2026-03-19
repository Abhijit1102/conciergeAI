import axios from "axios";
import type { LoginRequest, RegisterRequest, QueryRequest,
              LoginResponse, QueryResponse, HistoryResponse } from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const register    = (b: RegisterRequest)  => api.post<void>("/auth/register", b).then(r => r.data);
export const login       = (b: LoginRequest)      => api.post<LoginResponse>("/auth/login", b).then(r => r.data);
export const submitQuery = (b: QueryRequest)      => api.post<QueryResponse>("/query", b).then(r => r.data);
export const getHistory  = ()                     => api.get<HistoryResponse>("/history").then(r => r.data);
