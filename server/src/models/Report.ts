import { Schema, model, Document, Types } from "mongoose";

export interface IReport extends Document {
  scan: Types.ObjectId;
  user: Types.ObjectId;
  summary: string;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>({
  scan: { type: Schema.Types.ObjectId, ref: "Scan", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  summary: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export const Report = model<IReport>("Report", reportSchema);
