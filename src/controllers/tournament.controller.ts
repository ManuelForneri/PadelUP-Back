import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Tournament } from '../models/tournament.model';
import { RequestWithUser } from '../middleware/auth.middleware';

// Types for request bodies
export interface CreateTournamentBody {
  name: string;
  category: string;
  isMixed: boolean;
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  posterUrl?: string;
  registrationFee: number;
  description?: string;
  maxPlayers?: number;
}

export interface UpdateTournamentBody extends Partial<CreateTournamentBody> {}

export interface TournamentParams extends Record<string, string> {
  id: string;
}

// Get all tournaments with optional filtering
export const getTournaments = async (req: Request, res: Response) => {
  try {
    const { status, limit = '10', page = '1', active, upcoming } = req.query;
    const query: any = { isActive: active === 'false' ? false : true };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }
    
    const limitNum = parseInt(limit as string, 10);
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const skip = (pageNum - 1) * limitNum;
    
    const [tournaments, total] = await Promise.all([
      Tournament.find(query)
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      Tournament.countDocuments(query).exec()
    ]);
    
    res.status(200).json({ 
      success: true, 
      data: tournaments,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tournaments' 
    });
  }
};

// Get tournament by ID
export const getTournamentById = async (
  req: Request<TournamentParams>,
  res: Response
) => {
  try {
    const tournament = await Tournament.findOne({ 
      _id: req.params.id,
      isActive: true 
    }).lean().exec();
    
    if (!tournament) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tournament not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: tournament 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tournament' 
    });
  }
};

// Create a new tournament
export const createTournament = async (
  req: Request<{}, {}, CreateTournamentBody> & { user?: { id: string } },
  res: Response
) => {
  try {
    const {
      name,
      category,
      isMixed,
      location,
      startDate,
      endDate,
      registrationDeadline,
      posterUrl,
      registrationFee,
      description = '',
      maxPlayers
    } = req.body;

    // Check if tournament with same name already exists
    const existingTournament = await Tournament.findOne({ name }).lean().exec();
    if (existingTournament) {
      return res.status(400).json({
        success: false,
        message: 'A tournament with this name already exists'
      });
    }

    const newTournament = new Tournament({
      name,
      category,
      isMixed,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: new Date(registrationDeadline),
      posterUrl,
      registrationFee: Number(registrationFee),
      description,
      maxPlayers: maxPlayers ? Number(maxPlayers) : undefined,
      createdBy: req.user?.id ? new Types.ObjectId(req.user.id) : undefined,
      status: 'upcoming',
      isActive: true
    });

    await newTournament.save();
    
    res.status(201).json({
      success: true,
      data: newTournament.toObject()
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'An unknown error occurred' 
      });
    }
  }
};

// Update a tournament
export const updateTournament = async (
  req: Request<TournamentParams, {}, UpdateTournamentBody> & { user?: { id: string } },
  res: Response
) => {
  try {
    const updates = { ...req.body };
    
    // Convert date strings to Date objects if they exist
    if (updates.startDate) updates.startDate = new Date(updates.startDate) as any;
    if (updates.endDate) updates.endDate = new Date(updates.endDate) as any;
    if (updates.registrationDeadline) {
      updates.registrationDeadline = new Date(updates.registrationDeadline) as any;
    }
    
    const tournament = await Tournament.findOneAndUpdate(
      { 
        _id: req.params.id,
        isActive: true 
      },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!tournament) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tournament not found or already deleted' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: tournament.toObject() 
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Error updating tournament' 
      });
    }
  }
};

// Delete a tournament (soft delete)
export const deleteTournament = async (
  req: Request<TournamentParams>,
  res: Response
) => {
  try {
    const tournament = await Tournament.findOneAndUpdate(
      { 
        _id: req.params.id,
        isActive: true 
      },
      { $set: { isActive: false } },
      { new: true }
    );
    
    if (!tournament) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tournament not found or already deleted' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Tournament deleted successfully',
      data: tournament.toObject()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting tournament' 
    });
  }
};
