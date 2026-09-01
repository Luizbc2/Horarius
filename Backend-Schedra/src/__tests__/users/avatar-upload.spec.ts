import express from "express";
import multer from "multer";
import request from "supertest";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import sharp from "sharp";

import {
  AVATAR_MAX_FILE_SIZE,
  InvalidAvatarFileError,
  InvalidAvatarContentError,
  buildAvatarFilename,
  createAvatarUpload,
  isAllowedAvatarFile,
  processAvatar,
} from "../../modules/users/upload/avatar-upload";

describe("avatar upload", () => {
  it.each([
    ["avatar.jpg", "image/jpeg"],
    ["avatar.JPEG", "image/jpeg"],
    ["avatar.png", "image/png"],
    ["avatar.webp", "image/webp"],
  ])("aceita extensao e MIME compativeis: %s", (originalname, mimetype) => {
    expect(isAllowedAvatarFile({ originalname, mimetype })).toBe(true);
  });

  it.each([
    ["avatar.exe", "image/jpeg"],
    ["avatar.png", "image/jpeg"],
    ["avatar.jpg", "application/pdf"],
    ["avatar", "image/jpeg"],
  ])("rejeita arquivo invalido ou extensao forjada: %s", (originalname, mimetype) => {
    expect(isAllowedAvatarFile({ originalname, mimetype })).toBe(false);
  });

  it("gera nomes unicos e preserva somente a extensao validada", () => {
    const names = new Set(Array.from({ length: 100 }, () => buildAvatarFilename("foto.PNG")));
    expect(names.size).toBe(100);
    expect([...names].every((name) => /^user-\d+-[\da-f-]+\.png$/.test(name))).toBe(true);
  });

  it("configura o limite oficial em 5 MB", () => {
    expect(AVATAR_MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  it("bloqueia arquivo maior que o limite antes do controlador", async () => {
    const app = express();
    const upload = createAvatarUpload(multer.memoryStorage(), 8);
    app.post("/avatar", (req, res) => upload.single("avatar")(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) return res.status(413).json({ code: error.code });
      return res.status(204).end();
    }));

    const response = await request(app)
      .post("/avatar")
      .attach("avatar", Buffer.alloc(9), { filename: "avatar.jpg", contentType: "image/jpeg" });

    expect(response.status).toBe(413);
    expect(response.body.code).toBe("LIMIT_FILE_SIZE");
  });

  it("devolve erro explicito para arquivo com extensao proibida", async () => {
    const app = express();
    const upload = createAvatarUpload(multer.memoryStorage());
    app.post("/avatar", (req, res) => upload.single("avatar")(req, res, (error: unknown) => {
      if (error instanceof InvalidAvatarFileError) return res.status(415).json({ message: error.message });
      return res.status(204).end();
    }));

    const response = await request(app)
      .post("/avatar")
      .attach("avatar", Buffer.from("not-an-image"), { filename: "avatar.exe", contentType: "image/jpeg" });

    expect(response.status).toBe(415);
    expect(response.body.message).toContain("JPG, PNG ou WEBP");
  });

  it("detecta conteúdo forjado mesmo com nome e MIME permitidos", async () => {
    await expect(processAvatar({
      buffer: Buffer.from("not-an-image"),
      originalname: "avatar.jpg",
      mimetype: "image/jpeg",
    } as Express.Multer.File, 1)).rejects.toBeInstanceOf(InvalidAvatarContentError);
  });

  it("decodifica e reencoda o avatar como WEBP seguro", async () => {
    const outputDirectory = await fs.promises.mkdtemp(path.join(os.tmpdir(), "schedra-avatar-"));
    const buffer = await sharp({ create: { width: 32, height: 32, channels: 3, background: "#E25587" } })
      .png()
      .toBuffer();
    const avatarUrl = await processAvatar({
      buffer,
      originalname: "avatar.png",
      mimetype: "image/png",
    } as Express.Multer.File, 99, outputDirectory);

    try {
      const encodedAvatar = await fs.promises.readFile(path.join(outputDirectory, path.basename(avatarUrl)));
      const metadata = await sharp(encodedAvatar).metadata();
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBeLessThanOrEqual(512);
      expect(metadata.height).toBeLessThanOrEqual(512);
      expect(metadata.exif).toBeUndefined();
    } finally {
      await fs.promises.rm(outputDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  });
});
