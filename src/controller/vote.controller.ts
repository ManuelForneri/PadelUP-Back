import { Request, Response } from "express";
import userModel from "../models/user.model";

export const registerVoteController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { voteType, voterId } = req.body;

    // Validar que se proporcione un tipo de voto y un ID de votante
    if (!voteType || !voterId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el tipo de voto (voteType) y el ID del votante (voterId)",
      });
    }

    // Verificar que el tipo de voto sea válido
    if (voteType !== 'upVotes' && voteType !== 'downVotes') {
      return res.status(400).json({
        success: false,
        message: "Tipo de voto no válido. Debe ser 'upVotes' o 'downVotes'"
      });
    }

    // Buscar al usuario que está siendo votado
    const userToVote = await userModel.findById(id);
    if (!userToVote) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
      });
    }

    // Verificar si el votante ya votó a este usuario
    if (userToVote.votes.voters.includes(voterId)) {
      return res.status(400).json({
        success: false,
        message: "Ya has votado a este jugador",
      });
    }

    // Actualizar los votos
    if (voteType === 'upVotes') {
      userToVote.votes.upVotes += 1;
    } else {
      userToVote.votes.downVotes += 1;
    }
    userToVote.votes.totalVotes += 1;
    userToVote.votes.voters.push(voterId);

    // Guardar los cambios
    await userToVote.save();

    res.status(200).json({
      success: true,
      message: "Voto registrado exitosamente",
      data: {
        upVotes: userToVote.votes.upVotes,
        downVotes: userToVote.votes.downVotes,
        totalVotes: userToVote.votes.totalVotes
      }
    });
  } catch (error) {
    console.error("Error al registrar voto:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar voto",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
