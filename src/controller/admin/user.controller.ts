import { Request, Response } from "express";
import User from "../../models/user.model";
import { IUser } from "../../models/user.model";

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Search filter
    const search = req.query.search as string || '';
    const searchFilter = search 
      ? {
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { dni: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(
        searchFilter,
        { password: 0, __v: 0, votes: 0 }
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
      User.countDocuments(searchFilter)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener los usuarios' 
    });
  }
};

// Get single user (admin only)
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id, { password: 0, __v: 0, votes: 0 });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener el usuario' 
    });
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Don't allow updating password through this endpoint
    if (updateData.password) {
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password -__v -votes' }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'Usuario actualizado correctamente'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar el usuario' 
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent deleting your own account
    if (req.user?.id === id) {
      return res.status(400).json({ 
        success: false,
        message: 'No puedes eliminar tu propia cuenta' 
      });
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ 
      success: true,
      message: 'Usuario eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar el usuario' 
    });
  }
};
