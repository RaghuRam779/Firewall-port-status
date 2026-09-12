import { api } from "./api";

export interface UserSettings {
  defaultScanType: string;
  defaultPortPreset: string;
  theme: "dark" | "light";
  notificationsEnabled: boolean;
  scanTimeoutMs: number;
}

export async function getSettings(): Promise<UserSettings> {
  const { data } = await api.get<{ status: string; settings: UserSettings }>("/settings");
  return data.settings;
}

export async function updateSettings(payload: Partial<UserSettings>): Promise<UserSettings> {
  const { data } = await api.put<{ status: string; settings: UserSettings }>("/settings", payload);
  return data.settings;
}
