import { NextRequest, NextResponse } from "next/server";
import { verifyLogin, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 });
  }
  const user = await verifyLogin(username, password);
  if (!user) {
    return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 });
  }
  await createSession(user.username);
  return NextResponse.json({ ok: true });
}
