import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { sql, ensureSchema } from "./db";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "gautomation-dev-secret-troque-em-producao"
);
const COOKIE_NAME = "gautomation_session";

export async function verifyLogin(username: string, password: string) {
  await ensureSchema();
  const { rows } = await sql<{ id: number; username: string; password_hash: string }>`
    SELECT * FROM admin_users WHERE username = ${username}
  `;
  const user = rows[0];
  if (!user) return null;
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return null;
  return { id: user.id, username: user.username };
}

export async function createSession(username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { username: string };
  } catch {
    return null;
  }
}

export async function changePassword(username: string, newPassword: string) {
  const hash = bcrypt.hashSync(newPassword, 10);
  await sql`UPDATE admin_users SET password_hash = ${hash} WHERE username = ${username}`;
}

export async function changePasswordWithVerification(
  username: string,
  currentPassword: string,
  newPassword: string
) {
  const verified = await verifyLogin(username, currentPassword);
  if (!verified) return false;
  await changePassword(username, newPassword);
  return true;
}
