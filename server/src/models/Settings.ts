import { Schema, model, Document, Types } from "mongoose";

export interface ISettings extends Document {
  user: Types.ObjectId;
  defaultScanType: string;
  defaultPortPreset: string;
  theme: "dark" | "light";
  notificationsEnabled: boolean;
  scanTimeoutMs: number;
}

const settingsSchema = new Schema<ISettings>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  defaultScanType: { type: String, default: "tcp_connect" },
  defaultPortPreset: { type: String, default: "top100" },
  theme: { type: String, enum: ["dark", "light"], default: "dark" },
  notificationsEnabled: { type: Boolean, default: true },
  scanTimeoutMs: { type: Number, default: 180000 }
});

export const Settings = model<ISettings>("Settings", settingsSchema);
