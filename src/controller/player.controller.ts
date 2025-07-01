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
        createdAt: 0,
        updatedAt: 0,
      })
      .sort({ firstName: 1 }); // Ordenar por nombre de usuario

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
export const getPlayerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const player = await userModel.findById(id, {
      password: 0, // Excluir la contraseña
      __v: 0, // Excluir versión de mongoose
      createdAt: 0,
      updatedAt: 0,
    });

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
