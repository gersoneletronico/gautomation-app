import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  await ensureSchema();

  const { id } = await params;
  const { rows: empresaRows } = await sql`SELECT * FROM empresas WHERE id = ${id}`;
  const empresa = empresaRows[0];
  if (!empresa) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const { rows: contatos } = await sql`
    SELECT * FROM contatos WHERE empresa_id = ${id} ORDER BY nome ASC
  `;

  return NextResponse.json({ ...empresa, contatos });
}

type ContatoInput = { id?: number; nome: string; email?: string; telefone?: string; cargo?: string };

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  await ensureSchema();

  const { id } = await params;
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

  await sql`
    UPDATE empresas SET
      razao_social=${razao_social}, nome_fantasia=${nome_fantasia || null}, cnpj=${cnpj || null}, ie=${ie || null},
      endereco=${endereco || null}, bairro=${bairro || null}, cidade=${cidade || null}, estado=${estado || null},
      cep=${cep || null}, natureza=${natureza || null}, prazo_padrao=${prazo_padrao || null},
      observacoes=${observacoes || null}, updated_at=now()
    WHERE id=${id}
  `;

  const { rows: existing } = await sql<{ id: number }>`
    SELECT id FROM contatos WHERE empresa_id = ${id}
  `;
  const existingIds = existing.map((r) => r.id);
  const keepIds: number[] = [];

  for (const c of contatos as ContatoInput[]) {
    if (!c.nome || !c.nome.trim()) continue;
    if (c.id && existingIds.includes(c.id)) {
      await sql`
        UPDATE contatos SET nome=${c.nome}, email=${c.email || null}, telefone=${c.telefone || null},
          cargo=${c.cargo || null}, updated_at=now()
        WHERE id=${c.id} AND empresa_id=${id}
      `;
      keepIds.push(c.id);
    } else {
      const { rows } = await sql<{ id: number }>`
        INSERT INTO contatos (empresa_id, nome, email, telefone, cargo)
        VALUES (${id}, ${c.nome}, ${c.email || null}, ${c.telefone || null}, ${c.cargo || null})
        RETURNING id
      `;
      keepIds.push(rows[0].id);
    }
  }

  const toDelete = existingIds.filter((eid) => !keepIds.includes(eid));
  for (const did of toDelete) {
    await sql`DELETE FROM contatos WHERE id = ${did}`;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  await ensureSchema();

  const { id } = await params;
  const { rows } = await sql<{ c: number }>`
    SELECT COUNT(*)::int as c FROM orcamentos WHERE empresa_id = ${id}
  `;
  if (rows[0].c > 0) {
    return NextResponse.json(
      { error: "Não é possível excluir: cliente possui orçamentos vinculados." },
      { status: 409 }
    );
  }
  await sql`DELETE FROM empresas WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
