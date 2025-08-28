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

    // Definir los tipos de voto permitidos
    const validVoteTypes = ['upVotes', 'goodVotes'] as const;
    type VoteType = typeof validVoteTypes[number];
    
    // Verificar que el tipo de voto sea válido
    if (!validVoteTypes.includes(voteType as VoteType)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de voto no válido. Debe ser 'upVotes' (para jugadores que deberían estar en una categoría superior) o 'goodVotes' (para jugadores bien rankeados en su categoría actual)"
      });
    }
    
    // Asegurar que TypeScript sepa que voteType es un tipo seguro
    const safeVoteType = voteType as VoteType;

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

    // Actualizar los votos según el tipo
    userToVote.votes[safeVoteType] += 1;
    userToVote.votes.totalVotes += 1;
    userToVote.votes.voters.push(voterId);

    // Guardar los cambios
    await userToVote.save();

    res.status(200).json({
      success: true,
      message: "Voto registrado exitosamente",
      data: {
        upVotes: userToVote.votes.upVotes,
        goodVotes: userToVote.votes.goodVotes,
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
