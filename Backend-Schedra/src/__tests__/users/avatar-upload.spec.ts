import express from "express";
import multer from "multer";
import request from "supertest";

import {
  AVATAR_MAX_FILE_SIZE,
  InvalidAvatarFileError,
  buildAvatarFilename,
  createAvatarUpload,
  isAllowedAvatarFile,
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
      if (error instanceof InvalidAvatarFileError) return res.status(400).json({ message: error.message });
      return res.status(204).end();
    }));

    const response = await request(app)
      .post("/avatar")
      .attach("avatar", Buffer.from("not-an-image"), { filename: "avatar.exe", contentType: "image/jpeg" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("JPG, PNG ou WEBP");
  });
});
