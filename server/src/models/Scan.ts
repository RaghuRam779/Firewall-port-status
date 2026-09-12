import { Schema, model, Document, Types } from "mongoose";
import { PortResult } from "../types";

export interface IScan extends Document {
  user: Types.ObjectId;
  target: string;
  command: string;
  scanTypes: string[];
  portPreset: string;
  status: "queued" | "running" | "completed" | "failed";
  ports: PortResult[];
  hostUp: boolean;
  osGuess?: string;
  latencyMs?: number;
  firewallDetected: boolean;
  riskScore: number;
  recommendations: string[];
  durationMs: number;
  rawOutput: string;
  authorizationConfirmed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

const portResultSchema = new Schema<PortResult>(
  {
    port: Number,
    protocol: { type: String, enum: ["tcp", "udp"] },
    state: { type: String, enum: ["open", "closed", "filtered"] },
    service: String,
    version: String,
    risk: { type: String, enum: ["Low", "Medium", "High", "Critical"] }
  },
  { _id: false }
);

const scanSchema = new Schema<IScan>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  target: { type: String, required: true },
  command: { type: String, required: true },
  scanTypes: [{ type: String }],
  portPreset: { type: String, required: true },
  status: {
    type: String,
    enum: ["queued", "running", "completed", "failed"],
    default: "queued"
  },
  ports: [portResultSchema],
  hostUp: { type: Boolean, default: false },
  osGuess: String,
  latencyMs: Number,
  firewallDetected: { type: Boolean, default: false },
  riskScore: { type: Number, default: 0 },
  recommendations: [{ type: String }],
  durationMs: { type: Number, default: 0 },
  rawOutput: { type: String, default: "" },
  authorizationConfirmed: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

scanSchema.index({ user: 1, createdAt: -1 });

export const Scan = model<IScan>("Scan", scanSchema);
