import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { jwtVerify } from "jose";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { ENV } from "./_core/env";
import { COOKIE_NAME } from "@shared/const";

const JWT_SECRET = new TextEncoder().encode(ENV.jwtSecret);

// Authentication middleware for upload
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ error: "Autenticação necessária" });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Attach user info to request
    (req as any).userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    // Validate file type more strictly
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido. Use: JPEG, PNG, GIF ou WebP"));
    }
  },
});

export const uploadRouter = Router();

// Protected upload endpoint - requires authentication
uploadRouter.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // Sanitize file extension
    const originalExt = req.file.originalname.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const fileExtension = allowedExtensions.includes(originalExt || "") ? originalExt : "jpg";

    const fileKey = `offers/${nanoid()}.${fileExtension}`;

    const result = await storagePut(
      fileKey,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ url: result.url, key: result.key });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
  }
});
