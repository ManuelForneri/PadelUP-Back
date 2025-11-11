import { Request, Response } from "express";
import { validationResult } from "express-validator/check";
import { ValidationError } from "express-validator/check";
import Tournament, { ITournament } from "../models/tournament.model";
import { Types } from "mongoose";

// The Request type is extended in src/@types/express/index.d.ts

export const createTournament = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorArray = errors.array() as ValidationError[];
      const formattedErrors = errorArray.map((err) => ({
        param: err.param || "unknown",
        msg: err.msg,
        location: err.location || "body",
      }));

      return res.status(400).json({
        success: false,
        errors: formattedErrors,
      });
    }

    const {
      name,
      category,
      isMixed,
      location,
      startDate,
      endDate,
      registrationDeadline,
      registrationFee,
    } = req.body;

    // Get image URL from Cloudinary
    const imageUrl = req.file?.path; // Cloudinary devuelve la URL en req.file.path

    // Ensure dates are properly formatted
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const registrationDeadlineObj = new Date(registrationDeadline);

    // Create new tournament
    const tournament = new Tournament({
      name,
      category,
      isMixed,
      location,
      startDate: startDateObj,
      endDate: endDateObj,
      registrationDeadline: registrationDeadlineObj,
      registrationFee,
      imageUrl,
    });

    await tournament.save();

    res.status(201).json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    console.error("Error creating tournament:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      success: false,
      message: "Error al crear el torneo",
      error: errorMessage,
    });
  }
};

export const getTournaments = async (req: Request, res: Response) => {
  try {
    const { activeOnly = "true" } = req.query;
    const filter: any = {};

    // Si activeOnly es "true", filtrar solo torneos activos
    // Pero no filtrar por fecha para permitir ver todos los torneos activos
    if (activeOnly === "true") {
      filter.isActive = true;
    }

    console.log(
      "🔍 Buscando torneos con filtro:",
      JSON.stringify(filter, null, 2)
    );
    console.log("📅 Fecha actual:", new Date().toISOString());

    const tournaments = await Tournament.find(filter)
      .sort({ startDate: 1 })
      .lean();

    console.log(`✅ Encontrados ${tournaments.length} torneos`);

    res.status(200).json({
      success: true,
      count: tournaments.length,
      data: tournaments,
    });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      success: false,
      message: "Error al obtener los torneos",
      error: errorMessage,
    });
  }
};

export const getTournamentById = async (req: Request, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id).lean();

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Torneo no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    console.error("Error fetching tournament:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      success: false,
      message: "Error al obtener el torneo",
      error: errorMessage,
    });
  }
};

export const updateTournament = async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body };

    // Handle file upload if exists
    if (req.file) {
      updates.imageUrl = `/uploads/tournaments/${req.file.filename}`;
    }

    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Torneo no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    console.error("Error updating tournament:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      success: false,
      message: "Error al actualizar el torneo",
      error: errorMessage,
    });
  }
};

export const deleteTournament = async (req: Request, res: Response) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Torneo no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Torneo eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      success: false,
      message: "Error al eliminar el torneo",
      error: errorMessage,
    });
  }
};
