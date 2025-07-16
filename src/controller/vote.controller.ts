import { Request, Response } from "express";
import userModel from "../models/user.model";
import { Types } from "mongoose";

interface IVoteRequest extends Request {
  userId?: string;
  body: {
    voteType: 'up' | 'down';
  };
  params: {
    playerId: string;
  };
}

interface IVoteResponse {
  success: boolean;
  message: string;
  votes?: {
    upVotes: number;
    downVotes: number;
    totalVotes: number;
    voters: string[];
  };
}

/**
 * Registra un voto para un jugador
 * @param req - Request con el ID del jugador y el tipo de voto
 * @param res - Response con el resultado de la operación
 */
export const votePlayer = async (req: IVoteRequest, res: Response<IVoteResponse>): Promise<void> => {
  try {
    const { playerId } = req.params;
    const { voteType } = req.body;
    const voterId = req.userId;

    // Validaciones básicas
    if (!Types.ObjectId.isValid(playerId)) {
      res.status(400).json({ 
        success: false, 
        message: 'ID de jugador no válido' 
      });
      return;
    }

    if (!voterId) {
      res.status(401).json({ 
        success: false, 
        message: 'No autorizado' 
      });
      return;
    }

    // Verificar que el votante no sea el mismo que el jugador
    if (playerId === voterId) {
      res.status(400).json({ 
        success: false, 
        message: 'No puedes votarte a ti mismo' 
      });
      return;
    }

    // Buscar al jugador que recibirá el voto
    const player = await userModel.findById(playerId);
    if (!player) {
      res.status(404).json({ 
        success: false, 
        message: 'Jugador no encontrado' 
      });
      return;
    }

    // Inicializar el objeto de votos si no existe
    if (!player.votes) {
      player.votes = {
        upVotes: 0,
        downVotes: 0,
        totalVotes: 0,
        voters: []
      };
    }

    // Verificar si el usuario ya votó
    const voterIdObj = new Types.ObjectId(voterId);
    const hasVoted = player.votes.voters.some(voter => voter.equals(voterIdObj));
    if (hasVoted) {
      res.status(400).json({ 
        success: false, 
        message: 'Ya has votado por este jugador' 
      });
      return;
    }

    // Actualizar los votos
    if (voteType === 'up') {
      player.votes.upVotes += 1;
    } else {
      player.votes.downVotes += 1;
    }
    
    player.votes.totalVotes += 1;
    player.votes.voters.push(voterIdObj);

    // Guardar los cambios
    await player.save();

    // Devolver la información actualizada de los votos
    res.status(200).json({
      success: true,
      message: 'Voto registrado correctamente',
      votes: {
        upVotes: player.votes.upVotes,
        downVotes: player.votes.downVotes,
        totalVotes: player.votes.totalVotes,
        voters: player.votes.voters.map(voter => voter.toString())
      }
    });

  } catch (error) {
    console.error('Error al registrar el voto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar el voto' 
    });
  }
};

/**
 * Verifica si el usuario actual ya votó por un jugador
 * @param req - Request con el ID del jugador
 * @param res - Response con la información del voto
 */
export const checkUserVote = async (req: IVoteRequest, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params;
    const userId = req.userId;

    // Validaciones básicas
    if (!Types.ObjectId.isValid(playerId)) {
      res.status(400).json({ 
        success: false, 
        message: 'ID de jugador no válido' 
      });
      return;
    }

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'No autorizado' 
      });
      return;
    }

    // Buscar al jugador
    const player = await userModel.findById(playerId).select('votes');
    if (!player) {
      res.status(404).json({ 
        success: false, 
        message: 'Jugador no encontrado' 
      });
      return;
    }

    // Verificar si el usuario ya votó
    const userIdObj = new Types.ObjectId(userId);
    const hasVoted = player.votes?.voters.some(voter => voter.equals(userIdObj)) || false;
    
    // Nota: En esta implementación, no guardamos el tipo de voto del usuario
    // por lo que no podemos determinar si fue 'up' o 'down' en checkUserVote
    // Si necesitas esta funcionalidad, deberías modificar el modelo para guardar esta información
    const voteType = null; // No podemos determinar el tipo de voto con la estructura actual

    // Devolver la información del voto
    res.status(200).json({
      success: true,
      hasVoted,
      voteType,
      totalVotes: player.votes?.totalVotes || 0,
      upVotes: player.votes?.upVotes || 0,
      downVotes: player.votes?.downVotes || 0
    });

  } catch (error) {
    console.error('Error al verificar el voto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar el voto' 
    });
  }
};
