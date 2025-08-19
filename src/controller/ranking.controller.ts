import { Request, Response } from "express";
import userModel from "../models/user.model";

/**
 * Obtiene el ranking de jugadores ordenados por puntos
 * @param req - Request de Express
 * @param res - Response de Express
 */
export const getRanking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '10' } = req.query;
    const limitNumber = Math.min(Number(limit), 100); // Limitar a 100 resultados como máximo
    
    // Obtener jugadores ordenados por puntos (de mayor a menor)
    const players = await userModel
      .find(
        {},
        {
          dni: 1,
          email: 1,
          firstName: 1,
          lastName: 1,
          city: 1,
          gender: 1,
          category: 1,
          nivel: 1,
          hand: 1,
          position: 1,
          profileImage: 1,
          points: 1,
          createdAt: 1
        }
      )
      .sort({ points: -1, createdAt: 1 }) // Ordenar por puntos descendente
      .limit(limitNumber)
      .lean();

    // Agregar posición en el ranking
    const rankedPlayers = players.map((player, index) => ({
      ...player,
      position: index + 1,
      name: `${player.firstName} ${player.lastName}`
    }));

    res.status(200).json({
      success: true,
      count: rankedPlayers.length,
      data: rankedPlayers,
    });
  } catch (error) {
    console.error('Error al obtener el ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el ranking de jugadores',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};
