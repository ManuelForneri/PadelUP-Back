import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import playerRoutes from "./routes/player.routes";
import voteRoutes from "./routes/vote.route";
import tournamentRoutes from "./routes/tournament.routes";
import adminUserRoutes from "./routes/admin/user.routes";
import adminAuthRoutes from "./routes/admin/auth.routes";
import adminPlayerRoutes from "./routes/admin/player.routes";

dotenv.config();
const app = express();

// Aumentar el tiempo de espera de las solicitudes
export const REQUEST_TIMEOUT = 30000; // 30 segundos

// Crear directorio de subidas si no existe
const uploadsDir = path.join(__dirname, "../public/uploads/tournaments");
import fs from "fs";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Configuración de CORS
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Permitir solicitudes sin origen (como aplicaciones móviles o Postman)
    if (!origin) {
      console.log("✅ Solicitud sin origen (aplicación móvil o Postman)");
      return callback(null, true);
    }

    // Lista de orígenes permitidos
    const allowedOrigins = [
      "http://localhost:8081", // URL de Expo Web
      "http://localhost:19000", // URL de Expo
      "http://localhost:5173", // React dev server (sin barra al final)
      "http://localhost:5000", // Backend
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/, // Cualquier IP local
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/, // IPs privadas
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/, // Más IPs privadas
      /^https?:\/\/([a-z0-9]+[.])*padel-sag\.com$/, // Dominio de producción
      /^https?:\/\/padelsag-back\.onrender\.com$/, // Backend en Render
      /^https?:\/\/padelsag-web\.onrender\.com$/, // Frontend en Render
      /^https?:\/\/padelsag\.onrender\.com$/, // Dominio alternativo en Render
      /^https?:\/\/padelup\-frontend\.onrender\.com$/, // Frontend alternativo
    ];

    // Verificar si el origen está permitido
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === "string") {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      console.log(`✅ Origen permitido: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ Origen no permitido: ${origin}`);
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: [
    "Content-Range",
    "X-Total-Count",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

// Middleware para manejar CORS manualmente
app.use((req, res, next) => {
  // Lista de orígenes permitidos
  const allowedOrigins = [
    "http://localhost:8081",
    "http://localhost:19000",
    "http://localhost:5173",
    "http://localhost:5000",
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/,
    /^https?:\/\/([a-z0-9]+\.)*padel-sag\.com$/,
    /^https?:\/\/padelsag-back\.onrender\.com$/,
    /^https?:\/\/padelsag-web\.onrender\.com$/,
    /^https?:\/\/padelsag\.onrender\.com$/,
    /^https?:\/\/padelup\-frontend\.onrender\.com$/,
  ];

  const origin = req.headers.origin || "";
  let isAllowed = !origin; // Permitir solicitudes sin origen

  // Verificar si el origen está en la lista de permitidos
  if (origin) {
    isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === "string") {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
  }

  // Configurar encabezados CORS
  if (isAllowed) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    console.log(`✅ Origen permitido: ${origin || "Sin origen"}`);
  } else {
    console.log(`❌ Origen no permitido: ${origin}`);
  }

  // Responder inmediatamente a las solicitudes OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Usar el middleware de CORS estándar también
app.use(cors(corsOptions));

// Configuración para manejar JSON
app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        console.error("Error al parsear JSON:", e);
        throw new Error("JSON inválido");
      }
    },
  })
);

// Configuración para manejar formularios URL-encoded
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 100000,
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// Middleware para manejar datos de formulario con archivos
app.use((req, res, next) => {
  // Asegurarse de que el body-parser no interfiera con multipart
  if (req.originalUrl.includes("/auth/register") && req.method === "POST") {
    // Permitir que multer maneje la carga de archivos
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas
app.use("/api/players", playerRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/tournaments", tournamentRoutes);

// Admin Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/players", adminPlayerRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenido a la API de PadelUP",
    status: "en funcionamiento",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    docs: "/api-docs", // Si tienes documentación con Swagger/OpenAPI
  });
});

// Manejador de errores 404
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Manejador global de errores
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Conexión DB y levantar server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = "0.0.0.0"; // Escuchar en todas las interfaces de red

connectDB()
  .then(() => {
    const server = app.listen(PORT, HOST, () => {
      const addressInfo = server.address();
      let host = "localhost";
      let port = PORT;

      if (typeof addressInfo === "string") {
        console.log(`🚀 Servidor escuchando en: ${addressInfo}`);
      } else if (addressInfo) {
        host = addressInfo.address;
        port = addressInfo.port;
        console.log(
          `🚀 Servidor escuchando en: http://${
            host === "::" ? "localhost" : host
          }:${port}`
        );

        // Mostrar la IP local para conexiones desde la red
        if (host === "0.0.0.0" || host === "::") {
          const os = require("os");
          const networkInterfaces = os.networkInterfaces();
          const addresses = [];

          for (const interfaceName in networkInterfaces) {
            for (const iface of networkInterfaces[interfaceName]) {
              // Solo direcciones IPv4 que no sean internas (no 127.0.0.1)
              if (iface.family === "IPv4" && !iface.internal) {
                addresses.push(iface.address);
              }
            }
          }

          console.log("🔗 Accesible desde la red local en:");
          addresses.forEach((ip) => {
            console.log(`   http://${ip}:${port}`);
          });
        }
      }
    });

    // Manejo de errores del servidor
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      switch (error.code) {
        case "EACCES":
          console.error(`El puerto ${PORT} requiere privilegios elevados`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(`El puerto ${PORT} ya está en uso`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Manejo de cierre de la aplicación
    process.on("SIGINT", () => {
      console.log("\n🔴 Apagando servidor...");
      server.close(() => {
        console.log("Servidor detenido");
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar a la base de datos:", error);
    process.exit(1);
  });
