import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  await ensureSchema();

  const { rows: empresas } = await sql<{ id: number }>`
    SELECT * FROM empresas ORDER BY razao_social ASC
  `;
  const { rows: contatos } = await sql<{ empresa_id: number }>`
    SELECT * FROM contatos ORDER BY nome ASC
  `;

  const withContatos = empresas.map((e) => ({
    ...e,
    contatos: contatos.filter((c) => c.empresa_id === e.id),
  }));

  return NextResponse.json(withContatos);
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  await ensureSchema();

  const body = await req.json();
  const {
    razao_social,
    nome_fantasia,
    cnpj,
    ie,
    endereco,
    bairro,
    cidade,
    estado,
    cep,
    natureza,
    prazo_padrao,
    observacoes,
    contatos = [],
  } = body;

  if (!razao_social || !razao_social.trim()) {
    return NextResponse.json({ error: "Razão social é obrigatória" }, { status: 400 });
  }

  const { rows } = await sql<{ id: number }>`
    INSERT INTO empresas
      (razao_social, nome_fantasia, cnpj, ie, endereco, bairro, cidade, estado, cep, natureza, prazo_padrao, observacoes)
    VALUES (${razao_social}, ${nome_fantasia || null}, ${cnpj || null}, ${ie || null},
            ${endereco || null}, ${bairro || null}, ${cidade || null}, ${estado || null},
            ${cep || null}, ${natureza || null}, ${prazo_padrao || null}, ${observacoes || null})
    RETURNING id
  `;
  const empresaId = rows[0].id;

  for (const c of contatos as { nome: string; email?: string; telefone?: string; cargo?: string }[]) {
    if (!c.nome || !c.nome.trim()) continue;
    await sql`
      INSERT INTO contatos (empresa_id, nome, email, telefone, cargo)
      VALUES (${empresaId}, ${c.nome}, ${c.email || null}, ${c.telefone || null}, ${c.cargo || null})
    `;
  }

  return NextResponse.json({ id: empresaId }, { status: 201 });
}
