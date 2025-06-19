import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  category: string; // Ej: "8va"
  level: string; // Ej: "inicial", "medio", "fuerte"
  hand: "Derecha" | "Izquierda";
  position: "Reves" | "Drive";
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    hand: { type: String, enum: ["Derecha", "Izquierda"], required: true },
    position: { type: String, enum: ["Reves", "Drive"], required: true },
    profileImage: { type: String },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
