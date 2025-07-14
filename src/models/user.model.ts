import { Schema, model, Document } from "mongoose";

export interface IVote {
  upVotes: number;
  downVotes: number;
  totalVotes: number;
  voters: string[]; // Array de IDs de usuarios que ya votaron
}

export interface IUser extends Document {
  dni: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  city: string;
  gender: 'masculino' | 'femenino' | 'otro';
  category: 'inicial' | 'medio' | 'fuerte';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  points: number;
  votes: IVote;
}

const userSchema = new Schema<IUser>(
  {
    dni: { 
      type: String, 
      required: [true, 'El DNI es obligatorio'], 
      unique: true,
      trim: true
    },
    email: { 
      type: String, 
      required: [true, 'El email es obligatorio'], 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
    },
    password: { 
      type: String, 
      required: [true, 'La contraseña es obligatoria'] 
    },
    firstName: { 
      type: String, 
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    lastName: { 
      type: String, 
      required: [true, 'El apellido es obligatorio'],
      trim: true
    },
    gender: { 
      type: String, 
      required: [true, 'El género es obligatorio'],
      enum: {
        values: ['masculino', 'femenino', 'otro'],
        message: 'Género no válido. Debe ser: masculino, femenino u otro'
      }
    },
    category: { 
      type: String, 
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: ['inicial', 'medio', 'fuerte'],
        message: 'Categoría no válida. Debe ser: inicial, medio o fuerte'
      },
      default: 'inicial'
    },
    city: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      enum: [
        'San Andrés de Giles',
        'Luján',
        'San Antonio de Areco',
        'Carmen de Areco',
        'Mercedes',
        'Suipacha',
        'Chivilcoy',
        'Chacabuco'
      ]
    },
    profileImage: { 
      type: String, 
      default: null 
    },
    points: { 
      type: Number, 
      default: 0,
      min: [0, 'Los puntos no pueden ser negativos']
    },
    votes: {
      upVotes: { type: Number, default: 0, min: 0 },
      downVotes: { type: Number, default: 0, min: 0 },
      totalVotes: { type: Number, default: 0, min: 0 },
      voters: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export default model<IUser>("User", userSchema);
