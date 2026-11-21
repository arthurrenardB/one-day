import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "od_admin";
const token = () => createHash("sha256").update("oneday-admin:" + (process.env.ADMIN_PASSWORD || "")).digest("hex");

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;

export function checkPassword(pw: unknown) {
  return adminConfigured() && typeof pw === "string" && pw === process.env.ADMIN_PASSWORD;
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(COOKIE, token(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 86400,
  });
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const jar = await cookies();
  return jar.get(COOKIE)?.value === token();
}
