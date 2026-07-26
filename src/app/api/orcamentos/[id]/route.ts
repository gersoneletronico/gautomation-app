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
  const { rows: orcRows } = await sql`SELECT * FROM orcamentos WHERE id = ${id}`;
  const orcamento = orcRows[0];
  if (!orcamento) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const { rows: itens } = await sql`
    SELECT * FROM orcamento_itens WHERE orcamento_id = ${id} ORDER BY ordem ASC, id ASC
  `;

  return NextResponse.json({ ...orcamento, itens });
}

type ItemInput = {
  cod_ncm?: string;
  descricao: string;
  fabricante?: string;
  unidade?: string;
  quantidade?: number;
  prazo_entrega?: string;
  valor_unitario?: number;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  await ensureSchema();

  const { id } = await params;
  const { rows: existingRows } = await sql`SELECT id FROM orcamentos WHERE id = ${id}`;
  if (!existingRows[0]) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const body = await req.json();
  const {
    empresa_id,
    contato_id,
    natureza,
    prazo_entrega,
    validade_proposta,
    condicoes_pagamento,
    garantia_servico,
    garantia_produto,
    desconto,
    escopo_servico,
    observacoes,
    status,
    itens = [],
  } = body;

  if (!empresa_id) {
    return NextResponse.json({ error: "Cliente é obrigatório" }, { status: 400 });
  }
  const itensValidos = (itens as ItemInput[]).filter((it) => it.descricao && it.descricao.trim());
  if (itensValidos.length === 0) {
    return NextResponse.json({ error: "Adicione ao menos um item" }, { status: 400 });
  }

  // O número do orçamento NUNCA é alterado após a criação.
  await sql`
    UPDATE orcamentos SET
      empresa_id=${empresa_id}, contato_id=${contato_id || null}, natureza=${natureza || null},
      prazo_entrega=${prazo_entrega || null}, validade_proposta=${validade_proposta || "15 DIAS"},
      condicoes_pagamento=${condicoes_pagamento || "15 DIAS DDL"}, garantia_servico=${garantia_servico || "90 DIAS"},
      garantia_produto=${garantia_produto || null}, desconto=${desconto || 0}, escopo_servico=${escopo_servico || null},
      observacoes=${observacoes || null}, status=${status || "RASCUNHO"}, updated_at=now()
    WHERE id=${id}
  `;

  await sql`DELETE FROM orcamento_itens WHERE orcamento_id = ${id}`;
  let ordem = 0;
  for (const it of itensValidos) {
    await sql`
      INSERT INTO orcamento_itens
        (orcamento_id, ordem, cod_ncm, descricao, fabricante, unidade, quantidade, prazo_entrega, valor_unitario)
      VALUES (${id}, ${ordem}, ${it.cod_ncm || null}, ${it.descricao}, ${it.fabricante || null},
              ${it.unidade || "UN"}, ${it.quantidade ?? 1}, ${it.prazo_entrega || null}, ${it.valor_unitario ?? 0})
    `;
    ordem++;
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
  await sql`DELETE FROM orcamentos WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
