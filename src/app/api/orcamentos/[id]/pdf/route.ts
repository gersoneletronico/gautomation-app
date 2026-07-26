import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import path from "path";
import fs from "fs";
import { sql, ensureSchema } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import OrcamentoPdf, { OrcamentoPdfData } from "@/lib/pdf/OrcamentoPdf";
import React from "react";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  await ensureSchema();

  const { id } = await params;
  const { rows: orcRows } = await sql`SELECT * FROM orcamentos WHERE id = ${id}`;
  const orcamento = orcRows[0] as Record<string, unknown> | undefined;
  if (!orcamento) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const { rows: empresaRows } = await sql`
    SELECT * FROM empresas WHERE id = ${orcamento.empresa_id as number}
  `;
  const empresa = empresaRows[0] as Record<string, unknown>;

  let contato: Record<string, unknown> | undefined;
  if (orcamento.contato_id) {
    const { rows } = await sql`SELECT * FROM contatos WHERE id = ${orcamento.contato_id as number}`;
    contato = rows[0] as Record<string, unknown> | undefined;
  }

  const { rows: itens } = await sql`
    SELECT * FROM orcamento_itens WHERE orcamento_id = ${id} ORDER BY ordem ASC, id ASC
  `;

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoBuffer = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : undefined;

  const data: OrcamentoPdfData = {
    numero: orcamento.numero as string,
    data_emissao: orcamento.data_emissao as string,
    natureza: orcamento.natureza as string | null,
    prazo_entrega: orcamento.prazo_entrega as string | null,
    validade_proposta: orcamento.validade_proposta as string | null,
    condicoes_pagamento: orcamento.condicoes_pagamento as string | null,
    garantia_servico: orcamento.garantia_servico as string | null,
    garantia_produto: orcamento.garantia_produto as string | null,
    desconto: Number(orcamento.desconto) || 0,
    escopo_servico: orcamento.escopo_servico as string | null,
    observacoes: orcamento.observacoes as string | null,
    empresa: {
      razao_social: empresa.razao_social as string,
      cnpj: empresa.cnpj as string | null,
      ie: empresa.ie as string | null,
      endereco: empresa.endereco as string | null,
      bairro: empresa.bairro as string | null,
      cidade: empresa.cidade as string | null,
      estado: empresa.estado as string | null,
      cep: empresa.cep as string | null,
    },
    contato: contato
      ? {
          nome: contato.nome as string,
          email: contato.email as string | null,
          telefone: contato.telefone as string | null,
        }
      : null,
    itens: (itens as Record<string, unknown>[]).map((it) => ({
      cod_ncm: it.cod_ncm as string | null,
      descricao: it.descricao as string,
      fabricante: it.fabricante as string | null,
      unidade: it.unidade as string | null,
      quantidade: Number(it.quantidade) || 0,
      prazo_entrega: it.prazo_entrega as string | null,
      valor_unitario: Number(it.valor_unitario) || 0,
    })),
    logoBuffer,
  };

  const buffer = await renderToBuffer(
    React.createElement(OrcamentoPdf, { data }) as Parameters<typeof renderToBuffer>[0]
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orcamento-${data.numero}.pdf"`,
    },
  });
}
