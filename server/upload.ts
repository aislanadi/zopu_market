import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas"));
    }
  },
});

export const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const fileExtension = req.file.originalname.split(".").pop();
    const fileKey = `offers/${nanoid()}.${fileExtension}`;

    const result = await storagePut(
      fileKey,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ url: result.url, key: result.key });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
  }
});
