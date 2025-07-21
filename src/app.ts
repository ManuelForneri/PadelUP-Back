import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import playerRoutes from "./routes/player.routes";
import voteRoutes from "./routes/vote.route";

dotenv.config();
const app = express();

// Aumentar el tiempo de espera de las solicitudes
export const REQUEST_TIMEOUT = 30000; // 30 segundos

// Configuración de CORS
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Permitir solicitudes sin origen (como aplicaciones móviles o Postman)
    if (!origin) {
      console.log("✅ Solicitud sin origen (aplicación móvil)");
      return callback(null, true);
    }

    // Lista de orígenes permitidos
    const allowedOrigins = [
      "http://localhost:8081", // URL de Expo Web
      "http://localhost:19000", // URL de Expo
      "http://localhost:3000", // React dev server
      "http://localhost:5000", // Backend
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/, // Cualquier IP local
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/, // IPs privadas
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/, // Más IPs privadas
      /^https?:\/\/([a-z0-9]+[.])*padel-sag\.com$/, // Dominio de producción
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
      return callback(null, true);
    } else {
      console.log(`❌ Origen no permitido: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Accept-Encoding",
    "Content-Length",
    "Origin",
    "X-Requested-With",
    "X-Access-Token",
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  credentials: true,
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Middlewares
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

// Rutas de jugadores
app.use("/api/players", playerRoutes);

//ruta de votos
app.use("/api/vote", voteRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenido a la API de PadelSAG",
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
