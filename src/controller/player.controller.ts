import { Request, Response } from "express";
import userModel from "../models/user.model";

/**
 * Obtiene la lista de jugadores con opciones de filtrado
 * @param req - Request de Express
 * @param res - Response de Express
 */
export const getPlayers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Obtener parámetros de consulta (query params)
    const { category, level, hand, position, search } = req.query;

    // Construir objeto de filtro
    const filter: any = {};

    // Aplicar filtros si existen
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (hand) filter.hand = hand;
    if (position) filter.position = position;

    // Búsqueda por nombre de usuario o email (búsqueda parcial)
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      filter.$or = [{ firstName: searchRegex }, { lastName: searchRegex }];
    }

    // Obtener usuarios con los filtros aplicados
    const players = await userModel
      .find(filter, {
        password: 0, // Excluir la contraseña
        __v: 0, // Excluir versión de mongoose
        // createdAt ahora está incluido
        updatedAt: 0,
      })
      .sort({ firstName: 1 }) // Ordenar por nombre de usuario
      .lean(); // Usar lean() para mejor rendimiento

    res.status(200).json({
      success: true,
      count: players.length,
      data: players,
    });
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la lista de jugadores",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Obtiene los detalles de un jugador específico por ID
 * @param req - Request de Express con el ID del jugador
 * @param res - Response de Express
 */
/**
 * Registra un voto para un jugador
 * @param req - Request de Express con el ID del jugador y los datos del voto
 * @param res - Response de Express
 */
export const voteForPlayer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: playerId } = req.params;
    const { voterId: voterIdParam, voteType }: { voterId: string; voteType: 'up' | 'down' } = req.body;

    // Validar que se proporcionen los datos necesarios
    if (!voterIdParam || !voteType) {
      res.status(400).json({
        success: false,
        message: 'Se requieren voterId y voteType',
      });
      return;
    }

    // Verificar que el jugador que vota existe
    const voter = await userModel.findById(voterIdParam);
    if (!voter || !voter._id) {
      res.status(404).json({
        success: false,
        message: 'Usuario votante no encontrado',
      });
      return;
    }

    // Verificar que el jugador objetivo existe
    const player = await userModel.findById(playerId);
    if (!player) {
      res.status(404).json({
        success: false,
        message: 'Jugador no encontrado',
      });
      return;
    }

    // Verificar si el votante ya ha votado a este jugador
    const voterId = voter._id.toString();
    const hasVoted = player.votes.voters.some(voter => voter.toString() === voterId);
    if (hasVoted) {
      res.status(400).json({
        success: false,
        message: 'Ya has votado a este jugador',
      });
      return;
    }

    // Actualizar los votos
    const update: any = {
      $addToSet: { 'votes.voters': voter._id },
      $inc: { 'votes.totalVotes': 1 }
    };

    if (voteType === 'up') {
      update.$inc['votes.upVotes'] = 1;
    } else {
      update.$inc['votes.downVotes'] = 1;
    }

    // Actualizar el documento del jugador
    const updatedPlayer = await userModel.findByIdAndUpdate(
      playerId,
      update,
      { new: true, select: 'votes' }
    );

    if (!updatedPlayer) {
      throw new Error('Error al actualizar los votos del jugador');
    }

    res.status(200).json({
      success: true,
      message: `Has votado que el jugador ${voteType === 'up' ? 'está bien' : 'está pasado'}`,
      data: {
        upVotes: updatedPlayer.votes.upVotes,
        downVotes: updatedPlayer.votes.downVotes,
        totalVotes: updatedPlayer.votes.totalVotes
      }
    });
  } catch (error) {
    console.error('Error al registrar el voto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el voto',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const getPlayerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const player = await userModel.findById(id, {
      password: 0, // Excluir la contraseña
      __v: 0, // Excluir versión de mongoose
      // createdAt ahora está incluido
      updatedAt: 0,
    }).lean(); // Usar lean() para mejor rendimiento

    if (!player) {
      res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: player,
    });
  } catch (error) {
    console.error("Error al obtener jugador:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los datos del jugador",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
