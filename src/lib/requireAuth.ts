import { NextResponse } from "next/server";
import { getSession } from "./auth";

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  return null;
}
