import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  dni: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  city: string;
  category: string; // Ej: "8va"
  level: string; // Ej: "inicial", "medio", "fuerte"
  hand: "Derecha" | "Izquierda";
  position: "Reves" | "Drive";
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  playerPoint: number;
}

const userSchema = new Schema<IUser>(
  {
    dni: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    city: {
      type: String,
      required: [true, "La ciudad es obligatoria"],
      enum: [
        "San Andrés de Giles",
        "Luján",
        "San Antonio de Areco",
        "Carmen de Areco",
        "Mercedes",
        "Suipacha",
        "Chivilcoy",
        "Chacabuco",
        // Agrega más ciudades según sea necesario
      ],
    },
    hand: { type: String, enum: ["Derecha", "Izquierda"], required: true },
    position: { type: String, enum: ["Reves", "Drive"], required: true },
    profileImage: { type: String, default: null },
    playerPoint: { type: Number, default: 0, required: false },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
