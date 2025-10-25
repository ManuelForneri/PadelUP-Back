import { Request, Response } from "express";
import User from "../../models/user.model";

export const listPlayers = async (req: Request, res: Response) => {
  try {
    const { search, category, level, hand, position } = req.query;

    const filter: Record<string, unknown> = { role: "user" };

    if (category) filter.category = category;
    if (level) filter.nivel = level;
    if (hand) filter.hand = hand;
    if (position) filter.position = position;

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { dni: searchRegex },
      ];
    }

    const players = await User.find(filter, {
      password: 0,
      __v: 0,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: players.length,
      data: players,
    });
  } catch (error) {
    console.error("Error al obtener jugadores para admin:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los jugadores",
    });
  }
};
