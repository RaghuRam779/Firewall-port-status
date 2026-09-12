import { api } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "analyst";
}

interface AuthResponse {
  status: string;
  token: string;
  user: User;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<{ status: string; user: User }>("/auth/me");
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
}
