import mongoose, { Schema, Document } from 'mongoose';

export interface ITournament extends Document {
  name: string;
  category: string;
  isMixed: boolean;
  location: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  imageUrl?: string;
  registrationFee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del torneo es requerido'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'La categoría es requerida'],
      trim: true,
    },
    isMixed: {
      type: Boolean,
      required: [true, 'Debe especificar si el torneo es mixto o no'],
    },
    location: {
      type: String,
      required: [true, 'La sede del torneo es requerida'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'La fecha de inicio es requerida'],
    },
    endDate: {
      type: Date,
      required: [true, 'La fecha de finalización es requerida'],
      validate: {
        validator: function (this: ITournament, value: Date) {
          return value > this.startDate;
        },
        message: 'La fecha de finalización debe ser posterior a la fecha de inicio',
      },
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'La fecha límite de inscripción es requerida'],
      validate: {
        validator: function (this: ITournament, value: Date) {
          return value < this.startDate;
        },
        message: 'La fecha límite de inscripción debe ser anterior a la fecha de inicio',
      },
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    registrationFee: {
      type: Number,
      required: [true, 'El valor de la inscripción es requerido'],
      min: [0, 'El valor de la inscripción no puede ser negativo'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
tournamentSchema.index({ name: 1, startDate: 1 }, { unique: true });
tournamentSchema.index({ isActive: 1 });
tournamentSchema.index({ startDate: 1 });

const Tournament = mongoose.model<ITournament>('Tournament', tournamentSchema, 'tournaments');

export default Tournament;
