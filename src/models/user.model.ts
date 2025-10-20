import { Schema, model, Document } from "mongoose";

export interface IVote {
  passVotes: number; // Votos para jugadores que deberían estar en una categoría superior
  goodVotes: number; // Votos para jugadores que están bien rankeados en su categoría actual
  totalVotes: number; // Total de votos recibidos
  voters: string[]; // Array de IDs de usuarios que ya votaron
}

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  dni: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  city: string;
  gender: "masculino" | "femenino" | "otro";
  category: "8va" | "7ma" | "6ta" | "5ta" | "4ta" | "3ra" | "2da" | "1ra";
  nivel: "inicial" | "medio" | "fuerte";
  hand: "Derecha" | "Izquierda";
  position: "Reves" | "Drive" | "Ambos";
  profileImage?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  points: number;
  votes: IVote;
}

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    dni: {
      type: String,
      required: [true, "El DNI es obligatorio"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingresa un email válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },
    firstName: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "El género es obligatorio"],
      enum: {
        values: ["masculino", "femenino", "otro"],
        message: "Género no válido. Debe ser: masculino, femenino u otro",
      },
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: {
        values: ["8va", "7ma", "6ta", "5ta", "4ta", "3ra", "2da", "1ra"],
        message:
          "Categoría no válida. Debe ser: 8va, 7ma, 6ta, 5ta, 4ta, 3ra, 2da o 1ra",
      },
      default: "8va",
    },
    nivel: {
      type: String,
      required: [true, "El nivel es obligatorio"],
      enum: {
        values: ["inicial", "medio", "fuerte"],
        message: "Nivel no válido. Debe ser: inicial, medio o fuerte",
      },
      default: "inicial",
    },
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
      ],
    },
    profileImage: {
      type: String,
      default: null,
    },
    hand: {
      type: String,
      required: [true, "La mano hábil es obligatoria"],
      enum: {
        values: ["Derecha", "Izquierda"],
        message: "Mano hábil no válida. Debe ser: Derecha o Izquierda",
      },
    },
    position: {
      type: String,
      required: [true, "La posición es obligatoria"],
      enum: {
        values: ["Reves", "Drive", "Ambos"],
        message: "Posición no válida. Debe ser: Reves, Drive o Ambos",
      },
    },
    points: {
      type: Number,
      default: 0,
      min: [0, "Los puntos no pueden ser negativos"],
    },
    votes: {
      goodVotes: { type: Number, default: 0, min: 0 },
      passVotes: { type: Number, default: 0, min: 0 },
      totalVotes: { type: Number, default: 0, min: 0 },
      voters: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const retObj = ret as any;
        delete retObj.password;
        delete retObj.__v;
        return retObj;
      },
    },
  }
);

export default model<IUser>("User", userSchema);
