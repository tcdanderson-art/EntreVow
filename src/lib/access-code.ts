import { randomBytes } from "crypto";

// URL-safe, short enough to share in a text message
export function generateAccessCode() {
  return randomBytes(6).toString("base64url");
}
