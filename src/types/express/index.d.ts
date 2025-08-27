// src/types/express/index.d.ts
import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    file?: Express.Multer.File;
    user?: {
      id: string;
      role?: string;
      [key: string]: any;
    };
  }
}
