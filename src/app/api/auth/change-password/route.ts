import { NextRequest, NextResponse } from "next/server";
import { getSession, changePasswordWithVerification } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Preencha a senha atual e a nova senha" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "A nova senha deve ter ao menos 6 caracteres" }, { status: 400 });
  }

  const ok = await changePasswordWithVerification(
    session.username as string,
    currentPassword,
    newPassword
  );
  if (!ok) {
    return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
