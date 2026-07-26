import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { gerarNumeroOrcamento } from "@/lib/numero";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  await ensureSchema();

  const { rows } = await sql`
    SELECT o.id, o.numero, o.status, o.data_emissao, o.created_at,
           e.razao_social, c.nome as contato_nome, c.email as contato_email
    FROM orcamentos o
    JOIN empresas e ON e.id = o.empresa_id
    LEFT JOIN contatos c ON c.id = o.contato_id
    ORDER BY o.id DESC
  `;

  return NextResponse.json(rows);
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

export async function POST(req: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  await ensureSchema();

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
    itens = [],
  } = body;

  if (!empresa_id) {
    return NextResponse.json({ error: "Cliente é obrigatório" }, { status: 400 });
  }
  const itensValidos = (itens as ItemInput[]).filter((it) => it.descricao && it.descricao.trim());
  if (itensValidos.length === 0) {
    return NextResponse.json({ error: "Adicione ao menos um item" }, { status: 400 });
  }

  const now = new Date();
  const numero = gerarNumeroOrcamento(now);
  const dataEmissao = now.toISOString().slice(0, 10);

  const { rows } = await sql<{ id: number }>`
    INSERT INTO orcamentos
      (numero, empresa_id, contato_id, natureza, data_emissao, prazo_entrega,
       validade_proposta, condicoes_pagamento, garantia_servico, garantia_produto,
       desconto, escopo_servico, observacoes, status)
    VALUES (${numero}, ${empresa_id}, ${contato_id || null}, ${natureza || null}, ${dataEmissao},
       ${prazo_entrega || null}, ${validade_proposta || "15 DIAS"}, ${condicoes_pagamento || "15 DIAS DDL"},
       ${garantia_servico || "90 DIAS"}, ${garantia_produto || null}, ${desconto || 0},
       ${escopo_servico || null}, ${observacoes || null}, 'RASCUNHO')
    RETURNING id
  `;
  const orcamentoId = rows[0].id;

  let ordem = 0;
  for (const it of itensValidos) {
    await sql`
      INSERT INTO orcamento_itens
        (orcamento_id, ordem, cod_ncm, descricao, fabricante, unidade, quantidade, prazo_entrega, valor_unitario)
      VALUES (${orcamentoId}, ${ordem}, ${it.cod_ncm || null}, ${it.descricao}, ${it.fabricante || null},
              ${it.unidade || "UN"}, ${it.quantidade ?? 1}, ${it.prazo_entrega || null}, ${it.valor_unitario ?? 0})
    `;
    ordem++;
  }

  return NextResponse.json({ id: orcamentoId, numero }, { status: 201 });
}
