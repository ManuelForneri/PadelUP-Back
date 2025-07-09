import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Express } from "express";
import userModel from "../models/user.model";
import { JWT_SECRET } from "../config/env";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../utils/cloudinary";

// Extender la interfaz Request para incluir el archivo
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  validationError?: string;
}

// Agregar esta interfaz cerca de las otras interfaces
//export interface CloudinaryResult {
//  secure_url: string;
//}

export const register = async (req: Request, res: Response): Promise<void> => {
  console.log("Iniciando proceso de registro...");
  console.log("Cuerpo de la solicitud:", req.body);
  console.log("Archivo recibido:", (req as MulterRequest).file ? "Sí" : "No");

  try {
    const reqWithFile = req as MulterRequest;

    // Verificar si hay un error de validación de multer
    if (reqWithFile.validationError) {
      console.error(
        "Error de validación de archivo:",
        reqWithFile.validationError
      );
      res.status(400).json({
        success: false,
        message: "Error en el archivo subido",
        error: reqWithFile.validationError,
      });
      return;
    }
    // Extraer datos del cuerpo de la solicitud
    const {
      dni,
      email,
      password,
      firstName,
      lastName,
      city,
      category,
      level,
      hand,
      position,
    } = req.body;

    const file = (req as MulterRequest).file; // Archivo subido a través de multer

    console.log("Datos del formulario recibidos:", {
      dni,
      email,
      firstName,
      lastName,
      city,
      category,
      level,
      hand,
      position,
    });

    // Validaciones de campos obligatorios
    const requiredFields = [
      { field: email, name: "email" },
      { field: dni, name: "dni" },
      { field: firstName, name: "firstName" },
      { field: lastName, name: "lastName" },
      { field: city, name: "city" },
      { field: password, name: "password" },
      { field: category, name: "category" },
      { field: level, name: "level" },
      { field: hand, name: "hand" },
      { field: position, name: "position" },
    ];

    const missingFields = requiredFields
      .filter(({ field }) => !field)
      .map(({ name }) => name);

    if (missingFields.length > 0) {
      console.error("Campos obligatorios faltantes:", missingFields);
      res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios",
        missingFields,
      });
      return;
    }

    // La validación de coincidencia de contraseñas se hace en el cliente
    // Validar fortaleza de la contraseña
    if (password.length < 6) {
      console.error("La contraseña es demasiado corta");
      res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    // Verificar si el correo electrónico ya está en uso
    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      console.error(`El correo electrónico ${email} ya está registrado`);
      res.status(409).json({
        success: false,
        message: "El correo electrónico ya está registrado",
      });
      return;
    }

    // Verificar si el nombre de usuario ya está en uso
    const existingDNI = await userModel.findOne({ dni });
    if (existingDNI) {
      console.error(`El usuario ${dni} ya existe`);
      res.status(409).json({
        success: false,
        message: "El usuario ya existe",
      });
      return;
    }

    // Subida de imagen a Cloudinary (si se proporcionó)
    let profileImageUrl: string | undefined;
    if (file) {
      console.log("Procesando imagen de perfil...");
      try {
        profileImageUrl = await uploadImageToCloudinary(file);
        console.log(
          "Imagen subida correctamente a Cloudinary:",
          profileImageUrl
        );
      } catch (error: any) {
        console.error("Error al subir la imagen a Cloudinary:", {
          message: error.message,
          stack: error.stack,
          code: error.code,
          http_code: error.http_code,
          name: error.name,
        });

        // Si el error es de Cloudinary, extraer más detalles
        let errorMessage = "Error al procesar la imagen de perfil";
        if (error.http_code) {
          errorMessage = `Error de Cloudinary (${error.http_code}): ${error.message}`;
        } else if (error.message) {
          errorMessage = error.message;
        }

        res.status(500).json({
          success: false,
          message: errorMessage,
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error al procesar la imagen",
        });
        return;
      }
    } else {
      console.log("No se proporcionó ninguna imagen de perfil");
    }

    try {
      // Encriptar contraseña
      console.log("Encriptando contraseña...");
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      console.log("Creando nuevo usuario...");
      const newUser = new userModel({
        email,
        dni,
        firstName,
        lastName,
        city,
        password: hashedPassword,
        category,
        level,
        hand,
        position,
        profileImage: profileImageUrl || undefined, // Solo guarda la URL si existe
      });

      // Guardar usuario en la base de datos
      console.log("Guardando usuario en la base de datos...");
      await newUser.save();
      console.log("Usuario registrado exitosamente");

      // Generar token JWT
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      // Enviar respuesta exitosa
      console.log("URL de la imagen de perfil guardada:", newUser.profileImage);

      const userResponse = {
        id: newUser._id,
        dni: newUser.dni,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        city: newUser.city,
        email: newUser.email,
        category: newUser.category,
        level: newUser.level,
        hand: newUser.hand,
        position: newUser.position,
        profileImage: newUser.profileImage,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };

      console.log("Enviando respuesta con usuario:", userResponse);

      res.status(201).json({
        success: true,
        message: "Usuario registrado correctamente",
        user: userResponse,
        token,
      });
    } catch (dbError: any) {
      console.error(
        "Error al guardar el usuario en la base de datos:",
        dbError
      );
      res.status(500).json({
        success: false,
        message: "Error al guardar el usuario en la base de datos",
        error: dbError.message,
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  console.log("Iniciando proceso de login...");
  console.log("Datos de inicio de sesión recibidos:", req.body);

  try {
    const { dniOrEmail, password } = req.body;

    // Validar datos de entrada
    if (!dniOrEmail || !password) {
      const missingFields = [];
      if (!dniOrEmail) missingFields.push("dniOrEmail");
      if (!password) missingFields.push("password");

      console.error("Faltan campos obligatorios:", missingFields);
      res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios",
        missingFields,
      });
      return;
    }

    // Buscar usuario por email o nombre de usuario
    console.log("Buscando usuario en la base de datos...");
    const user = await userModel
      .findOne({
        $or: [
          { email: dniOrEmail.toLowerCase() },
          { dni: dniOrEmail.toLowerCase() },
        ],
      })
      .select("+password") // Incluir la contraseña para la comparación
      .lean()
      .exec();

    if (!user) {
      console.error("Usuario no encontrado para:", dniOrEmail);
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    // Asegurarnos de que el usuario tenga un _id
    if (!user._id) {
      throw new Error("Usuario no tiene un ID válido");
    }

    if (!user) {
      console.error("Usuario no encontrado para:", dniOrEmail);
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    console.log("Usuario encontrado con DNI:", user.dni);

    // Verificar contraseña
    console.log("Verificando contraseña...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Contraseña incorrecta para el usuario con DNI:", user.dni);
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    // Generar token JWT
    console.log("Generando token JWT...");
    const userId = user._id.toString(); // Convertir a string explícitamente
    const token = jwt.sign(
      {
        userId: userId,
        email: user.email,
        dni: user.dni,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log("Token generado para el usuario:", userId);

    // Obtener datos del usuario sin la contraseña
    const userData = await userModel.findById(user._id).select("-password");

    if (!userData) {
      throw new Error("Usuario no encontrado");
    }

    console.log("Inicio de sesión exitoso para:", userData.email);

    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id,
        dni: user.dni,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city: user.city,
        profileImage: user.profileImage,
        category: user.category,
        level: user.level,
        hand: user.hand,
        position: user.position,
      },
      token,
    });
  } catch (error: any) {
    console.error("Error en el proceso de login:", error);

    // Manejar errores específicos
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));

      res.status(400).json({
        success: false,
        message: "Error de validación",
        errors,
      });
    } else {
      // Error genérico del servidor
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const reqWithFile = req as any; // Usamos any temporalmente
    const userId = req.user?.id; // Accedemos al ID del usuario desde req.user

    console.log("ID del usuario desde el token:", userId); // Log para depuración

    if (!userId) {
      console.error("No se pudo obtener el ID del usuario desde el token");
      res.status(401).json({
        success: false,
        message: "No autorizado - Usuario no identificado",
      });
      return;
    }

    const updateData = { ...req.body };
    console.log("Actualizando perfil para usuario:", userId);
    console.log("Datos recibidos:", updateData);
    console.log("Archivo recibido:", reqWithFile.file ? "Sí" : "No");

    // Verificar si se proporcionó una nueva imagen
    if (reqWithFile.file) {
      console.log("Procesando nueva imagen de perfil...");
      try {
        // Obtener el usuario actual para verificar si tiene una imagen previa
        const currentUser = await userModel.findById(userId);

        // Si el usuario ya tiene una imagen de perfil, eliminarla de Cloudinary
        if (currentUser?.profileImage) {
          console.log("Eliminando imagen anterior de Cloudinary...");
          await deleteImageFromCloudinary(currentUser.profileImage);
        }

        // Subir la nueva imagen
        const imageUrl = await uploadImageToCloudinary(reqWithFile.file);
        updateData.profileImage = imageUrl;
        console.log(
          "Nueva imagen subida a Cloudinary:",
          updateData.profileImage
        );
      } catch (error) {
        console.error("Error en updateProfile:", error);
        res.status(500).json({
          success: false,
          message: "Error al actualizar el perfil",
        });
      }
    }

    // Actualizar el usuario en la base de datos
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    // Convertir a objeto plano para manipular
    const userResponse = updatedUser.toObject();
    // Usar la sintaxis segura para eliminar la propiedad
    if ("password" in userResponse) {
      const { password, ...userWithoutPassword } = userResponse;
      res.status(200).json({
        success: true,
        message: "Perfil actualizado exitosamente",
        user: userWithoutPassword,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Perfil actualizado exitosamente",
        user: userResponse,
      });
    }
  } catch (error: any) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al actualizar el perfil",
    });
  }
};

export const testConnection = (req: Request, res: Response) => {
  console.log("✅ Prueba de conexión exitosa");
  res.status(200).json({
    success: true,
    message: "Conexión exitosa con el servidor",
    timestamp: new Date().toISOString(),
  });
};
