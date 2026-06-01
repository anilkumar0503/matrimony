import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY not set");
  return Buffer.from(key, "hex");
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, tagHex, dataHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final("utf8");
}

export function hashPassword(password: string): Promise<string> {
  const bcrypt = require("bcryptjs");
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require("bcryptjs");
  return bcrypt.compare(password, hash);
}

export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}
