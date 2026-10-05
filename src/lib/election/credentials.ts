import "server-only";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";

// No 0/o, 1/l/i: easy to read off a printed sheet or WhatsApp message.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generatePassword() {
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

export function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,39}$/;
