import mongoose, { Document, Schema } from "mongoose";

// Tournament status type
type TournamentStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

// Tournament interface
interface ITournament extends Document {
  name: string;
  category: string;
  isMixed: boolean;
  location: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  posterUrl?: string;
  registrationFee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  status: TournamentStatus;
  isRegistrationOpen: boolean;
}

// Schema definition
const tournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: {
      type: String,
      required: true,
      enum: ["Principiante", "Intermedio", "Avanzado", "Profesional"],
    },
    isMixed: { type: Boolean, required: true, default: false },
    location: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    posterUrl: { type: String, trim: true },
    registrationFee: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
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

// Virtual for registration status
tournamentSchema
  .virtual("isRegistrationOpen")
  .get(function (this: ITournament) {
    const now = new Date();
    return (
      now <= this.registrationDeadline &&
      this.isActive &&
      this.status === "upcoming"
    );
  });

// Validation middleware
tournamentSchema.pre<ITournament>("validate", function (next) {
  // Ensure registration deadline is before start date
  if (this.registrationDeadline >= this.startDate) {
    this.invalidate(
      "registrationDeadline",
      "Registration deadline must be before start date"
    );
  }

  // Ensure end date is after start date
  if (this.endDate <= this.startDate) {
    this.invalidate("endDate", "End date must be after start date");
  }

  next();
});

// Pre-save middleware to update status
tournamentSchema.pre<ITournament>("save", function (next) {
  const now = new Date();

  if (now > this.endDate) {
    this.status = "completed";
  } else if (now >= this.startDate) {
    this.status = "ongoing";
  } else {
    this.status = "upcoming";
  }

  next();
});

// Static methods
interface ITournamentModel extends mongoose.Model<ITournament> {
  findActiveTournaments(): Promise<ITournament[]>;
  findUpcomingTournaments(): Promise<ITournament[]>;
}

// Implement static methods
tournamentSchema.statics.findActiveTournaments = async function () {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
};

tournamentSchema.statics.findUpcomingTournaments = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $gt: now },
    registrationDeadline: { $gt: now },
  }).sort({ startDate: 1 });
};

// Create model
const Tournament = mongoose.model<ITournament, ITournamentModel>('Tournament', tournamentSchema);

// Export types and model
export type { ITournament };
export { Tournament };

declare global {
  namespace Express {
    interface Request {
      tournament?: ITournament;
    }
  }
}
