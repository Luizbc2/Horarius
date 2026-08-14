import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { RequestHandler } from "express";
import multer, { type FileFilterCallback, type Multer, type StorageEngine } from "multer";

export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedAvatarTypes = new Map<string, ReadonlySet<string>>([
  [".jpg", new Set(["image/jpeg"])],
  [".jpeg", new Set(["image/jpeg"])],
  [".png", new Set(["image/png"])],
  [".webp", new Set(["image/webp"])],
]);

export class InvalidAvatarFileError extends Error {
  constructor() {
    super("Envie uma imagem JPG, PNG ou WEBP valida.");
    this.name = "InvalidAvatarFileError";
  }
}

export const getAvatarExtension = (originalName: string): string =>
  path.extname(originalName).toLowerCase();

export const isAllowedAvatarFile = (file: Pick<Express.Multer.File, "originalname" | "mimetype">): boolean => {
  const acceptedMimeTypes = allowedAvatarTypes.get(getAvatarExtension(file.originalname));
  return acceptedMimeTypes?.has(file.mimetype.toLowerCase()) ?? false;
};

export const buildAvatarFilename = (originalName: string): string =>
  `user-${Date.now()}-${randomUUID()}${getAvatarExtension(originalName)}`;

export const createAvatarUpload = (
  storage: StorageEngine,
  maxFileSize = AVATAR_MAX_FILE_SIZE,
): Multer => multer({
  storage,
  limits: { fileSize: maxFileSize, files: 1 },
  fileFilter: (_request, file, callback: FileFilterCallback) => {
    if (!isAllowedAvatarFile(file)) {
      callback(new InvalidAvatarFileError());
      return;
    }

    callback(null, true);
  },
});

export const avatarDirectory = path.resolve(process.cwd(), "uploads", "avatars");
fs.mkdirSync(avatarDirectory, { recursive: true });

export const avatarUpload = createAvatarUpload(multer.diskStorage({
  destination: avatarDirectory,
  filename: (_request, file, callback) => callback(null, buildAvatarFilename(file.originalname)),
}));

export const uploadAvatarSingle: RequestHandler = (request, response, next) => {
  avatarUpload.single("avatar")(request, response, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      response.status(413).json({ message: "A imagem deve ter no maximo 5 MB." });
      return;
    }

    if (error instanceof InvalidAvatarFileError) {
      response.status(400).json({ message: error.message });
      return;
    }

    response.status(400).json({ message: "Nao foi possivel processar a imagem enviada." });
  });
};
